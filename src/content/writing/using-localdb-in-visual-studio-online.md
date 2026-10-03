---
title: Using LocalDB in Visual Studio Online
description: Run database tests on Visual Studio Online by creating a LocalDB instance,
  publishing a dacpac, and invoking the batch file from the build definition's Pre
  Test Script.
datePublished: '2014-12-02'
dateModified: '2026-10-03'
tags:
- localdb
- continuous-integration
- testing
hero: using-localdb-in-visual-studio-online
draft: false
---

Have you ever needed to use LocalDB to run Unit Tests on your CI Build Server in Visual Studio Online? If so and you've been banging your head against a wall, this post will get you to that goal. Here are the steps you'll need to take.

1. Create a batch file that Creates a named instance of LocalDB and starts it up
2. This batch file also Publishes your database (the dacpac)
3. Save this batch file in your Solution
4. Modify your Build Definition to tell it to use this batch file as a Pre Test Script
5. Queue a Build

It will probably take you a few tried to get the paths and relative paths for your build server correct, but hopefully, I'll cover most of the gotcha so you don't have the same head scratching moments (or hours) that I had.

**I assume that**

- You use LocalDB for your tests on your local machine
- You have a Database Project in your solution
- You Publish your LocalDB (if needed) and then run your tests
- You have a Post Deployment script that seeds your database with any data your tests will need
- You have your tests working on your local machine against this LocalDB instance

## Batch File

The CI build servers in Visual Studio Online come pre-installed with SqlLocalDB. This is a utility that allows you to configure LocalDB and spin it up. If the instance is already there and configured and started there is no harm in running these commands again. However, in Visual Studio Online, your CI build servers are freshly installed and spun up VMs, so you’re always starting from a “fresh” installation so you’re not technically running these scripts “again”.

### Please take Note of the Paths

- SqlLocalDB is installed in the Program Files directory
- SqlPackage is installed in Program Files (x86) directory

Make sure you use the paths I mention. On your local machine these tools may be found in other directories as well. But on the CI Build servers in Azure, these tools will only be found in the paths mentioned. Also, as of this writing the version number of LocalDB on these boxes is 120 and Visual Studio is 12 (Which is really Visual Studio 2013). 
### Batch File



```bat
"%ProgramFiles%\Microsoft SQL Server\120\Tools\Binn\SqlLocalDB.exe" create "ProjectsV12" 12.0 -s
```





```bat
"%ProgramFiles(x86)%\Microsoft Visual Studio 12.0\Common7\IDE\Extensions\Microsoft\SQLDB\DAC\120\SqlPackage.exe" /Action:Publish /SourceFile:"%TF_BUILD_BINARIESDIRECTORY%\OoblxDb.dacpac" /Profile:"%TF_BUILD_SOURCESDIRECTORY%\Dev\vNext\Ooblx.Web\Database\OoblxDb\OoblxDb.publish.xml"
```



### CreateLocalDBInstance.bat

The first line in the batch file above - **SqlLocalDB Utility** - SqlLocalDB.exe can be found in the Program Files folder (and not the Program Files (x86) folder). The rest of the command line creates a localDB instance named “ProjectsV12” with an instace version of “12.0” and starts it. More information on SqlLocalDB Utility can be found here [SqlLocalDB Utility](https://web.archive.org/web/20240809192335/http://msdn.microsoft.com/en-us/library/hh212961.aspx)

It is important to note that I have "ProjectsV12" as the instance name because the connection string I'm using has it in there. Here is what my connection string looks like

### Connection String



```csharp
connectionString="Data Source=(localdb)\ProjectsV12;Initial Catalog=Ooblx;Integrated Security=True;Connect Timeout=30;Encrypt=False;TrustServerCertificate=False"
```



### The Connection String I use in my Unit Test Project

The second line in the batch file - This is where you'll probably get tripped up. Essentially we need to Publish our database and in order to do so, there are a few pre-requisites:

1. You will typically have a Database Project (of course) that produces your database and seeds it with any data you'll need in order to run your tests
2. The output of this Database Project is a \*.dacpac. You should double check the name of this dacpac file
3. You don't have to, but it is best to have a Publish Profile - a publish.xml file in order to keep the Publishing step simple

Team Foundation Build environment variables [Team Foundation Build environment variables](https://web.archive.org/web/20240809192335/http://msdn.microsoft.com/en-us/library/hh850448.aspx)
## Build Definition

You’ll need to configure your build definition. In the “Process” Tab, expand the “Test” node and then expand “Advanced” under this node set the value for the “Pre Test Script Path” item to path and name of the batch file we created earlier, by browsing to it. In my solution I have a batch file called CreateLocalDBInstance.bat in the root folder of the solution (this is where the .sln file is found. For me the path looks like so: $/Ooblx/Dev/vNext/Ooblx.Web/CreateLocalDBInstance.bat
