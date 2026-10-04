---
title: Azure Startup Tasks – Running as Administrator
description: Azure role startup configuration affects IIS administration. An OnStart
  impersonation example and a later elevated Runtime update explain the approaches
  explored.
datePublished: '2012-05-01'
dateModified: '2012-05-01'
tags:
- azure
- windows-impersonation
- iis
- csharp
hero: azure-startup-tasks-running-as-administrator
draft: false
---

There are many ways in which to implement Startup tasks for your Web and Worker Roles in Azure. However, contrary to what is commonly understood, none of them runs as Administrator or administrative privileges. Yup, that’s right, none of them.

The misunderstanding stems from the word “elevated”. People assume this means “As Administrator”. However, it should be noted that in Azure, Startup Tasks run as the local SYSTEM account. The SYSTEM account is a much more “powerful” account but is not “Administrator”.

Now there are times when you need actual administrative privileges when you run your startup tasks. For example, if you need to configure IIS using either [appcmd](https://web.archive.org/web/20240915034619/http://learn.iis.net/page.aspx/114/getting-started-with-appcmdexe/) or [ServerManager](https://web.archive.org/web/20240915034619/http://msdn.microsoft.com/en-us/library/microsoft.web.administration.servermanager(v=vs.90).aspx), you’ll need administrative privileges. It seems that (For some reason) the SYSTEM user is not good enough for appcmd.

### Update: You don't need to use the Impersonation class presented here

Since writing this post, I've learned that one can modify the ServiceDefinition.csdef file to include



```text
<Runtime executionContext="elevated">
```



The <code>Runtime</code> element is a child element of the <code>WebRole</code> element. I've tested this out and it works. So it appears that “elevated” in is in fact “Administrative privileges”, however, when I check the user, it says “SYSTEM”.

So you don’t need to set up your project to Enable Remote Desktop either. I’ve not tested this, but it would work, since I’ve tested it without impersonation.

Note, that running AppCmd jobs in Startup>Task still does not work.

## AppCmd Anomalies

There are some operations that do work with elevated privileges (and don’t require administrative privileges). For example you can create Application Pools and configure them, but you can’t list all Websites (quite weird really) . What actually happens is that the list of website’s is empty. That is there are no websites defined (which obviously is not the case here, since this is a WebRole). So this whole this is just a mystery to me!

In one of my projects I needed to set up an Azure WebRole instance to run ISAPI applications and this entailed modifying IIS settings including:

1\. Getting a list of existing websites (so as to get at the physical path of the configured website. The one and only website configured for the WebRole)

2\. Creating a specialized application pool for ISAPI applications

3\. Creating an IIS “Application” (and physical folder) under the default website

4\. Modifying the CgiIsapiRestrictions for the website

5\. Giving the IIS “Application” “Execeute” permission

Some of these steps would work and some would not. I struggled with this for a whole day and a half, trying various combinations of things, including impersonating the administrator (after I confirmed that the user executing the start up tasks is in fact the local SYSTEM user and Not Administrator).

## Executing Startup Tasks as Administrator

If you’re reading this, you’ve probably struggled with this for a bit so I’ll keep this as short as possible.

You MUST use the <code>OnStart() </code>method of the class that descends from <code>RoleEntryPoint</code>. This class is typically created for you when you add a new WebRole or WorkerRole to your Azure project. If you’ve added an existing Web project to your Azure project, you can simply add a new class to your Web site project and call it <code>WebRole.cs </code>(The name is not important) and have the class descend from <code>RoleEntryPoint</code> and override the <code>OnStart()</code> method as shown in the listing below.

The point is that you **can not** use (for some reason) batch files or executable files (and configure your Startup>Tasks section in your ServiceDefinition.csdef to execute them. Attempting to impersonate an administrator in these tasks does not throw exceptions, but if your task requires administrative privileges, it will not work. This is a complete mystery to me. However, ***using the OnStart() method along with impersonation works!***

### WebRole.cs



```csharp
using Microsoft.WindowsAzure.ServiceRuntime;

namespace AzureWebRole.EntryPoint
{
    public class WebRole : RoleEntryPoint
    {
        public override bool OnStart()
        {
            using (var impersonation = new MsImpersonation("", "adminUser", "adminPassword", LogonSessionType.LOGON32_LOGON_BATCH))
            {
                // Do your impersonated work here
            }
            return base.OnStart();
        }
    }
}
```



### The RoleEntryPoint descendant class

The code listing above shows such a class. In the overridden <code>OnStart() </code>method, you’ll see that I’m impersonating an administrator and then doing some work that needs administrative privileges.

## Impersonating Administrator in a WebRole EntryPoint

The class presented below helps with impersonating a Windows user. You can see it in use in the code listing above.

But the question is, how do you get the name and password of an administrator in a Azure built Virtual Machine? Well, we use a little trick here. When you publish your project to Azure, you’ll need to “Enable Remote Desktop” for all roles in the **Publish Windows Azure Application** wizard (screen shot show after the code listing below).

### MsImpersonation.cs



```csharp
using System;
using System.Runtime.InteropServices;
using System.Security.Principal;
using System.Security.Permissions;
using System.ComponentModel;

namespace Matlus.Security
{
    public enum LogonSessionType
    {
        LOGON32_LOGON_INTERACTIVE = 2,
        LOGON32_LOGON_NETWORK = 3,
        LOGON32_LOGON_BATCH = 4,
        LOGON32_LOGON_SERVICE = 5,
        LOGON32_LOGON_UNLOCK = 7,
         
        /// Only valid in Windows 2000 and higher
        /// 
        LOGON32_LOGON_NETWORK_CLEARTEXT = 8,
         
        /// Only valid in Windows 2000 and higher
        /// 
        LOGON32_LOGON_NEW_CREDENTIALS = 9
    }

    public enum LogonProvider
    {
        LOGON32_PROVIDER_DEFAULT = 0,
        LOGON32_PROVIDER_WINNT35 = 1,
        LOGON32_PROVIDER_WINNT40 = 2,
        LOGON32_PROVIDER_WINNT50 = 3
    }

    public enum ImpersonationLevel
    {
        SecurityAnonymous = 0,
        SecurityIdentification = 1,
        SecurityImpersonation = 2,
        SecurityDelegation = 3
    }

     
    /// This class enables Loggin On and impersonating a specific user.
    /// Assembly level attributes are required in order to use this class. These attributes
    /// are typically added in the AssemblyInfo.cs file
    /// [assembly:SecurityPermissionAttribute(SecurityAction.RequestMinimum, UnmanagedCode=true)]
    /// [assembly:PermissionSetAttribute(SecurityAction.RequestMinimum, Name = "FullTrust")]
    /// 
    public class MsImpersonation : IDisposable
    {
        private IntPtr tokenHandle = new IntPtr(0);
        private IntPtr dupeTokenHandle = new IntPtr(0);
        private WindowsImpersonationContext windowsImpersonationContext;

        private bool disposed;

        [DllImport("advapi32.dll", SetLastError = true)]
        public static extern bool LogonUser(String lpszUsername, String lpszDomain, String lpszPassword,
          int dwLogonType, int dwLogonProvider, ref IntPtr phToken);

        [DllImport("kernel32.dll", CharSet = CharSet.Auto)]
        public static extern bool CloseHandle(IntPtr handle);

        [DllImport("advapi32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        public static extern bool DuplicateToken(IntPtr ExistingTokenHandle,
          int SECURITY_IMPERSONATION_LEVEL, ref IntPtr DuplicateTokenHandle);

        public MsImpersonation(string domain, string userName, string password, LogonSessionType logOnSessionType)
        {
            LogOnAndImpersonateUser(domain, userName, password, logOnSessionType);
        }

        public MsImpersonation(string domain, string userName, string password, LogonSessionType logOnSessionType, LogonProvider logonProvider)
        {
            LogOnAndImpersonateUser(domain, userName, password, logOnSessionType, logonProvider);
        }

        [PermissionSetAttribute(SecurityAction.Demand, Name = "FullTrust")]
        private void LogOnAndImpersonateUser(string domain, string userName, string password, LogonSessionType logOnSessionType)
        {
            LogOnAndImpersonateUser(domain, userName, password, logOnSessionType, LogonProvider.LOGON32_PROVIDER_DEFAULT);
        }

        [PermissionSetAttribute(SecurityAction.Demand, Name = "FullTrust")]
        private void LogOnAndImpersonateUser(string domain, string userName, string password, LogonSessionType logOnSessionType, LogonProvider logonProvider)
        {
            tokenHandle = IntPtr.Zero;
            dupeTokenHandle = IntPtr.Zero;

            RevertToSelf();

            bool returnValue = LogonUser(userName, domain, password, (int)logOnSessionType, (int)logonProvider, ref tokenHandle);
            if (!returnValue)
                throw new Win32Exception(Marshal.GetLastWin32Error());
            try
            {
                bool retVal = DuplicateToken(tokenHandle, (int)ImpersonationLevel.SecurityImpersonation, ref dupeTokenHandle);
                if (!retVal)
                {
                    CloseHandle(tokenHandle);
                    throw new Win32Exception(Marshal.GetLastWin32Error());
                }
                WindowsIdentity windowsIdentity = new WindowsIdentity(dupeTokenHandle);
                windowsImpersonationContext = windowsIdentity.Impersonate();
            }
            catch
            {
                if (tokenHandle != IntPtr.Zero)
                    CloseHandle(tokenHandle);
            }
            finally
            {
                if (tokenHandle != IntPtr.Zero)
                    CloseHandle(tokenHandle);
                if (dupeTokenHandle != IntPtr.Zero)
                    CloseHandle(dupeTokenHandle);
            }
        }

        [PermissionSetAttribute(SecurityAction.Demand, Name = "FullTrust")]
        private void RevertToSelf()
        {
            if (windowsImpersonationContext != null)
            {
                windowsImpersonationContext.Undo();
                windowsImpersonationContext.Dispose();
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        private void Dispose(bool disposing)
        {
            if (!disposed && disposing)
            {
                RevertToSelf();
                disposed = true;
            }
        }
    }
}
```



### The Impersonation class

Make sure you check the checkbox highlighted in the image below and click on the “Settings&#8230;” link. You will be presented with a dialog wherein you can provide a username and password for an administrator. This is the same username and password you will use to logon and impersonate in your WebRole EntryPoint code listing above.



<figure data-recovered-figure="figure-01">
<a href="/images/writing/azure-startup-tasks-running-as-administrator/figure-01.webp"><img src="/images/writing/azure-startup-tasks-running-as-administrator/figure-01.webp" alt="Conceptual reconstruction of the Remote Desktop configuration described in the article, including its later Runtime correction." loading="lazy" /></a>
<figcaption data-reconstruction>Illustrated reconstruction. Conceptual reconstruction of the Remote Desktop configuration described in the article, including its later Runtime correction.</figcaption>
</figure>



Just to be clear, remote desktop users are administrators and enabling remote desktop for your Azure application tells Azure to create a new Windows user with the username and password you provided and add the user to the Administrator’s group. So once a Virtual Machine spins up, a user with the provided credentials will be created for you. So by the time your OnStart() method executes, the admin user is valid.
