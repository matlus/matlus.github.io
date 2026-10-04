---
title: ASP.NET Web API Supporting RESTful CRUD Operations
description: Map member CRUD operations to HTTP methods and resource URIs, then implement
  an ApiController with response status codes, Location headers, and error responses.
datePublished: '2012-03-03'
dateModified: '2012-03-03'
tags:
- asp-net-web-api
- rest
- error-handling
- csharp
hero: as-net-web-api-supporting-restful-crud-operations
draft: false
---

In an earlier article ([ASP.NET Web API with WebForms](/writing/asp-net-web-api-with-webforms/)) we saw how to get started with a Web API project and build a very simple service exposing some basic methods, but I left the implementation up to you. In this article, we’ll look at building out a complete ASP.NET Web API project (MVC or WebForms, doesn’t matter) that exposes (and thus implements) RESTful CRUD operations. Because we’re working at the ApiController level, it makes no difference whether you want to use ASP.NET MVC or ASP.NET WebForms. If you’re looking to build a RESTFul client as well, be sure to take a look at this post: [A Generic RESTFul CRUD HttpClient](/writing/a-generic-restful-crud-httpclient/). If you’re looking to build a RESTful client that works cross-domain using JavaScript/jQuery then take a look at this post: [Cross Domain RESTful CRUD Operations using jQuery](/writing/cross-domain-restful-crud-operations-using-jquery/).

## RESTful Basics

In this article we’ll be dealing with Members. That is, one of the resources our application is aware of is of type Member and the CRUD operations we’ll be supporting here are for this resource (or entity).

The service we’ll be building here supports the following API (the CRUD operations)



<table> <thead> <tr> <td>Operation</td> <td>HTTP Method</td> <td>Relative URI</td></tr></thead> <tbody> <tr> <td>Get all members</td> <td>GET</td> <td>/api/members</td></tr> <tr> <td>Create a new member</td> <td>POST</td> <td>/api/members</td></tr> <tr> <td>Get member</td> <td>GET</td> <td>/api/members/{username}</td></tr> <tr> <td>Update member</td> <td>PUT</td> <td>/api/members/{username}</td></tr> <tr> <td>Delete member</td> <td>DELETE</td> <td>/api/members/{username}</td></tr></tbody></table>



Let’s understand what the table of operations above is telling us.

The 1st row, tells us that we can get all members using the relative URI /api/members while using the HTTP GET method. This one is simple to use as well, since no HTTP content (The body) needs to be sent either. Simply type this URL (The complete URL and not just the relative URI) into your browser and our service should respond with all members in our database.

In the 2nd row, we see that we can use the same URI to create a new member. However, we need to use the HTTP POST method and in the HTTP content we need to send “data” that represents a new member. This new member can be sent along as www-url-form-encoded or JSON. If all this stuff about HTTP content and www-url-form-encoded doesn’t make sense, don’t worry. You don’t need to understand all while building the service.

Before moving on to the 3 row, if you examine the relative URIs in the table above, you’ll notice that the first two URIs are the same, but the HTTP methods are different. Further, there is no support for HTTP PUT and DELETE methods for that URI. Let’s think about this for a minute. What would it mean to do a PUT to that URI? It would mean, “update all members”. In the case of DELETE it would mean, “delete all members”. Obviously, for what we’re trying to do here, these two options are not applicable, or not supported.

In the 3rd row, the URI changes to include a variable that we know as username. This URI is used to GET a single member who is identified by the username that is passed in in the URI. For example:

