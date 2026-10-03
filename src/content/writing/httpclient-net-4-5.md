---
title: HttpClient .NET 4.5
description: Use HttpClient to send GET, POST, PUT, and DELETE requests, serialize
  Customer objects with ObjectContent, and read typed responses from a self-hosted
  Web API.
datePublished: '2012-02-20'
dateModified: '2026-10-03'
tags:
- httpclient
- rest
- json
- csharp
hero: httpclient-net-4-5
draft: false
---

<code><a href="https://web.archive.org/web/20240712143051/http://msdn.microsoft.com/en-us/library/system.net.http.httpclient(v=vs.110).aspx" target="_blank">HttpClient</a></code> has been around for quite some time now. It originally appeared as part of the REST Starter Kit in 2009. Since then it has gone through a huge number of changes and improvements (or over engineering some might argue) and a ton of breaking changes as well. Nonetheless, it’s intent was and still is to simplify client side Http programming and I think it does that quite well.

The new <code>HttpClient </code>has only async methods. That is you can’t make synchronous calls. You can make async calls synchronous (but I would advise against it). However, in this post the code you see is synchronous. Please also keep in mind that all of the code in this post and other posts is intentionally simple (that is not very object oriented) so as to help those who are learning something new stay sane. Once you’ve got the grasp of things, you should structure you code better and introduce exception handling etc.

One other thing that <code>HttpClient</code> does not do is throw exceptions when it receives Http Status code of the 500 and 400 series. The is a method on the <code><a href="https://web.archive.org/web/20240712143051/http://msdn.microsoft.com/en-us/library/system.net.http.httpresponsemessage(v=vs.110).aspx" target="_blank">HttpResponseMessage</a></code> called <code>EnsureSuccessStatusCode</code> which throws an exception if the IsSuccessStatusCode property for the HTTP response is false.

## Client for the service in a previous post

In this post we’re essentially building a very simple Http client for the WEB API Self hosted application we built in a previous post [Self Host ASP.NET Web API](/writing/self-host-asp-net-web-api/).

Start a new Console application and overwrite the contents of the Program.cs file with the code listing below.

### HttpClientRESTFul



```csharp
using System;
using System.Collections;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using SelfHostedAspNetWebApi;

/* Requires the following package from NuGet
   
   ASP.NET Web API (Beta) 4.0.20126.16343
   http://nuget.org/packages/aspnetwebapi
   Package Manager Console Command line: Install-Package HttpClient -Version 0.6.0
   
   System.Net.Http.Formatting
   http://nuget.org/packages/System.Net.Http.Formatting
   Package Manager Console Command line: Install-Package System.Net.Http.Formatting
 */

namespace HttpClientRESTFul
{
    class Program
    {
        static void Main(string[] args)
        {
            var serverAddress = "http://localhost:8080";

            using (var httpClient = new HttpClient() { BaseAddress = new Uri(serverAddress) })
            {
                //GET all customers
                var response = httpClient.GetStringAsync("api/customers").Result;
                Console.WriteLine("Response From Server:\r\n\r\n{0}", response);

                var newCustomer = new Customer { Name = "George Washington Jr.", Phone = "1-202-555-0100", Email = "gwjr@whitehouse.gov" };
                var requestMessage = new HttpRequestMessage();
                var objectContent = requestMessage.CreateContent<Customer>(
                    newCustomer,
                    MediaTypeHeaderValue.Parse("application/json"),
                    new MediaTypeFormatter[] { new JsonMediaTypeFormatter() },
                    new FormatterSelector());

                //POST new customer
                var responseMessage = httpClient.PostAsync("api/customers", objectContent).Result;
                var newlyCreatedCustomer = responseMessage.Content.ReadAsAsync<Customer>().Result;
                Console.WriteLine("Created (POST) new customer. New Customer Id is: " + newlyCreatedCustomer.Id.ToString());

                newlyCreatedCustomer.Name = "George Washington III";
                objectContent = requestMessage.CreateContent<Customer>(
                    newlyCreatedCustomer,
                    MediaTypeHeaderValue.Parse("application/json"),
                    new MediaTypeFormatter[] { new JsonMediaTypeFormatter() },
                    new FormatterSelector());

                //PUT newly created customer
                responseMessage = httpClient.PutAsync("api/customers/" + newlyCreatedCustomer.Id.ToString(), objectContent).Result;
                Console.WriteLine("Updated (PUT) newly created customer");

                //DELETE the newly created customer
                var r = httpClient.DeleteAsync("api/customers/" + newlyCreatedCustomer.Id.ToString()).Result;
                Console.WriteLine("Deleted (DELETE) newly created customer");
            }

            Console.ReadLine();
        }
    }
}

```



