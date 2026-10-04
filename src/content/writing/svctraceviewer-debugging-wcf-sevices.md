---
title: svcTraceViewer - Debugging WCF Sevices
description: Configure WCF tracing in Web.config and open the resulting .svclog in
  svcTraceViewer to find the exception hidden behind a vague service error message.
datePublished: '2011-01-24'
dateModified: '2011-01-24'
tags:
- wcf
- debugging
hero: svctraceviewer-debugging-wcf-sevices
draft: false
---

This is a quick post about Debugging WCF Services and using svcTraceViewer. I'm writing this because I spent over half an hour trying to figure out what was wrong with one of my WCF services and then another half hour trying to figure out where to find svcTraceViewer.

Once I figured out all of this the error happened to be really simple (the class I was trying to serialize was not marked with the <code>DataContract</code> attribute! If I were doing the same thing in ASP.NET or Quartz I would have seen the exception the first time and fixed it in the next second.

The error I was seeing in Fiddler and Chrome was:

<code>Replying to an operation threw a exception</code>

## Where is scvTraceViewer?

On my machine I found it in the following folders:

- <code>C:&#92;Program Files (x86)&#92;Microsoft SDKs&#92;Windows&#92;v7.0A&#92;Bin&#92;</code>
- <code>C:&#92;Program Files (x86)&#92;Microsoft SDKs&#92;Windows&#92;v7.0A&#92;Bin&#92;NETFX 4.0 Tools</code>
- <code>C:&#92;Program Files&#92;Microsoft SDKs&#92;Windows&#92;v6.0A&#92;Bin&#92;x64</code>
- <code>C:&#92;Program Files&#92;Microsoft SDKs&#92;Windows&#92;v6.0A&#92;Bin</code>

The first one seemed to be the latest version so I used that.

Modifying Web.config for tracing

### Web.config file - system.dianostics section



```html
  <system.diagnostics>
    <trace autoflush="true" />
    <sources>
        <source name="System.ServiceModel" switchValue="Information, ActivityTracing, Error, Critical" propagateActivity="true">
          <listeners>
            <add name="sdt" type="System.Diagnostics.XmlWriterTraceListener" initializeData= "wcfTrace.svclog" />
          </listeners>
        </source>
    </sources>
  </system.diagnostics>
```



If you don't have a &lt;system.diagnostics> section in your web.config file already, this section is a top level section, that is, it is a sibling of <code>&lt;system.web&gt;</code> or <code>&lt;system.webServer&gt;</code> or <code>&lt;appSettings&gt;</code> or a child of the root node <code>&lt;configuration&gt;</code>

Once you've set up your diagnostics section as shown above, exercise your service (and the method that's causing the problem) and you'll see the file <code>wcfTrace.svclog</code> created in the folder of your website application/website.

It so happens that files with the extension <code>*.svclog</code> are associated with svcTraceViewer! Of course I didn't know that when I first configured tracing and so I spent all that time trying to find scvTraceViewer. When I went to open the trace log file using svcTraceViewer and noticed that the default file extension it expects is .svclog I changed it.

Once you open the viewer you'll see log entries with errors highlighted in red (as shown in the image below), click on one of those entries and you'll see the cause for your error on the right hand side pane.



<figure data-recovered-figure="figure-01">
<a href="/images/writing/svctraceviewer-debugging-wcf-sevices/figure-01.webp"><img src="/images/writing/svctraceviewer-debugging-wcf-sevices/figure-01.webp" alt="The trace viewer leads from a failed Process action through two warnings to an InvalidDataContractException for SubCategoryDrw." loading="lazy" /></a>
<figcaption data-reconstruction>Illustrated reconstruction of the captured trace, highlighting the serialization exception and its diagnostic guidance.</figcaption>
</figure>



I hope this post helps others who have a similar problem. It's just not fun when you're trying to debug a problem and you can't figure out how to configure tracing and finding the tool that's going to get you out of the predicament.
