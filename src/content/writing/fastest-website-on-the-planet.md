---
title: Fastest Website on the Planet!
description: Matlus recorded high YSlow and PageSpeed scores after moving to Orion,
  with ShowSlow rankings and Google crawl charts illustrating the site's performance
  in 2011.
datePublished: '2011-01-22'
dateModified: '2011-01-22'
tags:
- web-performance
- asp-net
hero: fastest-website-on-the-planet
draft: false
---

During the design and development of [Quartz for ASP.NET](/writing/quartz-for-aspnet/) and [Orion](/writing/orion/ "Orion - A Blog Engine"), performance was an extremely important area I focused on. Optimizing a framework such as [Quartz for ASP.NET](/writing/quartz-for-aspnet/) is important because other websites and application will be built using it and I believe it is imperative that frameworks pay close attention to performance. The same goes for Orion but of course at a different level since Orion is a web application.

I should add that Quartz for ASP.NET does not sacrifice maintainability for performance however, there are many aspects of the design of the framework that lend themselves towards mind-bending performance. And of course code constructs.

Anyway, this post is about the fastest website on the planet and you should know, you're on it! Yes, [Matlus](https://web.archive.org/web/20240415151026/http://www.matlus.com/) is currently the fastest website ranked by [http://www.showslow.com/](https://web.archive.org/web/20240415151026/http://www.showslow.com/). Matlus has the following score:

[YSlow](https://web.archive.org/web/20240415151026/http://developer.yahoo.com/yslow/ "Yahoo! YSlow") – Grade A

[PageSpeed](https://web.archive.org/web/20240415151026/http://code.google.com/speed/page-speed/ "Google PageSpeed") – 99/100

If it weren't for the Google analytics JavaScript file not being cached, [PageSpeed](https://web.archive.org/web/20240415151026/http://code.google.com/speed/page-speed/ "Google PageSpeed") would have given it a 100/100!



<figure data-recovered-figure="figure-01">
<a href="/images/writing/fastest-website-on-the-planet/figure-01.webp"><img src="/images/writing/fastest-website-on-the-planet/figure-01.webp" alt="Show Slow recorded an A (99) Page Speed score for matlus.com at 2011-01-22 06:37:31." loading="lazy" /></a>
<figcaption data-reconstruction>The original Show Slow result, redrawn with its recorded score and timestamp.</figcaption>
</figure>



In Google Webmaster tools under "Labs" there is a Site Performance link and this is what I see there



<figure data-recovered-figure="figure-02">
<a href="/images/writing/fastest-website-on-the-planet/figure-02.webp"><img src="/images/writing/fastest-website-on-the-planet/figure-02.webp" alt="Historical Webmaster Tools report: 1.3-second average load, faster than 85% of sites, with fewer than 100 data points." loading="lazy" /></a>
<figcaption data-reconstruction>Redrawn from the January 20, 2011 report. Its low-accuracy qualification is retained; the trend line is schematic.</figcaption>
</figure>



Under the "Diagnostics" section, the "Crawl stats" shows me this. It so happens that I moved my blog from using WordPress as the blog engine to using [Orion](/writing/orion/ "Orion - A Blog Engine"). So if you look at the January portion of the graph that takes a big dip towards the end, that's when the switch happened.



<figure data-recovered-figure="figure-03">
<a href="/images/writing/fastest-website-on-the-planet/figure-03.webp"><img src="/images/writing/fastest-website-on-the-planet/figure-03.webp" alt="Historical crawler report showing a high download time of 2,590 milliseconds and an average of 990 milliseconds." loading="lazy" /></a>
<figcaption data-reconstruction>The original download-time summary, redrawn with its reported values and a schematic trend.</figcaption>
</figure>


