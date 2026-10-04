---
title: Html 5 Video and Flash
description: HTML5 video playback varied across browsers in 2010. Tests compare HD
  playback, CPU use, codec support, and full-screen behavior with Flash and native
  players.
datePublished: '2010-08-27'
dateModified: '2010-08-27'
tags:
- html5-video
- flash-player
- benchmarking
- video-codecs
- web-browsers
hero: html-5-video-and-flash
draft: false
---



<figure data-recovered-figure="figure-01">
<a href="/images/writing/html-5-video-and-flash/figure-01.webp"><img src="/images/writing/html-5-video-and-flash/figure-01.webp" alt="A viewer studies a video on a desktop computer, with film frames and keyboard details suggesting the underlying playback technology." loading="lazy" /></a>
<figcaption data-reconstruction>New editorial artwork for the original discussion of browser video playback.</figcaption>
</figure>



I see so much confusion and BS about Html 5 and Flash on the Internet. Most of it seems from people who know almost nothing about it in the first place. Don’t these people know that they don’t know? Getting to the subject at hand&#8230; Having been recently involved in building an Html 5 video player that will work across all major browsers and will be used in the mainstream (by major browsers, I mean IE, Firefox, Chrome, Safari and Opera). In doing so, I have acquired a deep insight into the capabilities and nuances of each browser's built in video player. Further, having built a Flash based video player that is used in the mainstream for a few years now gives me the ability to truly compare developing a video player that has the set of prerequisite features and performance metrics.

## Single Codebase

It was imperative that I can use a single codebase for the html 5 video player across all browsers, without the need to do any browser sniffing and or conditional code paths for different browsers. However, since the video element does not function or behave the same across browsers (either due to their understanding of the html 5 or limited support at this time), I have accounted for these nuances in the implementation of the video player to the extent possible.
## Html 5 Video Comparison

As browser makers continue to improve support for various Html 5 specifications it becomes important to compare browsers in this regard. In this comparison I’m interested in the implementation of the video element across browsers since there are no standards tests for this element, each browser’s implementation differs quite a bit and the result is that websites intending to support the html 5 video element have a really tough time developing a video player that has all of the functionality that their current Flash based video players have. I’ll compare the following aspects of each browser’s implementation of the video element as compared to a Flash based video player and Native video players (Native players being Windows Media Player on Windows and Quick time/QTX on MAC).

1. Playback Performance
2. <span id="featurecapability">Feature Capability</span>
3. <span id="featureperformance">Feature Performance</span>

The following browsers were used in the tests:

