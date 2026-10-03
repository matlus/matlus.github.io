---
title: Self Host ASP.NET Web API
description: Run an ASP.NET Web API in a console process with HttpSelfHostServer,
  register routes, and exercise a CustomersController backed by an in-memory customer
  list.
datePublished: '2012-02-20'
dateModified: '2026-10-03'
tags:
- asp-net-web-api
- self-hosting
- rest
- csharp
hero: self-host-asp-net-web-api
draft: false
---

Self hosting in this context means, running your ASP.NER Web API project in your own Web Server rather than via IIS. Of course you’re not building a complete Http Web server either. You’re simply using functionality that now comes out of the box, where in just a couple of lines of code, you can have your “web server” up and running, ready to accept Http requests from your applications or browser.

Self hosting is one of 3 options of hosting now available. They are

1\. Hosting in IIS or “web Hosting” (this is the normal way of hosting)

2\. Self Hosting (we’re covering this in this post)

3\. In-memory hosting (we may cover this in a later post)

## Self Hosting Perquisites

In order to self host your ASP.NET Web API applications, you’ll need to download and install this NuGET package: [AspNetWebApi.SelfHost](https://web.archive.org/web/20240809175938/https://nuget.org/packages/AspNetWebApi.SelfHost) . The command line instruction required to installed this package using the Package Manager Console application is available at the linked page.

Of course I assume you have the other packages you need in order to build an ASP.NET Web API project already installed ([AspNetWebApi](https://web.archive.org/web/20240809175938/http://nuget.org/packages/aspnetwebapi) and [AspNetWebApi.Core](https://web.archive.org/web/20240809175938/http://nuget.org/packages/AspNetWebApi.Core)).

## First Self Hosted Web API Application

Start a new Console Application and then installed this NuGet package ([AspNetWebApi.SelfHost](https://web.archive.org/web/20240809175938/https://nuget.org/packages/AspNetWebApi.SelfHost)). In your Program.cs file, simply copy paste the entire code listing below (rename the file to match the class name as well). That will get your self hosted application up and running.

### Program.cs



```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.SelfHost;
using System.Web.Routing;
using System.Runtime.Serialization;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;

/*
   Packages required
   ASP.NET Web API Self Host
   https://nuget.org/packages/AspNetWebApi.SelfHost
   Package Manager Console command line: Install-Package AspNetWebApi.SelfHost 
 */

namespace SelfHostedAspNetWebApi
{
    class AspNetWebApiServer
    {
        static void Main(string[] args)
        {
            var baseAddress = "http://localhost:8080/";
            var selfHostconfiguration = new HttpSelfHostConfiguration(baseAddress);
            selfHostconfiguration.Routes.MapHttpRoute(
                name: "Customers API",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            var server = new HttpSelfHostServer(selfHostconfiguration);
            server.OpenAsync().Wait();
            Console.WriteLine("ASP.NET Web API Server Running...");
            Console.WriteLine("Listening at " + baseAddress);
            Console.WriteLine("");
            Console.ReadLine();
        }
    }
}
```



### Self Hosted ASP.NET Web API "Server" application

Notice that we’re using the regular ASP.NET Routing and we have one route defined. The <code>MapHttpRoute</code> (extension) method of Routes collection uses the new [HttpControllerRouteHandler](https://web.archive.org/web/20240809175938/http://msdn.microsoft.com/en-us/library/system.web.http.webhost.httpcontrollerroutehandler_methods(v=vs.108).aspx) class as it’s route handler. Which implies that your controllers need to descend from [ApiController](https://web.archive.org/web/20240809175938/http://msdn.microsoft.com/en-us/library/system.web.http.apicontroller(v=vs.108).aspx) (Similar to Web Hosted [ASP.NET Web API](/writing/asp-net-web-api-with-webforms/) application). Of course all of this is extensible but we’re looking at a basic application in this post.

Customer Controller

Add a new class to your console application project and name it and the class <code>CustomersController</code>. Copy paste the code shown below into this file.

### CustomersController.cs



```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace SelfHostedAspNetWebApi
{
    public class CustomersController : ApiController
    {
        private static List<Customer> customers =
            new List<Customer>
            {
                new Customer() { Id = 1, Name="George Washington", Email = "george.washington@whitehouse.gov", Phone="2025550001" },
                new Customer() { Id = 2, Name="John Adams", Email = "john.adams@whitehouse.gov", Phone="2025550002" },
                new Customer() { Id = 3, Name="Thomas Jefferson", Email = "thomas.jefferson@whitehouse.gov", Phone="2025550003" },
                new Customer() { Id = 4, Name="James Madison", Email = "james.madison@whitehouse.gov", Phone="2025550004" },
                new Customer() { Id = 5, Name="James Monroe", Email = "james.monroe@whitehouse.gov", Phone="2025550005" }
            };

        public IEnumerable<Customer> Get()
        {
            return customers;
        }

        public Customer Get(int id)
        {
            return customers.Where(c => c.Id == id).FirstOrDefault();
        }

        public HttpResponseMessage<Customer> Post(Customer customer)
        {
            var newId = customers.Max(c => c.Id);
            customer.Id = newId + 1;
            customers.Add(customer);
            var responseMessage = new HttpResponseMessage<Customer>(customer, System.Net.HttpStatusCode.Created);
            responseMessage.Headers.Location = new Uri(VirtualPathUtility.AppendTrailingSlash(Request.RequestUri.ToString()) + newId.ToString());
            return responseMessage;
        }

        public void Put(Customer customer)
        {
            var cust = customers.Where(c => c.Id == customer.Id).FirstOrDefault();
            if (cust != null)
            {
                cust.Name = customer.Name;
                cust.Email = customer.Email;
                cust.Phone = customer.Phone;
            }
        }

        public void Delete(int id)
        {
            var customer = customers.Where(c => c.Id == id).FirstOrDefault();
            if (customer != null)
                customers.Remove(customer);
        }
    }
}
```



### Customers Controller

This class is a regular Controller that descends from [ApiController](https://web.archive.org/web/20240809175938/http://msdn.microsoft.com/en-us/library/system.web.http.apicontroller(v=vs.108).aspx) and implements some methods. The methods are the standard GET, POST, PUT and DELETE methods (the CRUD methods). For demo purposes, this class also initializes an in-memory list of customers rather than retrieve them from a database.

For the moment just keep your eyes on the two Get methods. The urls for these methods as per the route we registered earlier in our <code>AspNetWebApiServer</code> class in the first code listing above are:

Get All Customers

[http://localhost:8080/api/customers/](https://web.archive.org/web/20240809175938/http://localhost:8080/api/customers/)

Get Specific Customer by Id

[http://localhost:8080/api/customers/1](https://web.archive.org/web/20240809175938/http://localhost:8080/api/customers/1)

Where 1 at the tail end of the url is the Id of the Customer you want to retrieve. Run your application and then open up a browser and issue these requests to see the results you your browser. Browser’s (At the moment) can’t make Http Requests using the PUT or DELETE verbs, so you can test the other methods using a browser, but you can test these methods using [Fildder2](https://web.archive.org/web/20240809175938/http://www.fiddler2.com/fiddler2/).

That takes care of the bare bones functional application. The Listing below is a more complete implementation of the **CustomersController** class.

In the next post ([HttpClient .NET 4.5](/writing/httpclient-net-4-5/)) we’ll take a look at implementing a client application that uses the new <code><a href="https://web.archive.org/web/20240809175938/http://msdn.microsoft.com/en-us/library/system.net.http.httpclient(v=vs.110).aspx" target="_blank">HttpClient</a></code> class to make calls against this (and other) RESTFul Http services using GET, POST, PUT and DELETE Http verbs.
