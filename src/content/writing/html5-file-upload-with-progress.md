---
title: Html5 File Upload with Progress
description: XMLHttpRequest and FormData upload files while the page stays open. File
  metadata, progress events, and completion handlers build a working HTML5 example.
datePublished: '2010-09-25'
dateModified: '2010-09-25'
tags:
- file-upload
- xmlhttprequest
- progress-reporting
- javascript
hero: html5-file-upload-with-progress
draft: false
---

Html5 finally solves an age old problem of being able to upload files while also showing the upload progress. Today most websites use Flash Player to achieve this functionality. Some websites continue to use the Html <code>&lt;form&gt; with enctype=multipart/form-data,</code> but with modification on the server side to enable showing users the upload progress. Essentially, what you need to do is hook into the server’s byte stream while it is receiving a file so you know how many bytes you’ve received and somehow convey that information back to the client browser, while it is still in the process of uploading the file. This solution works extremely well and is not fraught with the issues Flash Player causes (especially for large files). However it is fairly complicated and not for the faint of heart because you are essentially taking over the entire server side processing (when you tap into the byte stream) and that includes implementing the <code>multipart/form-data</code> protocol on the server side, along with a bunch of other things.
## Uploading files using Html5

The XMLHttpRequest object has gotten a facelift in the Html5 specifications. Specifically the [XMLHttpRequest Level 2](https://web.archive.org/web/20240415161255/http://www.w3.org/TR/XMLHttpRequest2/) specification (currently the latest version) that has included the following new features:

1. Handling of byte streams such as File, Blob and FormData objects for uploading and downloading
2. Progress events during uploading and downloading
3. Cross-origin requests
4. Allow making anonymous request - that is not send HTTP Referer
5. The ability to set a Timeout for the Request

In this post we’ll look more closely at #1 and #2. In particular, uploading of files using XMLHttpRequest and providing upload progress information to the end-user. Note that this solution **does not require any change to the server side**, at least insofar as handling the multipart/form-data protocol. So existing server side logic should remain unchanged, which makes adapting this technology that much easier. 

<a id="figure1"></a>





<figure data-recovered-figure="figure-01">
<a href="/images/writing/html5-file-upload-with-progress/figure-01.webp"><img src="/images/writing/html5-file-upload-with-progress/figure-01.webp" alt="Upload example at 8%, showing 46.78MB transferred at 5.91MBps with 1:28 remaining." loading="lazy" /></a>
<figcaption data-reconstruction>Illustrated reconstruction of the original upload screen, retaining its displayed filename and progress values.</figcaption>
</figure>



### Figure 1: Showing the File Upload screen -Upload just started



<a id="figure2"></a>



<figure data-recovered-figure="figure-02">
<a href="/images/writing/html5-file-upload-with-progress/figure-02.webp"><img src="/images/writing/html5-file-upload-with-progress/figure-02.webp" alt="Upload example at 100%, showing 565.16MB transferred at 5.72MBps with 0:00 remaining." loading="lazy" /></a>
<figcaption data-reconstruction>Illustrated reconstruction of the original upload screen, retaining its displayed filename and progress values.</figcaption>
</figure>


### Figure 2: Showing the File Upload screen with upload completed.

Notice in the images above the following pieces of information made available to the user:

1. Information on the file that has been selected such as
   - File Name
   - File Size
   - Mime Type
2. A Progress bar with percent complete
3. The upload speed or upload bandwidth
4. The approximate time remaining
5. The bytes uploaded thus far
6. A response from the server side (the organge box)

Item #6 above may not sound important, but in fact is quite important in this context because, remember that the user is not navigating away from this page as she normally would after submitting an html form. Because we're using XMLHttpRequest, the uploading is happening in the background. The page the user is on remains intact. Which is a nice feature to have if your business process can work with it.
## Html5 Progress Event

As per the Html5 [Progress Events](https://web.archive.org/web/20240415161255/http://www.w3.org/TR/progress-events/) spec, the Html5 progress event provides the following information relevant to this conversation

1. <code>total</code> - Total bytes being transferred
2. <code>loaded</code> - Bytes uploaded thus far
3. <code>lengthComputable</code> - Specifies if the total size of the data/file being uploaded is known

You should notice that we need to use these two pieces of information to calculate (figure out) all of the other information we're displaying to the user. It is fairly simple to figure out all of the other information given the above two pieces of information but it does involve quite a bit of extra coding and setting up a timer.
## Html5 Progress Event - What it should have been

Considering that those who go down the route of providing upload progress information to the end user will require to show all of the other information to the end user as well, the Html5 Progress Event specifications should have accounted for this need as well, as it would be fairly simple for browser vendors to provide these additional pieces of information each time the progress event is raised. So I propose that the progress event should be modified to the following:

1. <code>total</code> - Total bytes being transferred
2. <code>loaded</code> - Bytes uploaded thus far
3. <code>lengthComputable</code> - Specifies if the total size of the data/file being uploaded is known
4. <code>transferSpeed</code> as a <code>long</code>
5. <code>timeRemaining</code> as a JavaScript <code>Date</code> object

## Html5 Upload using XMLHttpRequest

I've provided a [Uploading files using Html5 with Progress indication](https://web.archive.org/web/20240415161255/http://exposureroom.biz/upload.aspx) demo for those who want to jump right to it. All of the JavaScript code required is in the page. However, because the demo is a real world demo there are a number of CSS styles in use, and the layout of the page (the Html) is fairly complex. In this article we work with a minimalistic version of the Html and JavaScript so as to keep things simple and understandable. 
### Browser Support for this Feature

At the time of this writing only the following browsers support this feature

1. Firefox 4.0 beta 6
2. Chrome 6
3. Safari 5.02

IE 9 Beta and Opera 10.62 do not support this feature 
## Let's get started

The entire code listing for the minimalistic but functional implementation can be found in [Code Listing 6](#codeListing6). Each aspect of the minimalistic Html/JavaScript is explained in detail in the rest of this article. Below, is a very simple Html form. This Html is no different then the Html you'd use to do a regular Html/HTTP file upload you'd use today (Html4 and pretty much any previous version of Html). 

<a id="codeListing1"></a>

 
### The Html Portion



```javascript
<!DOCTYPE html>
<html>
<head>
    <title>Upload Files using XMLHttpRequest - Minimal</title>
</head>
<body>
  <form id="form1" enctype="multipart/form-data" method="post" action="Upload.aspx">
    <div class="row">
      <label for="fileToUpload">Select a File to Upload</label><br />
      <input type="file" name="fileToUpload" id="fileToUpload" onchange="fileSelected();"/>
    </div>
    <div id="fileName"></div>
    <div id="fileSize"></div>
    <div id="fileType"></div>
    <div class="row">
      <input type="button" onclick="uploadFile()" value="Upload" />
    </div>
    <div id="progressNumber"></div>
  </form>
</body>
</html>
```



### Code Listing 1: The bare minimum Html Page

Notice that the <code>&lt;input type="file"/&gt;</code> element has the <code><strong>onchange</strong></code> event assigned to a JavaScript method called <code><strong>fileSelected()</strong></code>. So essentially, each time someone selects a file by browsing to a file on their local system, this event is raised. The <code><strong>fileSelected()</strong></code> JavaScript method looks like the following. 

<a id="codeListing2"></a>


### The fileSelected() JavaScript method



```javascript
function fileSelected() {
  var file = document.getElementById('fileToUpload').files[0];
  if (file) {
    var fileSize = 0;
    if (file.size > 1024 * 1024)
      fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
    else
      fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';
          
    document.getElementById('fileName').innerHTML = 'Name: ' + file.name;
    document.getElementById('fileSize').innerHTML = 'Size: ' + fileSize;
    document.getElementById('fileType').innerHTML = 'Type: ' + file.type;
  }
}
```



### Code Listing 2: The fileSelected() JavaScript method

The first line of code in the method is doing something you've not seen or done before. Essentially, once you have a reference to the <code>&lt;input type="file"/&gt;</code> element, you have access to what is called a <code><strong>FileList</strong></code> object which is new in Html5 and is part of the [File API](https://web.archive.org/web/20240415161255/http://www.w3.org/TR/FileAPI/) specifications of Html 5. A <code>FileList</code> object is a collection of files. More specifically, it is a collection of <code><strong>File</strong></code> objects. A <code>File</code> object has the following properties.

1. <code>name</code> - The name of the file (excluding any path)
2. <code>type</code> - The MIME type of the file (in lower case)
3. <code>size</code> - The size of the file in bytes

This is already getting interesting isn't it? We have access to this information on the client side! In fact the File API gives us access to the contents of the file (the file stream or bytes) on the client side too, using the <code><strong>FileReader</strong></code> object. We won't be dealing with the <code>FileReader</code> in this example, so I'm not going to overwhelm you with yet another new object. We have a couple of new objects to discuss yet. You could use the information the <code>File</code> object provides you to say, prevent users from uploading files larger than the certain size. Or you could use the <code>type</code> property (MIME type) to figure out the type of file the user is attempting to upload and change the behavior of your form (on the client side of course). The above JavaScript method populates the grey box with grey text (in [Figures 1 & 2](#figure2) above) with the information the <code>File</code> object provides us about the selected file. The file size is in bytes, so there is logic in the method to convert the size into a human readable form, such as 15.65MB instead of 15795748864 bytes. After the user has selected a file she'll want to upload the file and so she's going to click on the **Upload** button. Notice in the code listing for the Html form ([Code Listing 1](#codeListing1)) that the Upload button has its <code>onclick</code> event assigned to the <code><strong>uploadFile()</strong></code> JavaScript method. 

<a id="codeListing3"></a>


### uploadFile() JavaScript method



```javascript
function uploadFile() {
  var xhr = new XMLHttpRequest();
  var fd = document.getElementById('form1').getFormData();

  /* event listners */
  xhr.upload.addEventListener("progress", uploadProgress, false);
  xhr.addEventListener("load", uploadComplete, false);
  xhr.addEventListener("error", uploadFailed, false);
  xhr.addEventListener("abort", uploadCanceled, false);
  /* Be sure to change the url below to the url of your upload server side script */
  xhr.open("POST", "UploadMinimal.aspx");
  xhr.send(fd);
}
```



### Code Listing 3: The uploadFile() JavaScript method

In the second line of this method you'll see another object (<code><a href="https://web.archive.org/web/20240415161255/http://www.w3.org/TR/2010/WD-XMLHttpRequest2-20100907/#the-formdata-interface" target="_blank">FormData</a></code>) that we've never seen nor used before. You're not really seeing it, but we do get a reference to it using the <code><strong>getFormData()</strong></code> method of the <code>&lt;form&gt;</code> element. A <code>FormData</code> object is similar to a dictionary, a collection of name/value pairs. Where the name part is the name of a form field (as defined in the Html page) and the value is the value of this field. The value part can be a string, number or even a <code>File</code> object, as you can see in [Code listing 4](#codeListing4). So when you call the <code>getFormData()</code> method on the form you get a reference to a FormData object that holds a collection of name/value pairs of that form. You can use this reference as the information you want to send to the server side script. This makes it really simple to submit the entire form. Now you could create an instance of a <code>FormData</code> object manually and send that to the server or you could add additional information to the <code>FormData</code> before sending it to the server side script.
### A note about FormData

Note that as if this writing Chrome 6 supports uploading files using the new API but does not support the <code>getFormDate()</code> method. It does however, support the <code>FormData</code> object. So the full code listing of the bare minimal code in [Code Listing 6](#codeListing6) manually creates a <code>FormData</code> instance as discussed below. Another way to instantiate an instance of FormData is to pass in a reference to a form element. like so: <code>var fd = new FormData(document.getElementById('form1')); </code>This constructor has the advantage of populating the <code>FormData</code> instance with all the form's fields, instead of having to do it manually (similar to the <code>getFormData</code> method of the form element discussed earlier. At the time of this writing, on Firefox supports this method. [Code listing 4](#codeListing4), below shows you an example of how you would create an instance of a <code>FormData</code> object, assign some arbitrary fields and their values, including a reference to a <code>File</code> object (the file selected by the user using the <code>&lt;&amp;tl;file type="file"&gt;</code> element.


<a id="codeListing4"></a>


### Manually Creating a FormData object



```javascript
var fd = new FormData();
fd.append("author", "Shiv Kumar");
fd.append("name", "Html 5 File API/FormData");
fd.append("fileToUpload", document.getElementById('fileToUpload').files[0]);
```



### Code Listing 4: Manually creating a FormData instance

Going back to [Code Listing 3](#codeListing3), you'll notice we've subscribed to a few events of the XMLHttpRequest object. In particular, pay attention to the first line after the event listners comment in the code. <code>xhr.<strong>upload</strong>.addEventListener("progress", uploadProgress, false);</code> The progress event we subscribe to is not that of the XMLHttpRequest instance, but rather the <code><strong>upload</strong></code> property of the XMLHttpRequest instance, which is an [XMLHttpRequestUpload](https://web.archive.org/web/20240415161255/http://dev.w3.org/2006/webapi/XMLHttpRequest-2/#xmlhttprequestupload) type that is really an event target that has a <code><strong>progress</strong></code> event we can subscribe to in order to get progress information on the upload that is taking place. We don't have to worry about this object. Just remember, when using XMLHttpRequest for uploading data to the server, you must subscribe to its <code><strong>upload</strong></code> property's <code><strong>progress</strong></code> event.

### A note about Progress Events

The XMLHttpRequest object does have a progress event of it's own and you'll subscribe to that event when you download data from the server (which we are not covering here). 

<a id="codeListing5"></a>


### The Event handler implementations



```javascript
function uploadProgress(evt) {
  if (evt.lengthComputable) {
    var percentComplete = Math.round(evt.loaded * 100 / evt.total);
    document.getElementById('progressNumber').innerHTML = percentComplete.toString() + '%';
  }
  else {
    document.getElementById('progressNumber').innerHTML = 'unable to compute';
  }
}

function uploadComplete(evt) {
  /* This event is raised when the server send back a response */
  alert(evt.target.responseText);
}

function uploadFailed(evt) {
  alert("There was an error attempting to upload the file.");
}

function uploadCanceled(evt) {
  alert("The upload has been canceled by the user or the browser dropped the connection.");
}  
```



### Code Listing 5: The implementation of the various event handlers

The code listing above is pretty self explanatory so there is nothing much to say here.
## The Minimalistic Solution

The Code listing below is the entire Html page including the JavaScript and Html required to get a bear minimum File upload with progress indicator working. I've intentionally kept it simple so if you want to do your own layout and information display you can start with this and expand it. Html5 also introduces a <code><b>progress</b></code> element that can be used to show progress. The <code>progress</code> element has <code>max</code> and <code>value</code> and so it makes it really simple to show progress. However, at the time of this writing, only Chrome 6 supports this element so I've not used it in the minimalistic solution.
### Change the Url to the server side script

Be sure to change the url to point to the url of your server side script that handles file uploads. In the code listing below, it is **UploadMinimal.aspx** in the <code>uploadFile()</code> method: <code><b>xhr.open("POST", "UploadMinimal.aspx");</b></code> 

<a id="codeListing6"></a>


### Minimalistic Html and JavaScript



```javascript
<!DOCTYPE html>
<html>
<head>
    <title>Upload Files using XMLHttpRequest - Minimal</title>

    <script type="text/javascript">
      function fileSelected() {
        var file = document.getElementById('fileToUpload').files[0];
        if (file) {
          var fileSize = 0;
          if (file.size > 1024 * 1024)
            fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
          else
            fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';

          document.getElementById('fileName').innerHTML = 'Name: ' + file.name;
          document.getElementById('fileSize').innerHTML = 'Size: ' + fileSize;
          document.getElementById('fileType').innerHTML = 'Type: ' + file.type;
        }
      }

      function uploadFile() {
        var fd = new FormData();
        fd.append("fileToUpload", document.getElementById('fileToUpload').files[0]);
        var xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", uploadProgress, false);
        xhr.addEventListener("load", uploadComplete, false);
        xhr.addEventListener("error", uploadFailed, false);
        xhr.addEventListener("abort", uploadCanceled, false);
        xhr.open("POST", "UploadMinimal.aspx");
        xhr.send(fd);
      }

      function uploadProgress(evt) {
        if (evt.lengthComputable) {
          var percentComplete = Math.round(evt.loaded * 100 / evt.total);
          document.getElementById('progressNumber').innerHTML = percentComplete.toString() + '%';
        }
        else {
          document.getElementById('progressNumber').innerHTML = 'unable to compute';
        }
      }

      function uploadComplete(evt) {
        /* This event is raised when the server send back a response */
        alert(evt.target.responseText);
      }

      function uploadFailed(evt) {
        alert("There was an error attempting to upload the file.");
      }

      function uploadCanceled(evt) {
        alert("The upload has been canceled by the user or the browser dropped the connection.");
      }
    </script>
</head>
<body>
  <form id="form1" enctype="multipart/form-data" method="post" action="Upload.aspx">
    <div class="row">
      <label for="fileToUpload">Select a File to Upload</label><br />
      <input type="file" name="fileToUpload" id="fileToUpload" onchange="fileSelected();"/>
    </div>
    <div id="fileName"></div>
    <div id="fileSize"></div>
    <div id="fileType"></div>
    <div class="row">
      <input type="button" onclick="uploadFile()" value="Upload" />
    </div>
    <div id="progressNumber"></div>
  </form>
</body>
</html>
```



### Code Listing 6: The Complete but minimalistic code listing

Well, that pretty much covers the minimalistic version of the new Html5 feature. Getting at the other information that you see in [Figure2](#figure2) is mathematical really. It is quite a bit of extra work to not only get at the information, but to display and animate etc. For instance to get the rate of upload (the upload speed). We do the following: 1. in the <code>uploadProgress(evt)</code> event, should store the <code>evt.loaded</code> and <code>evt.total</code> in global variables. 2. We set up a timer event to fire every second. 3. In the timer callback we get the difference of the number of bytes transfered between now and the last time the callback was called (so 1 second ago). 4. That gives us the number of bytes per second. Which is the upload speed. Note that in the demo I set up the timer to fire every 500 milliseconds to get more granularity. As a result the difference between the number of bytes is doubled since the number of bytes is really the number of bytes transferred in half a second. I won't go into how to find the time remaining, but it's all there in the demo. Do a "view source" to see the code in the demo's html page. I hope you found this article helpful.
