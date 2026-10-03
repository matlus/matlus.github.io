---
title: Setting up IIS 7.0 - Ftp 7.5 for IIS Manager Users
description: IIS FTP 7.5 can authenticate IIS Manager Users with isolated directories.
  Folder permissions, provider settings, and C# user creation complete the setup.
datePublished: '2010-08-29'
dateModified: '2026-10-03'
tags:
- iis
- ftp
- authentication
- csharp
hero: iis-manager-users
draft: false
---



<figure data-recovered-figure="figure-01">
<a href="/images/writing/iis-manager-users/figure-01.webp"><img src="/images/writing/iis-manager-users/figure-01.webp" alt="IIS 7 server and user-account cards illustrate the article about IIS Manager Users." loading="lazy" /></a>
<figcaption data-reconstruction>New artwork replacing the original IIS 7 welcome graphic.</figcaption>
</figure>



This tutorial is about setting up IIS Ftp 7.5 using IIS Manger Users under Window 7 or Windows 2008. I also assume you want to use User Isolation of "User name directory" or similar. The documentation I have found has been scarce or incomplete. Note that this tutorial is not about showing you how to use the IIS Management UI for IIS 7.0. I assume you know how to use the IIS Management UI for IIS 7.0

## Setting up an Ftp Site

Make sure you've installed [Ftp 7.5](https://web.archive.org/web/20240415161506/http://learn.iis.net/page.aspx/310/what-is-new-for-microsoft-and-ftp-75/) for your operating system (32bit or 64 bit). Then set up an Ftp site. you can find step by step instructions here [Creating a New FTP Site](https://web.archive.org/web/20240415161506/http://learn.iis.net/page.aspx/301/creating-a-new-ftp-site/). It's not the greatest tutorial but it should work.
## User Isolation

Besides, actually setting up user isolation using the UI in IIS Manager, you also need to create a few folders and then give the user NetworkService the proper rights to these folders and to the IIS config files. You need to create the following folders as sub folder of your Ftp site's root folder. First create a folder called <code><strong>LocalUser</strong></code>. Then under <code><strong>LocalUser</strong></code>, create a folder called <code><strong>public</strong></code> Under <code><strong>LocalUser</strong></code> again, create a folder with the name of the username of a windows user on the machine. You'll use this to test the ftp site. In order to test with a windows user, you also need to have Basic Authentication turned on for your ftp site. Do this using the Ftp Authentication icon for the Ftp site you created.
## Setting up the correct permissions

To grant Special permissions to the user NetworkService to the Ftp Root folder (using a command prompt): 
### Command line



```text
CACLS "%SystemDrive%\inetpub\ftproot" /G "Network Service":C /T /E

Next the user NetworkService needs to be given permission to the config
folder and two config files.

CACLS "%SystemDrive%\Windows\System32\inetsrv\config" /G "Network Service":R /E

CACLS "%SystemDrive%\Windows\System32\inetsrv\config\administration.config" /G "Network Service":R /E

CACLS "%SystemDrive%\Windows\System32\inetsrv\config\redirection.config" /G "Network Service":R /E
```



Now you should be able to log on to the ftp site you created using the credentials of a windows user.
## IIS Manager Authentication

For Windows Server 2008 you can follow this tutorial in order to configure Ftp with IIS Manager Authentication [Configure FTP with IIS 7.0 Manager Authentication](https://web.archive.org/web/20240415161506/http://learn.iis.net/page.aspx/321/configure-ftp-with-iis-7-manager-authentication/) Windows 7 does not have the IIS Manager Users UI that is available in Windows Server 2008. The other issue is that you can't simply modify the administration.config file because the password is normally saved in a hashed format. But you can create IIS Manager Users using Managed Code. Below is a simple method you can add to your class of choice. In order for this code to work a few references need to be added to your project. Add the following Reference Path to your project C:\Windows\System32\inetsrv\ Then added the following References: Microsoft.Web.Administration Microsoft.Web.Management Next, add the following namespaces using Microsoft.Web.Management.Server; using Microsoft.Web.Administration;
### Code Listing



```csharp
    /// <summary>
    /// This method creates an Ftp User under IIS 7.0 & Ftp 7.5
    /// </summary>
    /// <param name="configurationPath">This is the name of the Ftp site.
    /// So you if called your Ftp site "Default Ftp Site", then pass in this string as the first parameter</param>
    /// <param name="username">The username of the new user you want to create</param>
    /// <param name="password">The password for the new user </param>
    private static void CreateFtpUser(string configurationPath, string username, string password)
    {
      /* Step 1 */
      /*  We only need to create a user with password if the Intent is to use IisManagerUser Authentication provider */
      /*  If we want to use our own Custom Authentication Provider we skip this step and only do the next step */
      /*  Create the User for the ftp site */
      ManagementUserInfo userInfo = ManagementAuthentication.CreateUser(username, password);
      ManagementAuthorization.Grant(userInfo.Name, configurationPath, false);

      /* Step 2 */
      /* Set up the permissions for this user (Read/Write) */
      using (ServerManager serverManager = new ServerManager())
      {
        Configuration config = serverManager.GetApplicationHostConfiguration();
        ConfigurationSection authorizationSection = config.GetSection("system.ftpServer/security/authorization", configurationPath);

        ConfigurationElementCollection authorizationCollection = authorizationSection.GetCollection();
        ConfigurationElement addElement = authorizationCollection.CreateElement("add");
        addElement["accessType"] = @"Allow";
        addElement["users"] = username;
        addElement["permissions"] = @"Read, Write";
        authorizationCollection.Add(addElement);
        serverManager.CommitChanges();
      }
    }
```



Be sure to create a sub folder under the <code>LocalUser</code> folder (under your ftp site's root folder)for the users you create using the code above. The username of the user and the folder name should be the same. In order to be able to use IIS Manager Users with your Ftp site, you need to have the IISManagerAuth provider enabled for your Ftp site. Do this using the Ftp Authentication icon for your Ftp site and choose Custom Providers... from the actions pane. At this point, you should be able to log in to your Ftp site using the users you've created using either IIS Manager Users UI or the managed code provided above.
