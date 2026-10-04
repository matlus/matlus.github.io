---
title: Cross Domain RESTful CRUD Operations using jQuery
description: 'Cross-domain CRUD needs changes on both sides: a Web API DelegatingHandler
  handles origin headers and method overrides while jQuery sends the matching requests.'
datePublished: '2012-03-29'
dateModified: '2012-03-29'
tags:
- asp-net-web-api
- rest
- cors
- jquery
- http-method-override
- csharp
- javascript
hero: cross-domain-restful-crud-operations-using-jquery
draft: false
---

So, you’ve built your brand spanking new RESTful service and it all works as expect only in the same domain. When you test it from a different domain, the GET methods work but the POST, PUT and DELETE methods don’t work as expected. Heck they don’t work at all.

The errors you see could be any one of the following

1\. Http Error 404 Not Found (see [REST APIs, PUT and DELETE cause HTTP Error 404.0 - Not Found](/writing/rest-apis-put-and-delete-cause-http-error-404/) to see how to fix this)

2\. Access Denied

3\. 405 Method not allowed

4\. Service does not support the method OPTIONS

If you’re attempting to support cross-domain (or [Cross-Origin Resource Sharing](https://web.archive.org/web/20240915042434/http://www.w3.org/TR/cors/) as it is officially called) RESTful CRUD operations from browser clients using JavaScript/jQuery etc. then this post is for you. However, the solution to these problems entails fixing the service side as well as ensuring you’re doing things correctly on the jQuery side. The solution presented in this post works on all major browsers (IE, Firefox, Chrome and Safari).

## Cross-Domain Protocol Backgrounder

If you’re not interested in understanding all of the Http protocol nuances that make up this problem as well as the solution, then skip to the next section.

## WEB API RESTful CRUD Service fixes

The fix comes in the form of a [DelegatingHandler](https://web.archive.org/web/20240915042434/http://msdn.microsoft.com/en-us/library/system.net.http.delegatinghandler(v=vs.110).aspx) (new to .NET 4.5). In fact it’s a simple extension to the XHttpMethodOverrideDelegatingHandler we developed in this post [DelegatingHandler for X-HTTP-Method-Override](/writing/delegatinghandler-for-x-http-method-override/). If you’ve read the previous section on the cross domain protocol backgrounder, then the code listing of the entire delegating handler will make sense to you. If you didn’t, well, then there is nothing to explain really. The code is really simple, it’s the complexity of the protocol that needs explaining.

## JsonpMediaTypeFormatter

Note: You’ll also need the JsonpMediaTypeFormatter from an earlier post [JsonpMediaTypeFormatter–Web API JSONP](/writing/jsonpmediatypeformatter-web-api-jsonp/), in order to support JSONP, which you will need to do, in order to support cross-domain JSON.

Here is the entire code for the delegating handler:

### XHttpMethodOverrideDelegatingHandler.cs



```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web;

namespace NuSI.Web.WebLib.DelegatingHandlers
{
    public class XHttpMethodOverrideDelegatingHandler : DelegatingHandler
    {
        static readonly string[] httpOverrideMethods = { "PUT", "DELETE" };
        static readonly string[] accessControlAllowMethods = { "POST", "PUT", "DELETE" };
        static readonly string httpMethodOverrideHeader = "X-HTTP-Method-Override";
        static readonly string ORIGIN_HEADER = "ORIGIN";
        static readonly string accessControlAllowOriginHeader = "Access-Control-Allow-Origin";
        static readonly string accessControlAllowMethodsHeader = "Access-Control-Allow-Methods";
        static readonly string accessControlAllowHeadersHeader = "Access-Control-Allow-Headers";

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            if (request.Method == HttpMethod.Post && request.Headers.Contains(httpMethodOverrideHeader))
            {
                var httpMethod = request.Headers.GetValues(httpMethodOverrideHeader).FirstOrDefault();
                if (httpOverrideMethods.Contains(httpMethod, StringComparer.InvariantCultureIgnoreCase))
                    request.Method = new HttpMethod(httpMethod);
            }

            var httpResponseMessage = base.SendAsync(request, cancellationToken);

            if (request.Method == HttpMethod.Options && request.Headers.Contains(ORIGIN_HEADER))
            {
                httpResponseMessage.Result.Headers.Add(accessControlAllowOriginHeader, request.Headers.GetValues(ORIGIN_HEADER).FirstOrDefault());
                httpResponseMessage.Result.Headers.Add(accessControlAllowMethodsHeader, String.Join(", ", accessControlAllowMethods));
                httpResponseMessage.Result.Headers.Add(accessControlAllowHeadersHeader, httpMethodOverrideHeader);
                httpResponseMessage.Result.StatusCode = HttpStatusCode.OK;
            }
            //No mater what the HttpMethod (POST, PUT, DELETE), if a Origin Header exists, we need to take care of it
            else if (request.Headers.Contains(ORIGIN_HEADER))
            {
                httpResponseMessage.Result.Headers.Add(accessControlAllowOriginHeader, request.Headers.GetValues(ORIGIN_HEADER).FirstOrDefault());
            }

            return httpResponseMessage;
        }
    }
}
```



### Entire code for the XHttpMethodOverrideDelegatingHandler

Don’t forget to register this handler in your Global’s Application\_Start event.

### Global.asax.cs



```csharp
        protected void Application_Start(object sender, EventArgs e)
        {
            RegisterRoutes(RouteTable.Routes);
            
            GlobalConfiguration.Configuration.Formatters.Insert(0, new JsonpMediaTypeFormatter()); 
            GlobalConfiguration.Configuration.MessageHandlers.Add(new XHttpMethodOverrideDelegatingHandler());            
        }

```



### Registering the MediaFormatter and Delegating Handler

## Cross Domain RESTful client using jQuery

the html page containing the html and jQuery goes here.

The html + jQuery client presented here will work against the ASP.NET WEB API CRUD service application we built in this post [ASP.NET Web API Supporting RESTful CRUD Operations](/writing/as-net-web-api-supporting-restful-crud-operations/). If you’ve got your own service, be sure to make all of the necessary changes to the jQuery code you see. Also make sure you change the value of the <code>baseAddress</code> JavaScript variable to be the URL to your service application.

The parts of interest here are the actual <code>$.ajax()</code> calls for the CRUD methods. In particular it is the options object that is passed to the <code>$.ajax()</code> method this is of primary importance. There are 4 methods that make AJAX calls in the JavaScript code and they are:

- <code>initializeMember()</code>
- <code>postMember()</code>
- <code>putMember()</code>
- <code>deleteMember()</code>

If you need to support older browsers that don’t support HTTP methods other than GET and POST, then please take a look at the post on the <code>X-HTTP-Method-Override</code> HTTP Header: [DelegatingHandler for X-HTTP-Method-Override](/writing/delegatinghandler-for-x-http-method-override/) for what changes you’ll need to make in your jQuery (again just the Options object that’s sent to the <code>$.ajax()</code> method).

### HtmljQuery RESTful CRUD client



```javascript
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <title></title>
  <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
  <style type="text/css">
    body
    {
      font-family: Tahoma, Arial;
    }
  </style>
</head>
<body>
  <form id="memberForm" class="dataEntryForm" method="post">
  <fieldset>
    <legend>New Customer</legend>
    <ul>
      <li>
        <label for="firstName" title="First Name">First Name</label>
        <input type="text" id="firstName" name="firstName" value="John" />
      </li>
      <li>
        <label for="lastName" title="Last Name">Last Name</label>
        <input type="text" id="lastName" name="lastName" value="Ely" />
      </li>
      <li>
        <label for="username" title="Username">Username</label>
        <input type="text" id="username" name="username" value="jely" />
      </li>
      <li>
        <label for="email" title="Email Address">Email</label>
        <input type="text" id="email" name="email" value="shivy@gmail.com" />
      </li>
    </ul>
  </fieldset>
  </form>
  <button onclick="postMember()">Post Member</button>
  <button onclick="putMember()">Put Member</button>
  <button onclick="deleteMember()">Delete Member</button>
  <div id="membersDiv"></div>
  
  <script type="text/javascript">

    var baseAddress = "http://localhost:17414/api/members/";
    
    $(function () {
      jQuery.support.cors = true;
      initializeMembers($("#membersDiv"));
    });

    function initializeMembers(elem) {
      $.ajax({
        url: baseAddress,
        dataType: "jsonp"
      })
        .done(function (data) {
          elem.empty();
          var ulElementId = "membersList";          
          var items = [];
          $.each(data, function (index, value) {
            items.push('<li data-member=\'' + JSON.stringify(value) + '\'>' + value.firstName + ' ' + value.lastName + '</i>');
          });
          $("<ul />", {
            "id": ulElementId,
            "class": "members-list",
            html: items.join('')
          }).appendTo(elem);

          $("#" + ulElementId).click(function (e) {
            var member = $(e.srcElement).data("member");
            assignFormFieldValues("memberForm", member);
          });
        })
        .fail(function (e) {
          alert("fail");
        })
        .always(function () { });
    }

    function assignFormFieldValues(formId, obj) {
      var fields = $("#" + formId).serializeArray();
      $.each(fields, function (index, field) {
        var f = $("[name=" + field.name + "]").val(obj[field.name]);        
      });
    }

    function postMember() {
      $.ajax({
        url: baseAddress,
        type: "POST",
        // Firefox reuires the dataType otherwise the "data" argument of the done callback
        // is just a string and not a JSON 
        dataType: 'json',
        accept: "application/json",
        data: $("#memberForm").serialize(),
      })
      .done(function (data) {        
        $("#membersList").append('<li data-member=\'' + JSON.stringify(data) + '\'>' + data.firstName + ' ' + data.lastName + '</i>');
      })
      .fail(function (e) {
        alert(e.statusText);
      })
      .always(function () { });
    }

    function putMember() {
      $.ajax({
        url: baseAddress + $("#username").val(),
        type: "POST",
        data: $("#memberForm").serialize(),
        headers: { "X-HTTP-Method-Override": "PUT" }
      })
      .done(function (data) {
        initializeMembers($("#membersDiv"));
      })
      .fail(function (e) {
        alert(e.statusText);
      })
      .always(function () { });
    }

    function deleteMember() {
      $.ajax({
        url: baseAddress + $("#username").val(),
        type: "POST",
        data: $("#memberForm").serialize(),
        headers: { "X-HTTP-Method-Override": "DELETE" }
      })
      .done(function (data) {
        initializeMembers($("#membersDiv"));
      })
      .fail(function (e) {
        alert(e.statusText);
      })
      .always(function () { });
    }
  </script>
</body>
</html>
```



### Code listing show the entire Html + jQuery RESTful CRUD client

## Testing the Cross-Domain CRUD Operation

Luckily, this part is not that difficult. Cross-domain from a browser’s perspective is not just domains but even ports. So if you’ve using IIS Express for development, your CRUD service application runs on a specific port. You can then have an html page in your IIS’s (the full blown version) root folder (typically wwwroot) with the html and jQuery listed earlier. You can then browse to this html page using [http://localhost/yourpage.html](https://web.archive.org/web/20240915042434/http://localhost/yourpage.html), just make sure you change the <code>baseAddress</code> variable to your service’s <code>baseAddress</code>.

If you don’t have IIS installed and don’t want to install it, you could simply start a new ASP.NET project and place the  entire Html + jQuery listing from above into the default.aspx of the new application. This application will run on a different port from your service application so you can run both projects to test this out.

If all else fails, you can deploy your service app to a staging website and test it against that.
