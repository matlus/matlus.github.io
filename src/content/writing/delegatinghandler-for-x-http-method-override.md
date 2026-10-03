---
title: DelegatingHandler for X-HTTP-Method-Override
description: An X-HTTP-Method-Override header lets POST requests carry PUT or DELETE
  intent. A Web API DelegatingHandler translates the method before controller dispatch.
datePublished: '2012-03-03'
dateModified: '2026-10-03'
tags:
- asp-net-web-api
- http-method-override
- csharp
- javascript
hero: delegatinghandler-for-x-http-method-override
draft: false
---

If you have a RESTful Web API exposed in the public domain, it is quite likely, you’ll encounter a few stumbling blocks. A couple in fact come to mind:

1. Need to support older browsers that only support HTTP POST and GET
2. Some firewalls block any HTTP traffic that is not either a POST or GET

This poses a problem if you’re using the new ASP.NET Web API framework to build your services since the dispatching to the specific methods in your API Controller is automatic, based on the HTTP method used.

The basic idea behind the <code>X-HTTP-Method-Override</code> HTTP header is that browsers (typically via JavaScript/XMLHttpRequest can add the <code>X-HTTP-Method-Override</code> HTTP header with a value of either PUT or DELETE (or HEAD) and then make a regular HTTP POST request. On the receiving end, the service will interpret the HTTP method to be either a PUT or DELETE as the case may be, thus circumventing the two issues mentioned above.

## Delegating Handlers to the rescue

Delegating handlers essentially allow you to intercept the Request/Response pipeline. Therefore you can use them to modify the request or response (or both) or simply send back a response (thus halting the progression of the request down the remain pipeline). If you’re familiar with ASP.NET HttpModules, then think of DelegatingHandlers similar to HttpModule.

There is a difference between DelegatingHandlers and HttpModules and that is DelegatingHandlers are chained, such that each DelegatingHandler has a reference to an inner handler and it calls out to its inner handler when it is done. The team responsible for this design as Microsoft call this the delegate pattern. However, I don’t believe this is the delegate pattern. Nonetheless, keep your eye on when you’d use a DelegatingHandler and how they work.

## The XHttpMethodOverrideDelegatingHandler

The handler itself is really very simple to implement. Take a look at the code listing below. I think the code is pretty self-explanatory. You need to register this class before you can use it.

### XHttpMethodOverrideMessageHandler.cs



```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web;

namespace Matlus.Web.WebLib.DelegatingHandlers
{
    public class XHttpMethodOverrideDelegatingHandler : DelegatingHandler
    {
        static readonly string[] httpMethods = { "PUT", "DELETE" };
        static readonly string httpMethodOverrideHeader = "X-HTTP-Method-Override";

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            if (request.Method == HttpMethod.Post && request.Headers.Contains(httpMethodOverrideHeader))
            {
                var httpMethod = request.Headers.GetValues(httpMethodOverrideHeader).FirstOrDefault();
                if (httpMethods.Contains(httpMethod, StringComparer.InvariantCultureIgnoreCase))
                    request.Method = new HttpMethod(httpMethod);
            }
            return base.SendAsync(request, cancellationToken);
        }
    }
}
```



### Code listing of the XHttpMethodOverrideDelegatingHandler class

You do this in yout HttpApplication’s (Global) Start event like so:

### Global.asax.cs



```csharp
        protected void Application_Start(object sender, EventArgs e)
        {
            RegisterRoutes(RouteTable.Routes);
            GlobalConfiguration.Configuration.MessageHandlers.Add(new XHttpMethodOverrideDelegatingHandler());
        }
```



### Registering the XHttpMethodOverrideDelegatingHandler

That’s all it take to get this working on the server side of things. On the browser side, in JavaScript, you can now add the HTTP Header and make a regual HTTP POST request to your server and see this request get converted to a HTTP PUT request.

Below is an example of how you would do this in jQuery:



```javascript
    function putMember() {
      $.ajax({
        url: "http://localhost/api/members/" + $("#username").val(),
        type: "POST",
        data: $("#newMemberForm").serialize(),
        headers: { "X-HTTP-Method-Override": "PUT" },
      })
      .done(function (data) {
      })
      .fail(function (e) {
        alert(e.responseText);
      })
      .always(function () { });
    }

```



Note that due to the Sam Origin policy that browsers enforce, you can only use the JavaScript above within the same domain.
