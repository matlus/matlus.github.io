---
title: ASP.NET MVC3 - Razor View Engine
description: Razor makes C# mixed with HTML easier to read through its @ syntax, code
  blocks, layouts, and sections. Worked templates show the output and the limits of
  view responsibilities.
datePublished: '2010-10-04'
dateModified: '2026-10-03'
tags:
- asp-net
- razor
- model-view-controller
- architectural-patterns
- csharp
hero: asp-net-mvc3-razor-view-engine
draft: false
---

As part of ASP.NET MVC3, we get a brand spanking new **View Engine.** In MVC2 the view engine we have access to by default is the ASP.NET Webforms view engine that uses Master file templates along with .aspx view templates and .ascx partial view templates.
## View Engines

In ASP.NET MVC, the view engine is responsible for parsing and compiling your views and partial views into C# or other .NET languages so as to be able to render the view into an html page. As it stands today in ASP.NET MVC, we have other options for view engines, such as [Spark](https://web.archive.org/web/20240415162151/http://sparkviewengine.com/), [NHmal](https://web.archive.org/web/20240415162151/http://code.google.com/p/nhaml/), [NDjango](https://web.archive.org/web/20240415162151/http://ndjango.org/index.php?title=NDjango_Home) and a few others. My main problem with those is that you have to learn another language in order to get the job done. Some of these alternatives do make code and markup interspersed more readable though.

### Alternative to ASP.NET MVC

If you're looking for an alternative to ASP.NET MVC but want to continue to follow the MVC design paradigm and have templates that have no code in them with **mind-bendingly fast performance**, take a look at [Quartz for ASP.NET](/writing/quartz-for-aspnet/) . This blog is powered by Quartz 
## Razor View Engine

The Razor view engine is new to ASP.NET MVC3 and I have to say that I really love the syntax it uses. One of the primary things that's kept me from using ASP.NET MVC in a production environment is that I never liked how C# code had to be interspersed with html mark up. Mind you, I'm not against having code interspersed with mark up. In fact I can't imagine real data driven web pages without some ability to iterate over data and such within markup, but I'm a stickler for maintainable and readable code and syntax that WebForms View Engine uses is a complete mess. With each new version, I'd try a few complex/real world views and when I'd look back at the code-markup combination it would be extremely difficult to read and therefore maintain. Using ASP.NET WebForms correctly still provided all of the benefits of ASP.NET MVC and then some. The story changes quite a bit with Razor. 
### ASP.NET MVC Preview 1 Requirements

MVC3 is compatible with the released version of MVC (or MVC2). In fact they can run side by side on the same machine. However, ASP.NET MVC3 does require the .NET 4.0 framework and VS.NET 2010. An ASP.NET MVC3 project supports multiple view engines, which means you can migrate your existing MVC projects to MVC3 and start using the Razor view engine for new views or convert some of your existing views to use the Razor view engine. 
## Razor Syntax

