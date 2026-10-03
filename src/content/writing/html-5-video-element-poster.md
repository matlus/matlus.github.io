---
title: Html 5 Video Element Poster
description: The HTML5 video poster should remain until playback begins. A 2010 critique
  explains why selected thumbnails matter more than automatically showing the first
  frame.
datePublished: '2010-09-01'
dateModified: '2026-10-03'
tags:
- html5-video
- video-posters
hero: html-5-video-element-poster
draft: false
---



<figure data-recovered-figure="figure-01">
<a href="/images/writing/html-5-video-element-poster/figure-01.webp"><img src="/images/writing/html-5-video-element-poster/figure-01.webp" alt="New poster artwork showing a photographer kneeling beside a fence and checking a camera in warm evening light." loading="lazy" /></a>
<figcaption data-reconstruction>New artwork replacing the original still used to demonstrate a video poster.</figcaption>
</figure>



During the source of developing an html 5 video player I came across the really stupid specification and that is the <code>poster</code> attribute of the <code>video</code> element (new to Html 5). It seems that the poster is only shown till the browser has been able to download the first frame of the video in question. Which in most cases is a split second or so. After that it shows the first frame. That is really stupid considering that every video hosting website gives people the ability to choose between one or more frames of the video for which they've created thumbnail images, or in some cases allow you to upload an image that best represents the video and yet in some cases (unique to [ExposureRoom](https://web.archive.org/web/20240415154330/http://exposureroom.com/) only so far) go as far as providing all of the above options plus two more:

1. Allow you to provide a time code for the frame you'd like to use as the thumbnail
2. Allow you to play your video and create a thumbnail at any frame of your choosing

So just to re-iterate, typically you have between 2 to 4 ways in which to determine the poster fame of your video on these sites. That tells me, that picking a poster frame is really important for content producers. So don't people who come up with the specs know this? Do they think that all of the videos they see on the Internet magically have the first frame to be these spectacular images that best represent the video in question? I mean in most cases the first frame is black, for Pete's sake! And what would it really have taken for them to leave the poster in place till someone clicks the play button? Maybe we should all look forward to seeing videos across the Internet that have black images instead of interesting images that not only tell something about what you're going to see, but also the production quality and picture quality of the video.
#### Edit -September 25, 2010

Since writing this post, I've been working with WHATWG and a few browser vendors and it looks like this is going to change.
