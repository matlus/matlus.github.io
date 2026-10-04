---
title: ASP.NET Response.Redirect Performance Issue
description: Use the Response.Redirect overload with endResponse set to false to avoid
  ThreadAbortException, then structure request handling so execution finishes deliberately.
datePublished: '2011-03-02'
dateModified: '2011-03-02'
tags:
- asp-net
- error-handling
- csharp
hero: asp-net-response-redirect-performance-issue
draft: false
---



<a id="codelisting1"></a>



This is a short post and I'm writing this because I've seen a lot of people using <code>Response.Redirect(url)</code> or <code>Response.RedirectPremanent(url)</code> and not using the overloads:

- <code>Response.Redirect(url, false)</code>
- <code>Response.RedirectPermanent(url, false)</code>

So rather than repeat the same thing over and over, I've decided to write a blog post about it in the hopes that others may find it and learn from it. There are two overloads to these methods (I'm only showing the Response.Redirect method but the same applies to Response.RedirectPermanent):



```text
Response.Redirect(string url)
Response.Redirect(string url, bool endResponse)

```



You typically use <code>Response.Redirect</code> when we want to redirect a request to another page in our application or another website or a send an Http status 301 Permanently moved or something similar. In our code the way that this works is that the line right after the call to redirect *does not execute*. Indeed, most times (if not all the time) this is exactly the behavior we want/expect. It's like (in C#) saying <code>return</code> and the execution jumps right out of the current method. It makes structuring your flow of logic that much easier.

Here's the problem. Think about how, when you call Response.Redirect(url) the next line in our code is not executed (without explicitly saying return)? Yup, that's right, an exception was thrown. That's the only way to boot right out of a method without explicitly saying return. When we call Response.Redirect(url), it calls the second overload passing in <code>true</code> as the parameter to <code>endResponse</code>. What this does is, it calls <code>Response.End()</code>, and Response.End() throws a <code>ThreadAbortException</code> (that's the only way it can truly end the response).

So what we should do is use the second overload (always) and pass it <code>false</code> as the second parameter (always). But&#8230;.but&#8230;but, yes, I know, in that case our code continues to execute and that's not what we want!

There are two solutions to this predicament.

1. Structure our code such that the condition that warrants a Response.Redirect follows a path such that nothing else is done in our Page/Handler/Controller and our method ends gracefully.
2. Call <code>CompleteRequest()</code> right after calling Response.Redirect(url, false). This is a method of the ApplicationInstance object, which we can get from the current context, so something like HttpContext.ApplicationInstance.CompleteRequest();. Note that the ***execution of code will continue as normal*** (and not exit/abort). But what will happen is that as soon as the Page/Handler/Controller completes the response the ASP.NET pipeline will jump straight to the EndRequest event. So the Request does "complete" (without any ThreadAbortException), but your code also executes. This may not be something you want to happen. But I thought I'd mention it anyway.

As regards option 1 above, here is a code listing that show you what I mean. Think of the <code>BuildPage</code> method shown below as the <code>ProcessRequest</code> method of a handler. That is once this method finishes we're done processing the request (this is code I've pulled out from [Orion](/writing/orion/) by blog engine). There is only one case in which we want to process the request (the if condition). All other cases warrant either a permanent redirect or redirect. All of the code expected to be executed under the normal case is inside the if condition.

### Using Response.Redirect/RedirectPermanent to gracefully exist from a method



```csharp
    protected override void BuildPage(HttpContextBase httpContext, object model)
    {
      var postDisplayDataDto = (PostDisplayDataDto)model;
      if (model != null && postDisplayDataDto.PostsDataTable.Rows.Count == 1)
      {
        //Ttile of the Post + On + Blog name
        TitleView.Text = postDisplayDataDto.PostsDataTable.Rows[0][4].ToString() + " On " + BlogInfo.BlogInfoName;
        //Title of the Post plus the Post Text
        MetaDescriptionView.Description = postDisplayDataDto.PostsDataTable.Rows[0][4].ToString() + " " + postDisplayDataDto.PostsDataTable.Rows[0][5].ToString();
 
        RegisterView("Body", new PostView(httpContext, postDisplayDataDto,
          Configuration["CategoryCaption"],
          Configuration["TagCaption"]
          ));
      }
      else if (model == null)
        HttpContext.Response.RedirectPermanent(Url.Post(AppDomainAppVirtualPath, PostSlug), false);
      else
        PermanentlyRedirectToAppropriateLocation();
    }
```



### Showing one way to gracefully exit from a method
