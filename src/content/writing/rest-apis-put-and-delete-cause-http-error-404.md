---
title: REST APIs, PUT and DELETE cause HTTP Error 404.0 - Not Found
description: PUT and DELETE requests can stop at IIS before reaching a REST API. Add
  the verbs to the extensionless handler through IIS Manager or IIS Express configuration.
datePublished: '2011-12-30'
dateModified: '2026-10-03'
tags:
- iis
- rest
hero: rest-apis-put-and-delete-cause-http-error-404
draft: false
---

If you’ve bought a new PC/Laptop and thus have forgotten you made some configuration changes when you made your first application with a RESTfull API or you’re just starting out with building a RESTfull API for one of your application then you’ll most definitely encounter the Http error 404.0 – Not Found.

This happens when you’re attempting either an Http PUT or DELETE operation and the request never gets to your application. This is happening because IIS (either the full blown version or IIS Express) has not been configured to accept Http request with the PUT and/or DELETE verbs (Http Methods).

The fix is really simple. All you need to do is modify the **applicationhost.config** file for your respective web server. For the full blown IIS, you can do it using the Internet Information Services Manager UI while for IIS Express you need to modify the file manually.

## Adding PUT and DELETE verbs for IIS

Open up IIS Manager



<figure data-recovered-figure="figure-01">
<a href="/images/writing/rest-apis-put-and-delete-cause-http-error-404/figure-01.webp"><img src="/images/writing/rest-apis-put-and-delete-cause-http-error-404/figure-01.webp" alt="In IIS Manager, open Handler Mappings from Features View." loading="lazy" /></a>
<figcaption data-reconstruction>Illustrated reconstruction. In IIS Manager, open Handler Mappings from Features View.</figcaption>
</figure>





<figure data-recovered-figure="figure-02">
<a href="/images/writing/rest-apis-put-and-delete-cause-http-error-404/figure-02.webp"><img src="/images/writing/rest-apis-put-and-delete-cause-http-error-404/figure-02.webp" alt="Select ExtensionlessUrlHandler-Integrated-4.0 in Handler Mappings." loading="lazy" /></a>
<figcaption data-reconstruction>Illustrated reconstruction. Select ExtensionlessUrlHandler-Integrated-4.0 in Handler Mappings.</figcaption>
</figure>



Double-click on the **ExtensionlessUrl-Integrated-4.0** handler shown in the image above. The dialog shown below takes a while to show up, but it will show up eventually.



<figure data-recovered-figure="figure-03">
<a href="/images/writing/rest-apis-put-and-delete-cause-http-error-404/figure-03.webp"><img src="/images/writing/rest-apis-put-and-delete-cause-http-error-404/figure-03.webp" alt="Open Request Restrictions for the selected managed handler." loading="lazy" /></a>
<figcaption data-reconstruction>Illustrated reconstruction. Open Request Restrictions for the selected managed handler.</figcaption>
</figure>



Click on the Request Restrictions&#8230; button



<figure data-recovered-figure="figure-04">
<a href="/images/writing/rest-apis-put-and-delete-cause-http-error-404/figure-04.webp"><img src="/images/writing/rest-apis-put-and-delete-cause-http-error-404/figure-04.webp" alt="The original selected verb list is GET,HEAD,POST,DEBUG,PUT,DELETE." loading="lazy" /></a>
<figcaption data-reconstruction>Illustrated reconstruction. The original selected verb list is GET,HEAD,POST,DEBUG,PUT,DELETE.</figcaption>
</figure>



Switch to the “Verbs” tab in the dialog presented and modify the “One of these verbs” field to include the PUT and DELETE verbs, click OK all the out and you’re done.

PUT and DELETE verbs for IIS Express

As I said earlier, for IIS express, you need to modify the applicationhost.config file that IIS Express uses manually. You’ll find this file in your MyDocuments folder under IISExpress\config.

The setting that needs to be changed can be found towards the end of the file. You’re looking for the **ExtensionlessUrl-Integrated-4.0 node** under the system.webserver section, under handlers node.



<figure data-recovered-figure="figure-05">
<a href="/images/writing/rest-apis-put-and-delete-cause-http-error-404/figure-05.webp"><img src="/images/writing/rest-apis-put-and-delete-cause-http-error-404/figure-05.webp" alt="In IIS Express applicationhost.config, add PUT and DELETE to the extensionless handler verb attribute." loading="lazy" /></a>
<figcaption data-reconstruction>Illustrated reconstruction. In IIS Express applicationhost.config, add PUT and DELETE to the extensionless handler verb attribute.</figcaption>
</figure>



You’ll need to add PUT and DELETE to the “verb” attribute for the handler. Save the file and you’re done.
