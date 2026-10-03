---
title: Orion - A Blog Engine
description: Orion powered Matlus with Quartz for ASP.NET and Windows Live Writer
  support. Its original release explains the Visual Studio solution and required Quartz
  project reference.
datePublished: '2011-01-13'
dateModified: '2026-10-03'
tags:
- blogging
- asp-net
hero: orion
draft: false
---

<p data-source-license>Licensing: <a href="https://web.archive.org/web/20240414162744/http://www.matlus.com/opensource/mit-license/">MIT License</a></p>


Orion is a high performance blogging engine written using the [Quartz for ASP.NET](/writing/quartz-for-aspnet/) framework. This blog is now powered by the **Orion engine**, so what you see by way of features, function and speed (responsiveness) is what you get with the Orion engine and of course the [Quartz for ASP.NET](/writing/quartz-for-aspnet/) framework.

I was initially using WordPress for my blog (this blog) and eventually just got tired of having to deal with some of the nuances of WordPress and more specifically the theme I was using. However I had gotten used to using [Windows Live Writer](https://web.archive.org/web/20240414162744/http://explore.live.com/windows-live-writer?os=other) to write my posts and so the first thing I did, even before starting the Orion project was to implement and have a functional [MetaWeblog API](/writing/metaweblog-api-c-library/) implementation that I could use in Orion.

I’ve posted source code for the Orion Project (as is). This is a VS.NET 2010 solution that also requires (references) the Quartz engine project (and not just the assemblies). If you are not too comfortable with VS.NET solutions and/or are not able to recover from problems such as missing projects due to missing paths etc. this download may not be for you. The only part I expect people might have trouble with is that this solution includes the Quartz project rather than referencing the assemblies and so the solution will not find the Quartz project when you first open it.

[Orion VS.NET 2010 Solution](https://web.archive.org/web/20240414162744/http://www.matlus.com/uploads/orion/orion.zip)

Download the [Quartz for ASP.NET](/writing/quartz-for-aspnet/) project and source code for the link provided on that project’s page.
