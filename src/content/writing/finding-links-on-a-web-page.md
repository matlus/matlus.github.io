---
title: Finding links on a Web page
description: Find links to a target domain with HtmlAgilityPack and C#. A LinkFinder
  downloads HTML, selects anchor elements, and returns their text and attributes.
datePublished: '2010-08-31'
dateModified: '2010-08-31'
tags:
- html-parsing
- html-agility-pack
- csharp
hero: finding-links-on-a-web-page
draft: false
---

Let's say you want to either find all links on a certain web page or for a given set of websites, you want to know if they link back to your website. This post is about the later, but essentially you're finding all the links on a website first and then filtering the ones you want. I had a specific need and that was to find figure out which of our registered members was using WordPress for their blog/website, because we want to let them know of WordPress plug-in or updates to plug-ins that will be of interest to them. Since the registration info for each of our members contains the url to their website, we have that info in the database, so it was a matter of iterating over each of them call the code and class presented here. In the real system, this is multi-threaded since we're scanning hundreds of thousands of websites for this info every once in a while. But since something like this will probably function as a scheduled job it makes no difference (besides finishing faster, but taxing the server a lot more too). I use <code><a href="https://web.archive.org/web/20240414164426/http://htmlagilitypack.codeplex.com/" target="_blank">HtmlAgilityPack</a></code> as the primary html parser. It is truly an awesome html parser and I recommend it highly. 
### Console App showing how the LinkFinder class is used



```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using HtmlAgilityPack;
using System.Net;

namespace FindingLinkToSpecificDomainOnAWebsite
{
  class Program
  {
    static void Main(string[] args)
    {
      string webpageUrl = "http://matlus.com";
      string targetDomain = "exposureroom.com";

      var linkFinder = new LinkFinder();

      var links = linkFinder.FindLinksToDomainOnWebPage(webpageUrl, targetDomain);
      foreach (var link in links)
        Console.WriteLine(link);

      Console.ReadLine();
    }
  }
}
```



The bulk of the work is done in the <code>LinkFinder</code> class presented below.
### LinkFinder class



```csharp
using System.Collections.Generic;
using System.Text;
using HtmlAgilityPack;
using System.Net;


namespace FindingLinkToSpecificDomainOnAWebsite
{
  public class LinkFinder
  {
    public IEnumerable<AnchorTag> FindLinksToDomainOnWebPage(string webpageUrl, string targetDomain)
    {
      HtmlDocument htmlDocument = new HtmlDocument();
      htmlDocument.LoadHtml(GetWebsiteHtml(webpageUrl));
      var anchorTags = htmlDocument.DocumentNode.SelectNodes("//a");

      foreach (var tag in anchorTags)
      {
        var hrefValue = tag.GetAttributeValue("href", "");
        var tempHref = hrefValue.ToUpper();
        var tempTargetDomain = targetDomain.ToUpper();
        if (tempHref.Contains(tempTargetDomain))
        {
          var anchorTag = new AnchorTag();
          foreach (var attribute in tag.Attributes)
            anchorTag.Attributes.Add(attribute.Name, attribute.Value);

          anchorTag.InnerText = tag.InnerText;
          yield return anchorTag;
        }
      }
    }

    private string GetWebsiteHtml(string webpageUrl)
    {
      WebClient webClient = new WebClient();
      byte[] buffer = webClient.DownloadData(webpageUrl);
      return Encoding.UTF8.GetString(buffer);
    }
  }

  public class AnchorTag
  {
    public Dictionary<string, string> Attributes { get; private set; }
    public string InnerText { get; set; }

    public AnchorTag()
    {
      Attributes = new Dictionary<string, string>();
    }

    public override string ToString()
    {
      StringBuilder sb = new StringBuilder();
      sb.AppendLine("InnerText: " + InnerText);
      sb.AppendLine("Attributes:");
      foreach (var attribute in Attributes)
        sb.AppendLine("\t" + attribute.Key + "=" + attribute.Value);
      return sb.ToString();
    }
  }
}
```