### The RESTFul client using HttpClient

You’ll need a couple of NuGet packages in order to be able to compile and run this application. I’ve provided links to them in the code listing above, at the very top.

You’ll also need the <code>CustomerController</code> class from the [Self Host ASP.NET Web API](/writing/self-host-asp-net-web-api/) project. This class in contained in the CustomerController.cs file code listing.

Before you run this application, make sure serverAddress matches the base address of your server application. Then run the server app first and then run this client application.

The code essentially executes GET,POST,PUT and DELETE methods on the service. The code is completely functional, but I’ve kept it really simply.

At this point you’re essentially done building the client application, however there are some points I’d like to make about the code that I think you should read.

### Receiving <code>IEnumerable&lt;Customer&gt;</code> instead of a string of JSON objects

Ideally, rather than receiving a list of customers as a string of JSON objects, you’d like to receive them as say an <code>IEnumerable&lt;Customer&gt;</code>. The HttpClient class makes this fairly simple to do. Take a look at the following code listing:

### GetCustomers Method



```csharp
private static IEnumerable<Customer> GetCustomers(HttpClient httpClient)
{
    var responseMessage = httpClient.GetAsync("api/customers/").Result;
    responseMessage.EnsureSuccessStatusCode();
    var customers = responseMessage.Content.ReadAsAsync<IEnumerable<Customer>>().Result;
    return customers;
}
```



### The GetCustomers method returning an IEnumerable

You’ll notice that we do a similar thing when we receive the result of POSTing a new Customer, in order to receive an instance of the newly created customer as an instance of Customer (instead of a string). Except here, we’re receiving a sequence of Customers rather than a single.

## ObjectContent constructor changed

If you look carefully at the code the “assembles” an instance of an HttpRequestMessage prior to calling the POST method on the server, you’ll notice we’re stuffing an instance of a (new) Customer instance into the “content”, before we make the http request. In other words, an instance of a customer it sent across the wire as a JSON object so the server side can create this new customer.

The way the HttpClient class works is that the HttpContent (The payload if you will) is abstracted into a class called [HttpContent](https://web.archive.org/web/20240712143051/http://msdn.microsoft.com/en-us/library/system.net.http.httpcontent(v=vs.110).aspx). This is an abstract class. However, out of the box, there are a number of descendants of this class that we could (have) used.

1. [StringContent](https://web.archive.org/web/20240712143051/http://msdn.microsoft.com/en-us/library/system.net.http.stringcontent(v=vs.110).aspx)
2. [ByteArrayContent](https://web.archive.org/web/20240712143051/http://msdn.microsoft.com/en-us/library/system.net.http.bytearraycontent(v=vs.110).aspx)
3. [MultipartContent](https://web.archive.org/web/20240712143051/http://msdn.microsoft.com/en-us/library/system.net.http.multipartcontent(v=vs.110).aspx)
4. [StreamContent](https://web.archive.org/web/20240712143051/http://msdn.microsoft.com/en-us/library/system.net.http.streamcontent(v=vs.110).aspx)

To keep things really simple, we could have just used the <code>StringContent</code> class, stuffed a JSON representation of our new customer (that we wanted POSTed to the server) and be done with it.

But I wanted this example to be a bit more real-world and so I wanted to use the ObjectContent type. The ASP.NET team has changed the constructor to internal. Not sure why. But what’s worse is not sure how else to use the ObjectContent. We could use a StreamContent and serialize of object instance to a stream, but that’s a lot more work.

So as it happens, I found a round-a-bout way of creating an instance of this class, as you can see in the very first code listing as well as below.

### Using ObjectContent to send an object instance



```csharp
                var requestMessage = new HttpRequestMessage();
                var objectContent = requestMessage.CreateContent<Customer>(
                    newCustomer,
                    MediaTypeHeaderValue.Parse("application/json"),
                    new MediaTypeFormatter[] { new JsonMediaTypeFormatter() },
                    new FormatterSelector());
```



### Creating an instance of an ObjectContent

At the time of this writing I couldn’t find any documentation or example of how else to do it, so you may want to keep a watch out for the correct or better way of doing this.
