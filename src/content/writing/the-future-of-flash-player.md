---
title: The Future of Flash Player
description: Flash Player needs broader codec support and HTTP Range requests to compete
  with HTML5 video. The 2010 argument weighs video quality, hardware decoding, and
  seeking.
datePublished: '2010-09-09'
dateModified: '2026-10-03'
tags:
- flash-player
- video-codecs
- http-range-requests
hero: the-future-of-flash-player
draft: false
---

With the growing support of Html 5 video by the major browsers and the introduction of WebM (VP8) into the open source video codec space and support of [WebM](https://web.archive.org/web/20240415154146/http://www.webmproject.org/) by Firefox, Chrome and Opera, there are a few things that Flash Player will need to do in order to remain a viable platform on the online Video space.
## Video Codecs and Quality

Granted that the best video codec at this time is the H.264 codec. By best I mean the following:

1. Compression to Quality ratio
   - Best video quality for a given file size. File size is important for online video, since the data has to be transferred over the wire and hosting sites have to bear the brunt of storage space costs. At the moment a video encoded at the same video bit rate using the H.264 video codec is far superior in picture quality as compared to WebM and Ogg/Theora. WebM is actually very close to H.264 in terms of picture quality and most online video viewers may not notice the difference. However, for critical video needs, H.264 is still the codec of choice.
2. Hardware decoding support
   - Many devices such as cell phones, game consoles, set top boxes and the like have built-in hardware decoding support for H.264
   - Many graphics cards have built-in support for H.264 or many software vendors have implemented their own hardware decoding algorithms so as to off loaded the job of video decoding to the graphics card (Hardware Acceleration).

However, since WebM is now supported by Firefox, Chrome and Opera, and Google has a stake in making sure WebM becomes a "standard", it is quite likely that WebM will become the de facto standard in time.
## What Flash Player needs to Support

## Video Codecs

Well it's quite obvious that Flash Player will need to support WebM and Ogg in order to stay a viable online video option. That's because a lot of websites will start to encode their video using the WebM codec just because Firefox will not support H.264 and since Firefox makes up about 30-40% of browser market share websites such as YouTube will start to encode their video using the WebM codec. [Flash Player will support VP8](https://web.archive.org/web/20240415154146/http://blogs.adobe.com/flashplatform/2010/05/adobe_support_for_vp8.html)
## HTTP Range Header

But apart from codec support, Flash player needs to support another important aspect of Html 5 video and that is pseudo-streaming. Html 5 video uses HTTP Rage request in order to get info on the video and in order to be able to skip ahead. This is in fact a key aspect of Html 5 video from a viewer's perspective since it allows the user to skip ahead of the downloaded/buffered amount to start watching a video at that point right away. Flash Player has prevented the use of the [HTTP Range header](https://web.archive.org/web/20240415154146/http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html) (probably because they wanted people to use Flash Media Server (which is licensed and costs and arm and a leg). People have got around this by sending the range information via HTTP query strings and having the server end understand this information and thus implement pseudo streaming in this way. But really, Flash Player has to make it seamless to switch between Html 5 video and Flash Player if it hopes to remain a viable option for online video. Mobile Devices such as the iPhone/iPad, Android devices etc. also use the HTTP Range Header in order to determine if they can in fact play the video and also to allow the user to skip ahead.