[Code Listing 1](#codeListing1) shows a simple view, that when rendered results in what you see in [code listing 2](#codeListing2). 

<a id="codeListing1"></a>
<a id="codeList1"></a>

 
### Simple View using Razor syntax



```html
@inherits System.Web.Mvc.WebViewPage<IEnumerable<BusinessLayer.Dto.ThumbnailDto>>

<!DOCTYPE html>
<html>
  <head>
    <title>Index2</title>
  </head>
<body>
@foreach(var thumb in Model) {
  <img src="@Url.Content("~/content/images/")@thumb.FileName" alt="@thumb.Title"/>
}
</body>
</html>
```



### Code Listing 1: A simple View using Razor syntax

## Syntax Highlighting and intellisense

The code highlighting tool I use does not highlight the Razor syntax and as a result you don't see (proper) syntax highlighting of code listings you see here. Note also, that MVC3 Preview1 does not have syntax highlighting or Intellisense. This will probably be provided in Preview 2, but as it stands today, your view pages show as black on white in VS.NET 2010. You'll notice that the <code><strong>@</strong></code> symbol is the new delimiter. You'll also notice that there is no closing delimiter. The Razor engine is extremely smart at figuring out the end of any code you write in your markup. Blocks of code however do need the standard C# open-close curly braces (<code>{ and }</code>), **but do NOT need a closing delimiter**. Also if you're calling a method that does not return a string you'll need to use the open/close curly like so <code>@{SomeCall(param1, param2);}</code>. Let's examine [Code listing 1](#codeList1). At the very top you'll notice a line that starts with the Razor delimiter. This line essentially says that this view inherits from the base class <code>System.Web.Mvc.WebViewPage</code> and that it is a strongly typed view whose model is a type of <code>IEnmerable&lt;BusinessLayer.Dto.ThumbnailDto&gt;</code>. Next, you'll notice that we have a <code>foreach</code> loop that iterates over the <code>Model</code> and while it iterates over this collection it produces an <code>&lt;img&gt;</code> tag for each item in the collection. The interesting bit here is the way we can set up the <code>src</code> and <code>alt</code> attributes from properties of the <code>ThumbnailDto</code> class. 

<a id="codeListing2"></a>


### Html Output of Code Listing 1



```html
<!DOCTYPE html>
<html>
  <head>
    <title>Index2</title>
  </head>
<body>
  <img src="/content/images/Sorcerer.jpg" alt="The Sorcerer&#39;s Apprentice"/>
  <img src="/content/images/Narnia.jpg" alt="The Chronicles of Narnia: The Voyage of the Dawn Treader"/>
</body>
</html>
```



### Code Listing 2: Showing the Html output of code listing 1

## Conditional Blocks

In ASP.NET MVC (with the current WebForms View Engine syntax), writing conditional statements interspersed with markup was a reading nightmare (and sometimes even a nightmare to write). People have come up with all kinds of solutions (I don't believe they are solutions really) to take out the conditional statements from the view and delegate them to Html helpers, partial views and what have you, because it just wasn't a pretty sight. With Razor, that's not the case anymore. [Code listing 3](#codeListing3) shows what a conditional statement embedded in markup looks like with Razor syntax. 

<a id="codeListing3"></a>


### Conditional Statements in Razor



```html
@if (Model.Count() == 0) {
  <p>Sorry, there are no movies as this time</p>
}
else {
  <p>We have @Model.Count() movies to show you.</p>
}
```



### Code Listing 3: Showing Conditional Statements in Razor

Notice how readable the code is and how simple it is to insert values of properties (of your model) into html. What if the count was the last thing in the sentence? That is what if you wanted a period right after the count is displayed, such as <code>We have @Model.Count().</code>, No problem, just put that period where you want it. The Razor parser is smart enough to figure out that the period is not part of code but rather mark up. Similarly, it is smart enough to figure out if the <code>@</code> symbol is part of say and email address literal or if it is used to delimit code. In case the content you want displayed is valid code (but you want it displayed as content), then simply escape the <code>@</code> in your content with <code>@@</code>.

## View Template and Layout/Master Page

Rather than show you bits of code snippets, I'm going to show you a View Template and a Layout Template (MaterPage) using the Razor syntax and highlight some key aspects of both. The image below shows you a screen shot of what the output looks like, while [Code Listing 4](#codeListing4) shows the view template that was used to render the html along with a LayoutPage (or Master Page) shown in [Code Listing 5](#codeListing5) and the generated Html is shown in [Code Listing 6](#codeListing6). The first thing you'll notice (on line 3) is that there is a code block. Code blocks have the syntax you see there and you can have simple regular code in thse code blocks. You can't declare methods and properties in code blocks, so don't try it.

### Beware! Code Blocks

As great as code blocks are, be very careful about what you do in these code blocks. Just like with WebForms View engine and ASP.NET WebForms, it is quite easy to break the MVC paradigm, where Views are only views and should not do or contain anything more than presentation related code. Take a look at this section [Breaking the MVC paradigm](#breakingmvcparadigm) later in this article for a functional view template that does exactly this. 

What we're doing inside the code block is adding an item to the <code>ViewData</code> property called "Title" and settings its value to "Movie Listing". In other words: <code>ViewData["Title"] = "Movie Listings"; </code><code>View</code> is an alias for <code>ViewModel</code> or <code>ViewData</code>. I don't particularly care for aliasing such things, especially in this case, since <code>View()</code> happens to be a method in <code>Controller</code> and you are writing code in the <code>View</code> so when you reference something called <code>View</code> in a view it almost feels like <code>this</code>. The <code>ViewData</code> is the mechanism by which a View can exchange data with Layout Pages or Master Pages. So in this case the view determines the html title of the page and the Layout Page will use this value to insert it into the correct place. In this way all Views can control what the html title of the rendered page needs to be. In the next line we associate this view with a Layout View Page or Master Page. <code>LayoutPage = "~/Views/Shared/SiteLayout.cshtml"; </code>Pretty simple. Next, you'll notice also, that in the code block I've declared and initialized a couple of variables, that I use in the <code>foreach</code> loop later on. In the <code>foreach</code> loop what we're trying to do is this: We're generating a bunch of floating <code>&lt;div&gt;</code> tags that contain images and depending on the number of columns we want, we need to clear the float and then continue on doing what was being done. So the condition within the loop checks for this and if true, inserts and additional <code>&lt;div&gt;</code> tag that clears the float. At the end, to ensure that content that follows does not end up floating we insert another <code>&lt;div&gt;</code> tag that clears the float but only if that condition is met.

## 

<figure data-recovered-figure="figure-01">
<a href="/images/writing/asp-net-mvc3-razor-view-engine/figure-01.webp"><img src="/images/writing/asp-net-mvc3-razor-view-engine/figure-01.webp" alt="A recreated three-column movie gallery demonstrates the original Razor view layout, using newly illustrated thumbnails." loading="lazy" /></a>
<figcaption data-reconstruction>The original gallery layout with newly illustrated thumbnail scenes; the three-column arrangement and visible captions are retained.</figcaption>
</figure>





<a id="codeListing4"></a>


### View Template



```html
@inherits System.Web.Mvc.WebViewPage<IEnumerable<BusinessLayer.Dto.ThumbnailDto>>

@{
    View.Title = "Movie Listings";
    LayoutPage = "~/Views/Shared/SiteLayout.cshtml";
    var columnsPerRow = 3;
    var colCount = -1;
}

@foreach(var thumbnail in Model) {
  if(++colCount % columnsPerRow == 0) {
    <div style="clear: both"></div>
  }
  <div style="float: left; width: 200px; overflow: hidden; margin: 0px 10px 10px 0px;">
    <div style="white-space: nowrap; height: 15px;">@thumbnail.Title</div>
    <img src="@Url.Content("~/thumbnails/asset/get/")@thumbnail.FileName/ty/" alt="" width="200" />
  </div>
}

@if (colCount % columnsPerRow != 0){
<div style="clear: both;"></div>
}
```



### Code Listing 4: Showing the View Template

The Layout page template has a couple of interesting things going on. First, you'll notice that the html title has been set to <code>View.Title</code>. Next you'll notice <code>@RenderSection("Header", optional:true) </code>Sections are equivalent to <code>ContentPlaceHolder</code> controls in WebForm/MVC2 parlance. The first parameter is the name of the section ("Header" in this case) and the second parameter is a <code>Boolean</code> type parameter called <code>optional</code>. In this case the parameter named <code>optional</code> has been set to <code>true</code> (This syntax in use here is C# 4.0 optional parameter syntax). An optional section means that Views are not required to provide an html output for the section, and you'll notice that our view template ([Code Listing 4](#codeListing4) does not in fact do anything for this section. If our view did in fact want to render html for this section we could modify our view template to include the following <code>@section header { &lt;h1&gt;This is the Header&lt;/h1&gt; } </code>This bit of code could be anywhere in your template and sections can contain any amount or kind of code and markup like you've seen already. Notice that the name of the header is not case sensitive. That is in the Layout page we named the section "Header", while in the view we've named the section "header". This seems to work currently. Since in the Layout page template the "Header" section comes before the "body", I'd recommended that you place the section template above the body's template but under the code block you see in [Code Listing 4](#codeListing4). The <code>@RenderBody()</code> is a special method that is replaced by the html generated by your View. I bet you've noticed by now that the html for the body (in your view) is not specifically called out like <code>sections</code> are. I think this is really neat, since at a bear minimum if your view is using a Layout page template then the html it generates should be the default. Meaning that it is obviously rendering the body part of the page, while the Layout template is doing the rest. And if you have other sections in your Layout page, then you call them out specifically and views can do the same. It just saves a little bit of typing. 

<a id="codeListing5"></a>



### Layout Page Template



```html
@inherits System.Web.Mvc.WebViewPage

<!DOCTYPE html>
<html>
  <head>
    <title>@View.Title</title>    
    <link href="@Url.Content("~/Content/Site.css")" rel="stylesheet" type="text/css" />
  </head>
  <body>
  @RenderSection("Header", optional:true)
  @RenderBody()
  </body>
</html>
```



### Code Listing 5: Showing the Layout Page (or Master Page) Template

## 

### Html Helpers and other methods

Razor View templates and Layout templates have full access to Html helpers just like MVC WebForms Views and Master Pages. Further, Razor View templates and Layout pages can also call methods that you might have defined in your base View or Layout classes. All of this works exactly like in the WebForms View engine. The syntax you'll use is the Razor syntax obviously. So if you're calling <code>Html.RenderAction</code> for example then the syntax is like so: <code>@{Html.RenderAction("BoxTop", "AdvertBox", new { Name = View.AdvertBoxTopName, Visible = View.AdvertBoxTopVisible });} </code>Notice that, in this case because <code>Html.RenderAction</code> does not return a string but in fact writes directly to the output stream, you wrap the call in curly braces. Methods that return a string will have syntax similar to <code>Url.Content()</code>, <code>@RenderSection()</code> and <code>@RenderBody()</code> etc. 
## 



<a id="codeListing6"></a>


### The Html that is generated



```html
<!DOCTYPE html>
<html>
  <head>
    <title>Movie Listings</title>
    <link href="/Content/Site.css" rel="stylesheet" type="text/css" />
  </head>
  <body>
  <div style="clear: both"></div>
  <div style="float: left; width: 200px; overflow: hidden; margin: 0px 10px 10px 0px;">
    <div style="white-space: nowrap; height: 15px;">Kolcsey - by Pixel Films</div>
    <img src="/thumbnails/asset/get/a41a9f30e323497982f49f8536060410/ty/" alt="" width="200" />
  </div>
  <div style="float: left; width: 200px; overflow: hidden; margin: 0px 10px 10px 0px;">
    <div style="white-space: nowrap; height: 15px;"></div>
    <img src="/thumbnails/asset/get/5133b848e0e24bcf962710ff2e6e02a3/ty/" alt="" width="200" />
  </div>
  <div style="float: left; width: 200px; overflow: hidden; margin: 0px 10px 10px 0px;">
    <div style="white-space: nowrap; height: 15px;">The Sorcerer&#39;s Apprentice</div>
    <img src="/thumbnails/asset/get/9d0dd5309e1f48ec9daa9b8a86e4b9d4/ty/" alt="" width="200" />
  </div>
  <div style="clear: both"></div>
  <div style="float: left; width: 200px; overflow: hidden; margin: 0px 10px 10px 0px;">
    <div style="white-space: nowrap; height: 15px;">The Chronicles of Narnia: The Voyage of the Dawn Treader</div>
    <img src="/thumbnails/asset/get/bb505b89ba4e40b7a03e8c9c4f2de4a1/ty/" alt="" width="200" />
  </div>
  <div style="float: left; width: 200px; overflow: hidden; margin: 0px 10px 10px 0px;">
    <div style="white-space: nowrap; height: 15px;">City of Lakes - Feature Film</div>
    <img src="/thumbnails/asset/get/0fc60348078040838593443114bcf768/ty/" alt="" width="200" />
  </div>
  <div style="float: left; width: 200px; overflow: hidden; margin: 0px 10px 10px 0px;">
    <div style="white-space: nowrap; height: 15px;">City Of Lakes</div>
    <img src="/thumbnails/asset/get/e2cab72852ae4a6e966281f99b0343e6/ty/" alt="" width="200" />
  </div>
  <div style="clear: both"></div>
  <div style="float: left; width: 200px; overflow: hidden; margin: 0px 10px 10px 0px;">
    <div style="white-space: nowrap; height: 15px;">Hungarian Ad</div>
    <img src="/thumbnails/asset/get/83dd07c0811a4ee29c9f52a3ef5bf53c/ty/" alt="" width="200" />
  </div>
  <div style="clear: both;"></div>
  </body>
</html>
```



### Code Listing 6: Showing the generated Html

<a id="breakingmvcparadigm"></a>

## Breaking the MVC paradigm

As mentioned earlier, code blocks have the potential of breaking the MVC paradigm and sending us right back to the classic ASP era, where the "page" contains the database connection and access code, business logic and presentation. But maybe there are times, when you do need to do something quick and dirty. Below I show you a view template that essentially has all of the logic in the view itself. But remember, stay away from this sort of thing! Below is a template that works! 

<a id="codeListing7"></a>


### View Template breaking the MVC paradigm



```html
@inherits System.Web.Mvc.WebViewPage
@using System.Configuration;
@using System.Data;
@using System.Data.Common;

@{
    View.Title = "Movie Listings";
    LayoutPage = "~/Views/Shared/SiteLayout.cshtml";
    var columnsPerRow = 3;
    var colCount = -1;

    var connectionStringSettings = ConfigurationManager.ConnectionStrings["MoviewsDB"];
    var dbProviderFactory = DbProviderFactories.GetFactory(connectionStringSettings.ProviderName);
    var dbConnection = dbProviderFactory.CreateConnection();
    dbConnection.ConnectionString = connectionStringSettings.ConnectionString;
    var command = dbConnection.CreateCommand();
    command.CommandText = "SELECT * FROM MOVIE";    
}

<ul>
@{dbConnection.Open();}
@using(var dr = command.ExecuteReader(CommandBehavior.CloseConnection)) {
  while(dr.Read()) {
    <li>@dr[0]</li>
  }
}
</ul>
```



### Code Listing 7: Showing a function Razor View Template breaking the MVC paradigm