1. [IE 9 Platform Preview 4](https://web.archive.org/web/20240415144145/http://ie.microsoft.com/testdrive/ "IE 9 Platform Preview")
2. [Firefox 4.0 Beta](https://web.archive.org/web/20240415144145/http://www.mozilla.com/en-US/firefox/beta/ "Firefox 4 Beta")
3. [Chrome 6.0.472.41](https://web.archive.org/web/20240415144145/http://www.google.com/chrome "Chrome 6")
4. [Safari 5.0.1](https://web.archive.org/web/20240415144145/http://www.apple.com/safari/ "Safari 5.0.1")
5. [Opera 10.61.3484](https://web.archive.org/web/20240415144145/http://www.techspot.com/downloads/40-opera-for-windows.html "Opera 10.61")

<a id="playbackperformance"></a>

## Playback Performance

This is the ability of the browser’s built in player to playback high quality video at the frame rate the video is encoded at (that is extremely smooth without stutter, jerks or sticky frames). Videos encoded at a video bit rate of between 4000kbps – 7000kbps at dimensions of 720p and 1080p are considered high quality (for the purposes of this test). At the moment only IE 9 and Safari 5 are comparable in playback performance to the native players on their respective platforms. All other browsers lag far behind. They’ll probably catch up in time but as things stand today, IE 9 and Safari 5 are the winners. We know that Flash based video players are [unable to come close to the playback performance of native players](https://web.archive.org/web/20240415144145/http://exposureroom.com/news/view.aspx/371/ "Flash player compared to Windows Media Player and Quick time"). On Windows, Flash player has direct access to hardware acceleration. On a MAC, Flash player 10.1.82.76 in combination with OS X v10.4 and above can use hardware acceleration. So most MAC users are unable to watch high quality videos when played back using Flash based video players. According to Adobe, hardware acceleration is supported on the following MACs

1. MacBooks shipped after January 21st, 2009
2. Mac Minis shipped after March 3rd, 2009
3. MacBook Pros shipped after October 14th, 2008
4. iMacs which shipped after the first quarter of 2009

This doesn’t mean that all of the above hardware can playback high quality HD video, but only that they have a hardware decoder for H.264 when using Flash player and not other players. 
##### The MAC user's plight

Currently, however, 480p video, running on a 1.8GHz Mac mini, uses 34 percent of the CPU in Mac OS X and just 16 percent in Windows (running in BootCamp on same hardware). Flash 10.1 is expected to cut CPU consumption in half. So Html 5 video is truly a benefit for MAC users, at least those who don't have newer hardware and/or OS 
<a id="codecsupport"></a>

## Video Codecs

Since the Html 5 specification does not specify a specific video codec, browser makers are free to support one or more of the common codecs. For the purposes of this test we have used the following codecs:

1. H.264
2. [WebM](https://web.archive.org/web/20240415144145/http://www.webmproject.org/ "WebM")

Further, there are multiple versions and these versions differ in dimensions and quality so as to support visitors with varying bandwidth and computer hardware capabilities. The following versions have been used for this test

1. 270p@500kbps
2. 360p@2000kbps
3. 480p@2600kbps
4. 720p@4000kbps
5. 1080p@7000kbps

So there are 10 actual videos files available on the server, 5 encoded using the H.264 codec and 5 encoded using the WebM codec.
## Html 5 Video Full Screen

At the time of this writing, only Safari provides a built-in way to go to full screen. However as per the Html 5 video element specification, browser vendors should not provide a programmatic way to go to full screen. Only an actual user gesture, such as a physical mouse click can activate full screen. As a result this is what happens:

1. Only the default controls could provide a way to go to full screen or browser vendors could provide a context menu (right click over the video and choose full screen). At this time only safari provides a full screen button on its default skin.
2. Most websites will have their own skin and will want to programmatically control the built-in video players. So this poses a problem because we’ll then need programmatic access to go to full screen.

So for the moment I’ve implemented my own full screen feature in the player that works in every browser regardless of whether the browser provides one or not since we can’t access that feature anyway. All browsers except Safari provide a way to set the browser in full screen mode using the F11 key. Note that this just puts the browser is full screen mode and has nothing to do with video. So the best user experience for full screen mode at the time is to hit the F11 key (to put the browser in full screen mode) and then to get the video to go to full screen so it fills the entire screen.
## Html 5 Video Comparison Results

For those of you only interested in knowing the results, I’ve tabulated them here. All tests were performed on a 4 core 2.66GHz, 64bit hardware with 4GB RAM and Window 7. 

<table> <thead> <tr> <td> <h5>Test</h5></td> <td>IE 9 PP4</td> <td>Firefox 4 Beta 4</td> <td>Chrome 6.0.4</td> <td>Safari 5.0.1</td> <td>Opera 10.61</td></tr></thead> <tbody> <tr> <td><a href="#playbackperformance">Playback Performance</a></td> <td>1st</td> <td>3rd</td> <td>2nd</td> <td>1st</td> <td>4th</td></tr> <tr> <td><a href="#codecsupport">Codec Support</a></td> <td>1st</td> <td>2nd</td> <td>1st</td> <td>3rd</td> <td>2nd</td></tr> <tr> <td><a href="#featurecapability">Feature Capability</a></td> <td>2nd</td> <td>2nd</td> <td>1st</td> <td>1st</td> <td>3rd</td></tr> <tr> <td><a href="#featureperformance">Feature Performance</a></td> <td>1st</td> <td>1st</td> <td>1st</td> <td>3rd</td> <td>2nd</td></tr></tbody></table>


## Playback Performance

IE 9 and Safari 5 are the winners. Both these browsers do a fantastic job of playing back high quality HD video, really impressive indeed. 

<table> <thead> <tr> <td> <h5>Playback Performance</h5></td> <td>IE 9 PP4</td> <td>Firefox 4 Beta 4</td> <td>Chrome 6.0.4</td> <td>Safari 5.0.1</td> <td>Opera 10.61</td></tr></thead> <tbody> <tr> <td>480p</td> <td>6%</td> <td>10%</td> <td>12%</td> <td>16%</td> <td>21%</td></tr> <tr> <td>720p</td> <td>9%</td> <td>19%</td> <td>18%</td> <td>25%</td> <td>42%</td></tr> <tr> <td>1080p</td> <td>17%</td> <td>25%</td> <td>32%</td> <td>40%</td> <td>56%</td></tr></tbody></table>

 
##### Note

As you can see from the results above CPU utilization is not an indication of how well a player can perform. From the looks of it however, it would seem that vendors who have experience with video players, know what the heck they’re doing. Playing the 1080p (H.264) version using Windows Media Player on the same computer utilized 12% CPU as against 17% compared to IE 9. The 1080p version using a Flash based video player was completely unwatchable and the CPU utilization was at 70%. For the 720p version, It’s give the Flash based player “good” and not excellent and the CPU utilization was at 60%. For the 480p version I’d give it an Excellent and the CPU utilization was 40%.