[http://www.matlus.com/api/members/skumar](https://web.archive.org/web/20240712155625/http://www.matlus.com/api/members/skumar)

would return the member whose username is “skumar”. Looking at the last two rows, you can see the same URI above with an HTTP PUT method and sending the “member” as part of the HTTP content, will update the member identified by the username skumar. Calling the same URI with an HTTP DELETE method will delete the member identified by skumar.

I hope of this makes sense thus far. This is essentially REST and nothing really to do with the ASP.NET Web API, but if we’re building a RESTful API, we do need to grasp the information listed in the table above and the operations we’ll be supporting.

In general terms then, one could say that the mapping between REST and CRUD is (loosely)

- HTTP POST maps to **C**reate
- HTTP GET maps to **R**ead
- HTTP PUT maps to **U**pdate
- HTTP DELETE maps to **D**elete

Ok, enough REST for now. Lets move on to C#.

## RESTful CRUD Controller

We’ll start by defining  a route that will forward all request of the formats defined in the operations table above. So in our Global class’s Application Start event or the RegisterRoutes method (as the case may be), we need to add the following route.

### Global.asax.cs



```csharp
        void RegisterRoutes(RouteCollection routes)
        {
            RouteTable.Routes.MapHttpRoute(
                name: "Members API",
                routeTemplate: "api/members/{username}",
                defaults: new { controller = "Members", username = RouteParameter.Optional });
        }

```



### Registering a Route for our Members Controller

## Members Controller

You can see in the route that we’ve mapped that URI pattern to a controller called “Members”. So let’s add a new ApiController to our project and name it <code>MembersController</code> as per the naming convention. If you’re not familiar with adding an ApiController, please take a look at the earlier project [ASP.NET Web API with WebForms](/writing/asp-net-web-api-with-webforms/) for directions on how to do this.

Make sure you’ve named the class <code>MembersController</code> and not just Members. This is a convention and the <code>RouteHandler</code> that will route these calls to our controller expects to find a controller class called <code>MembersController</code> that descends from <code>ApiController</code>.

The code listing below shows the implementation of the <code>MemberController </code>class supporting all of the CRUD operations we talked about earlier.

### MemberController.cs



```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace Matlus.Web.WebLib.WebApi.Controllers
{
    public class MembersController : ApiController
    {
        public IEnumerable<Member> Get()
        {
            return BusinessModule.GetMembers();
        }

        public HttpResponseMessage<Member> Get(string username)
        {
            var member = BusinessModule.GetMemberWithUsername(username);
            if (member != null)
                return new HttpResponseMessage<Member>(member);
            else
            {
                var response = new HttpResponseMessage(HttpStatusCode.NotFound);
                response.Content = new StringContent("No Member with Username: " + username + ", was found.");
                throw new HttpResponseException(response);
            }
        }

        public HttpResponseMessage<Member> Post(Member member)
        {
            try
            {
                var id = BusinessModule.PostMember(member);
                member.Id = id;
                var response = new HttpResponseMessage<Member>(member) { StatusCode = HttpStatusCode.Created };
                response.Headers.Location = new Uri(VirtualPathUtility.AppendTrailingSlash(Request.RequestUri.ToString()) + member.Username);
                return response;
            }
            catch (MemberException e)
            {
                var response = new HttpResponseMessage(HttpStatusCode.Conflict);
                response.Content = new StringContent(e.Message);
                throw new HttpResponseException(response);
            }
        }

        public HttpResponseMessage Put(string username, Member member)
        {
            try
            {
                BusinessModule.PutMember(username, member);
                // Acceptable status codes are 200/201/204
                var response = new HttpResponseMessage(HttpStatusCode.NoContent);
                response.Headers.Location = new Uri(Request.RequestUri.ToString());
                return response;
            }
            catch (MemberException e)
            {
                var response = new HttpResponseMessage(HttpStatusCode.Conflict);
                response.Content = new StringContent(e.Message);
                throw new HttpResponseException(response);                
            }            
        }

        public HttpResponseMessage Delete(string username)
        {
            BusinessModule.DeleteMember(username);
            // Acceptable status codes are 200/202/204
            var response = new HttpResponseMessage(HttpStatusCode.Accepted);
            return response;
        }
    }
}
```



### The MemberController supporting RESTful CRUD Operations

The <code>Member</code> class that it (the <code>MemberController</code> class) references looks like the listing below. The <code>DataMember</code> attribute you see is from the System.Runtime.Serialization namespace which is in an assembly with the same name. So you’ll need to add the assembly reference to your project and add the namespace in the using section of the unit in which this class is defined.

The <code>DataMember</code> attribute comes into play at the time of serialization and deserialization. All we’re doing here is hinting to the  [<code>DataContractSerializer</code>](https://web.archive.org/web/20240712155625/http://msdn.microsoft.com/en-us/library/system.runtime.serialization.datacontractserializer.aspx "Serializes and deserializes an instance of a type into an XML stream or document using a supplied data contract.") (the built-in class that will serialize and de-serialize our <code>Member</code> class in this case) to use the alternate names. These alternate names as you might have noticed are in camel case. That is if you’re using this API from JavaScript, the property names would be more JavaScript like. While at the same time, in .NET the properties will have their normal Pascal casing.

### Member.cs



```csharp
    public sealed class Member
    {
        #region Properties
        private string username;
        [DataMember(Name = "username")]
        public string Username { get; set; }
        private int id;
        [DataMember(Name = "id")]
        public int Id { get; set; }
        private string firstName;
        [DataMember(Name = "firstName")]
        public string FirstName { get; set; }
        private string lastName;
        [DataMember(Name = "lastName")]
        public string LastName { get; set; }
        private string email;
        [DataMember(Name = "email")]
        public string Email { get; set; }
        private DateTime createdDate;
        [DataMember(Name = "createdDate")]
        public DateTime CreatedDate { get; set; }

        #endregion Properties
        public Member()
            : base()
        {
        }
    }

```



### The Member class

> ## Business Layer, Data Layer, Controller
> 
> Towards trying to keep things simple, yet production worthy, we’re not going to be looking at the business layer. <code>MembersController</code> class uses the <code>BusinessModule</code> class to get it data.
> 
> I my applications, all controllers, handlers, pages etc. never talk to (or know of) the Data layer, they only know of the business layer that exposes certain domain specific methods (such as <code>GetMembers()</code>, <code>GetMemberWithUsername()</code> etc.). So feel free to replace the <code>BusinessModule</code> class with a repository class of your own or whatever data provider technology you want to use. This article is about the implementation of the <code>MemberController</code> and not about data access.
> 
> ## RESTful CRUD Implementation
> 
> Examining the <code>MemberController</code> class (refer to the MemberController.cs listing from earlier) once again, you’ll notice that there are two Get() methods. The first one returns an <code>IEnumerable&lt;Member&gt;</code> and takes no arguments. The second one returns a single <code>Member</code> and takes a single string argument called <code>username</code>. These two methods map to rows 1 and 3 of our supported operations table above.
> 
> What I’d like you to focus on is the second Get() method. I’ve listed it once again below.
> 
> ### The Get(string username) method
> 
> 

```csharp
        public HttpResponseMessage<Member> Get(string username)
        {
            var member = BusinessModule.GetMemberWithUsername(username);
            if (member != null)
                return new HttpResponseMessage<Member>(member);
            else
            {
                var response = new HttpResponseMessage(HttpStatusCode.NotFound);
                response.Content = new StringContent("No Member with Username: " + username + ", was found.");
                throw new HttpResponseException(response);
            }
        }

```


> 
> ### The Get method that returns a specific member
> 
> You’ll notice that the <code>BusinessModule</code> could return a null. This will happen when you ask for a particular <code>Member</code> by username but there is no such member in the database. In that situation, in order to conform to HTTP (and REST) we can’t simply return a “null” or an HTTP status code of 200, which means, OK. But rather we need to let the client know that the resource it asked for was not found. And that’s really what the bulk of the implementation is doing (the else condition).
> 
> Similarly, the bulk of the <code>Post</code> method is essentially adhering to the HTTP (and REST) protocols. I won’t re-list the methods again, so please scroll back up to examine each of the methods as we discuss them.
> 
> The <code>Post</code> method returns an single <code>Member</code>. The member that was created. If the creation was successful, the <code>BusinessModule</code> returns the unique id of the member just created. We assign this id to the member argument so that when the client receives the member it will have the Id property correctly filled in. In addition to that, we should do two other things:
> 
> 1. Send back and Http status code of 201, which means “Created”
> 2. Send back a Location HTTP header, whose value is that URI for this newly created resource. Thus the client gets access to the URI of the newly created resource.
> 
> That’s the bulk of the code you see in the try part. Then in the case of an Exception, we need to do the following:
> 
> 1. Send back an HTTP status code of 409 (Conflict) or similar status code that will let the client know that there was a problem attempting the requested operation.
> 2. Add the Exception’s message as the response’s content (Assuming the message is a user friendly message)
> 3. throw an <code>HttpResponseException</code>
> 
> The Put method does something very similar to the Post method. Of course is calls the “Update” method of the <code>BusinessModule</code> (Which is this case is called <code>PutMember</code>). If all goes well it does the following:
> 
> 1. Send back an HTTP status code of 204 meaning “No Content". which means there is no HTTP Content (body) in the response, which in turn tells the client that all went as expected and that it should display whatever it see fit to the end user.
> 2. The HTTP Location header contains the URI to this modified resource (which is essentially the same as before, i.e., the URI for a given resource does not change.
> 
> In the case of an Exception, it does exactly what the <code>Post</code> method does.
> 
> The Delete method’s implementation is the simplest, as you can see. Since the DELETE method is [idempotent](https://web.archive.org/web/20240712155625/http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.1.2) (so are the GET and PUT method), it doesn’t matter if the Member identified by the username parameter exists or not, our controller simply responds with an HTTP status code of 202 which means “Accepted”.
> 
> That brings us to the end of this article. Of course, you’ll need a way to test your implementation. For that you can use Fiddler (if you’re familiar with it) or you can build your own client application, either a browser based JavaScript application or a desktop GUI application. We’ll take a look at these in future posts.
> 
> ## RFC 2616
> 
> For further reading on the HTTP protocol and the response codes we’ve discussed earlier, please take a look at the [RFC 2616](https://web.archive.org/web/20240712155625/http://www.w3.org/Protocols/rfc2616/rfc2616.html) document. The section on [Safe and Idempotent methods](https://web.archive.org/web/20240712155625/http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.1) explains why our controller’s implementation is the way it is.
