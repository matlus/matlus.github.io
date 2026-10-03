---
title: Installing MSMQ in an Azure WebRole instance
description: Use a local MSMQ queue to move large-file processing out of an Azure
  WebRole request, then install the queue service with a startup task and deploy its
  batch file.
datePublished: '2012-05-01'
dateModified: '2026-10-03'
tags:
- azure
- msmq
- background-processing
hero: installing-msmq-in-an-azure-webrole-instance
draft: false
---

In this post, we’ll take a look at installing MSMQ in an Azure WebRole (or WorkerRole) instance. Of course immediately, you’re asking, WHY?

The knee-jerk reaction I’m sure most people will have goes something like:

1\. Use Storage Queues or ServiceBus Queues/Topics, they are durable, available

2\. Remember, your instance can “fail” at any time, so you can’t rely on “state”

3\. On, and on&#8230;..

The list is long. However, there are times when none of those reason apply, or even given the above valid reasons, one could still have a (damn) good reason for using a “local” queue for interim work so as to off load the work from the main role (typically the WebRole).

## Why use MSMQ when using Azure

Here is one scenario I believe justifies this need. You have a website (a WebRole) that allows members to upload large video files. These files can be over 2GB in size. The typical sequence of steps would be:

1\. Receive the file

2\. Move it to blob storage

3\. Save the “record” to table storage or Sql Azure as the case may be

4\. Respond to the user

These steps are depicted in the image below



<figure data-recovered-figure="figure-01">
<a href="/images/writing/installing-msmq-in-an-azure-webrole-instance/figure-01.webp"><img src="/images/writing/installing-msmq-in-an-azure-webrole-instance/figure-01.webp" alt="Reconstructed from the surviving text: the request remains occupied while the file and its record are stored." loading="lazy" /></a>
<figcaption data-reconstruction>Illustrated reconstruction. Reconstructed from the surviving text: the request remains occupied while the file and its record are stored.</figcaption>
</figure>



**Option1: Do all of the required work while holding on to the Request and then respond**

In high traffic sites, you may will want to respond to the user as soon as the file is received by the server, and do the rest of the processing, "out-of-band” (that is not in “this” process. In this case the web site process), so you free the (Request) thread sooner. This (Seemingly) small change has huge benefits to the scalability of your website.

The image below depicts the process flow and steps.



<figure data-recovered-figure="figure-02">
<a href="/images/writing/installing-msmq-in-an-azure-webrole-instance/figure-02.webp"><img src="/images/writing/installing-msmq-in-an-azure-webrole-instance/figure-02.webp" alt="Reconstructed from the surviving text: WebRole, MSMQ, and the Message Processor share one VM; the queue message carries the local file path." loading="lazy" /></a>
<figcaption data-reconstruction>Illustrated reconstruction. Reconstructed from the surviving text: WebRole, MSMQ, and the Message Processor share one VM; the queue message carries the local file path.</figcaption>
</figure>



**Option 2: Do all of the work “out-of-band” and respond to the Request immediately**

What’s going on here is no different from any well designed web application. That is, any potentially long running process is done “out-of-band”, rather than in the web application process. In the image above, all processes and steps marked in blue are performed “out-of-band” from the main web application.

The main web application simply posted a message in the local queue and continued on. The message contains all of the information the Message Processor (above) will need in order to finish the rest of the step. The message contains the path to the physical file location (and not the file itself) on the local system.

The main driver for this design, is the time it would take for the web role to upload the received (large) file to blob storage so other parts of the system can then act on it. Here, we’ve off loaded that work to the Message Processor.

Note that the bluish-grey dotted lined box in the image above depicts the virtual machine instance. That is the WebRole, the MSMQ service and the Message Processor executable are all running on the same instance.

## Installing MSMQ on Azure

Once you’re convinced or can justify using MSMQ on your Azure WebRole instances, installing MSMQ using a Startup task, it turns out, is a piece of cake.

In your WebRole’s (or WorkerRole’s) <code>SeviceDefinition.csdef </code>file, you’ll need to add a <code>Startup</code> node and child <code>Task</code> node as shown below.

### ServiceDefinition.csdef



```xml
<?xml version="1.0" encoding="utf-8"?>
<ServiceDefinition name="SomeRoleName" xmlns="http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceDefinition">
  <WebRole name="StandInWebRole" vmsize="Small">
    <Sites>
      <Site name="Web">
        <Bindings>
          <Binding name="Endpoint1" endpointName="Endpoint1" />
        </Bindings>
      </Site>
    </Sites>
    <Endpoints>
      <InputEndpoint name="Endpoint1" protocol="http" port="80" />
    </Endpoints>
    <Startup>
      <Task commandLine="..\startup\InstallMSMQ.cmd" executionContext="elevated" taskType="simple" />      
    </Startup>
    <Certificates>
    </Certificates>
  </WebRole>
</ServiceDefinition>
```



### Service Definition File of the Worker Role

the <code>commandLine </code>attribute of the <code>Task</code> node points to a batch file. In my Website project, I have a folder called <code>startup</code> and the batch file is in this folder.

The taskType attribute has its value set to simple. This indicated that the task is a “blocking” task. That is your WebRole won’t start until this task has completed. Which is how you want it in this case.

The content of the batch file is show below:



```text
ocsetup MSMQ-Server
```



That’s it. You can read more about enabling MSMQ at the link below.

[Enable Microsoft Message Queuing (MSMQ)](https://web.archive.org/web/20240911171330/http://technet.microsoft.com/en-us/library/cc749102(v=ws.10).aspx)

The [OCSetup Command-Line Options](https://web.archive.org/web/20240911171330/http://technet.microsoft.com/en-us/library/cc766272(v=ws.10).aspx) page has more information you might find useful for installing other Windows features.

## Some Important Points to Note

1\. A property of the batch file will need to be modified (using Visual Studio)

- Select the file in the Visual Studio Solution Explorer window.
- Right-click on it and choose “Properties”
- In the Properties window set the “Build Action” to “Content”

The above steps ensure that the batch file is deployed with your project to Azure and so the Startup Task will be able to find and execute your batch file.

2\. If you create the batch file using Visual Studio you MUST make sure you set the “Advanced Save Options” (From the File menu in Visual Studio) to:



<figure data-recovered-figure="figure-03">
<a href="/images/writing/installing-msmq-in-an-azure-webrole-instance/figure-03.webp"><img src="/images/writing/installing-msmq-in-an-azure-webrole-instance/figure-03.webp" alt="The batch file must be deployed as Content. The original image specifying the exact Advanced Save Options encoding was not recovered." loading="lazy" /></a>
<figcaption data-reconstruction>Illustrated reconstruction. The batch file must be deployed as Content. The original image specifying the exact Advanced Save Options encoding was not recovered.</figcaption>
</figure>



if you don’t do this, your batch file is effectively corrupt and thus won’t run and so no MSMQ either! Just you note pad if you’re not comfortable with twiddling with Encodings and Byte Order Marks.
