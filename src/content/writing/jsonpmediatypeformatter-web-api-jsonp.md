---
title: JsonpMediaTypeFormatter–Web API JSONP
description: A JsonMediaTypeFormatter subclass wraps JSON in a callback for JSONP
  responses. Registration and controller-level control explain both the solution and
  its limits.
datePublished: '2012-03-03'
dateModified: '2026-10-03'
tags:
- asp-net-web-api
- jsonp
- csharp
hero: jsonpmediatypeformatter-web-api-jsonp
draft: false
---

For some reason JSONP is not supported out of the box in the Web API framework. Seeing JSON is the most common API format these days and publishing an API implies the consumers of your API are not from your domain, I don’t quite get why we don’t have support for JSONP. Of course, keep in mind that you only need to support JSONP if you want to allow consumers that use browsers (rather than regular desktop applications), since without JSNOP browsers won’t allow cross domain calls.

In this post I provide a solution that uses a [MediaTypeFormatter](https://web.archive.org/web/20240915043013/http://msdn.microsoft.com/en-us/library/system.net.http.formatting.mediatypeformatter_methods(v=vs.108).aspx) that essentially, modifies the outgoing stream (which contains the JSON) to include a call to the JavaScript function that was sent in as a query parameter. If you don’t understand this part, that’s ok, you don’t need to.

## The JsonpMediaTypeFormatter

The code listing below shows the entire JsonpMediaTypeFormatter. It descends from the built-in <code><a href="https://web.archive.org/web/20240915043013/http://msdn.microsoft.com/en-us/library/system.net.http.formatting.jsonmediatypeformatter(v=vs.108).aspx" target="_blank">JsonMediaTypeFormatter</a></code> because we use its ability to serialize JSON. You can see this in the <code>OnWriteToStreamAsync</code> method in the code listing below, where we make a call to <code>base.OnWriteStream</code>.

### JsonpMediaTypeFormatter



```csharp
using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;

namespace Matlus.Web.WebLib.MediaTypeFormatters
{
    public class JsonpMediaTypeFormatter : JsonMediaTypeFormatter
    {
        private static readonly string jsonpCallbackQueryParameter = "callback";
        private static readonly string mediaTypeHeaderTextJavascript = "text/javascript";
        private static readonly string pathExtensionJsonp = "jsonp";

        public JsonpMediaTypeFormatter()
            : base()
        {
            SupportedMediaTypes.Add(new MediaTypeHeaderValue(mediaTypeHeaderTextJavascript));
            MediaTypeMappings.Add(new UriPathExtensionMapping(pathExtensionJsonp, DefaultMediaType));
        }

        protected override Task OnWriteToStreamAsync(Type type, object value, Stream stream, HttpContentHeaders contentHeaders, FormatterContext formatterContext, TransportContext transportContext)
        {
            //JSONP applies only for GET Requests.
            if (formatterContext.Response.RequestMessage.Method == HttpMethod.Get)
            {
                string jsonpCallback = GetJsonpCallbackMethodName(formatterContext.Response.RequestMessage);

                if (!String.IsNullOrEmpty(jsonpCallback))
                {
                    return Task.Factory.StartNew(() =>
                    {
                        var streamWriter = new StreamWriter(stream);
                        streamWriter.Write(jsonpCallback + "(");
                        streamWriter.Flush();
                        base.OnWriteToStreamAsync(type, value, stream, contentHeaders, formatterContext, transportContext).Wait();
                        streamWriter.Write(")");
                        streamWriter.Flush();
                    });
                }
            }

            return base.OnWriteToStreamAsync(type, value, stream, contentHeaders, formatterContext, transportContext);
        }

        private string GetJsonpCallbackMethodName(HttpRequestMessage httpRequestMessage)
        {
            var queryStrings = HttpUtility.ParseQueryString(httpRequestMessage.RequestUri.Query);
            return queryStrings[jsonpCallbackQueryParameter];
        }
    }
}
```



### The JsonpMediaTypeFormatter class

## Registering the MediaTypeFormatter

Once you have your <code>JsonpMediaTypeFormatter</code>, you need to register it with your application using the <code>GlobalConfiguration</code> type and adding it to the formatters collection. We do this is the Application\_Start event of our HttpApplication (Global class). And that’s all it takes.

### Global.cs



```csharp
protected void Application_Start(object sender, EventArgs e)
{
    RegisterRoutes(RouteTable.Routes);
    GlobalConfiguration.Configuration.Formatters.Insert(0, new JsonpMediaTypeFormatter()); 
}
```



### Registering the MediaTypeFormatter in Application\_Start

## The problem with using MediaTypeFormatters for JSONP

This solution works, however in a real-world production system, there are some methods of your API that should not work from outside your domain while others can. For example, most methods that are “read-only” will probably be exposed to the public while the data modification methods will not be. As an example, let’s say I have a RESTFul API for members in my application, then:

Issuing an Http GET to

[http://www.matlus.com/api/members/skumar](https://web.archive.org/web/20240915043013/http://www.matlus.com/api/members/skumar)

will get me the information on the member identified by skumar

Anyone that understands REST can guess that the URI for updating this member and deleting this member is exactly the same. The key difference is in the Http Method (PUT and DELETE versus GET).

Of course you’d have authentication required for those methods as well, but what I’m really getting at is that the “control” or decision needs to be made at the controller or more specifically the “Put” and “Delete” methods, rather than something embedded in the pipeline.

There is a place and need for the various extensibility points in the Web API framework, no doubt. But I don’t believe the solution to these kinds of things resides in MediaTypeFormatter. I would much prefer the HttpResponseMessage provide a way for me to respond in JSONP from the method in my controller as and when I see fit, rather than happen unbeknownst to me by a MediaTypeFormatter.
