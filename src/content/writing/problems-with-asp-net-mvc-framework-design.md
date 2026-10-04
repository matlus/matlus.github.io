---
title: ASP.NET MVC Framework Design Problems
description: ASP.NET MVC's indirect access to views spreads responsibilities across
  controllers and templates. ViewData, child actions, and typed view instances frame
  the critique.
datePublished: '2010-10-27'
dateModified: '2010-10-27'
tags:
- asp-net
- architecture
- model-view-controller
- architectural-patterns
- csharp
hero: problems-with-asp-net-mvc-framework-design
draft: false
---

The MVC design pattern is probably the most misunderstood and misinterpreted design pattern. It’s probably due to this that the various implementations of the MVC design pattern are so different. Another way to look at it is that the MVC design pattern is not the most suitable design pattern for web based applications and as a result, many implementations/interpretations of the MVC design pattern go against the original intent. This article is about what I think are the problems with the design and implementation of Microsoft’s ASP.NET MVC framework. I believe that one design flaw leads to a tower of design flaws and as it relates to the ASP.NET MVC implementation, a couple of design flaws have led to many others. Rather than focus on Microsoft’s implementation of the MVC design pattern, I’ll be focusing on system design related issues (independent of the MVC design pattern) from the perspective of Web Application framework design. **Figure 1** below shows you the design and control flow of the various parts of the ASP.NET MVC framework. 

<a id="figure1"></a>





<figure data-recovered-figure="figure-01">
<a href="/images/writing/problems-with-asp-net-mvc-framework-design/figure-01.webp"><img src="/images/writing/problems-with-asp-net-mvc-framework-design/figure-01.webp" alt="MVC control flow connects the request, controller, model, view and three partials, including the RenderAction child-request path." loading="lazy" /></a>
<figcaption data-reconstruction>Redrawn from the original control-flow diagram, retaining its relationships and multiplicities.</figcaption>
</figure>



### Figure 1: ASP.NET MVC Design and control flow

## List of Problems with ASP.NET MVC

1. No access to view or partial view instances
2. ViewData is your loosely typed information carrier
3. Controller is not really in control
4. Child Actions have no sense of the Request Context
5. Views are coupled to controllers
6. Referencing Layout Pages using virtual paths
7. Routing
8. Html interspersed with code and code interspersed with html nightmare
9. Naming conventions

## No Access to View or Partial View instances

I believe this is the first major design flaw (not from an MVC design perspective but rather, just from a framework design perspective) and the cause of a number of other design issues. Because a controller doesn't have access to an instance of the view it enlists, the only way for a controller to communicate information to a view is by using ViewData which is a <code>Dictionary&lt;string, object&gt;</code>. So you can stuff anything you want in there, with each “thing” identified by a string key. The two code listings below show you some code that do the same things but in entirely different ways. [Code listing 1](#codeListing1), shows you the code you'd write in a controller's <code>Action</code> method in ASP.NET MVC and [Code listing 2](#codeListing2) shows you the code you'd write in a builder's <code>BuildPage()</code> method in [Quartz for ASP.NET](/writing/quartz-for-aspnet/) 

<a id="codeListing1"></a>





```csharp
public ActionResult Index()
{
  /* If a specific features is selected */
  if (FeatureId != 0)
  {
    var featurePageModel = BusinessModule.GetFeaturePageModel(FeatureId);

    ViewData["Title"] = featurePageModel.CurrentFeature.Title;
    ViewData["AdBoxTopViewBoxTitle"] = "More Features";
    ViewData["AdBoxTopViewModel"] = featurePageModel.AdBoxModel;
    ViewData.Model = featurePageModel.CurrentFeature;
    return View("FeatureDisplay");
  }
  else
  {
    var featuresAllPageModel = BusinessModule.GetFeaturesAllPageModel();

    ViewData["Title"] = featurePageModel.CurrentFeature.Title;
    ViewData["AdBoxTopViewBoxTitle"] = "Highlights";
    ViewData["AdBoxTopViewModel"] = featuresAllPageModel.AdBoxModel;
    ViewData.Model = featuresAllPageModel.Features;
    return View("FeaturesAllView");
  }
}
```



### Code Listing 1: Showing ASP.NET MVC code in a Controller Action method



<a id="codeListing2"></a>





```text
protected override void BuildPage(HttpContextBase httpContext, object model)
{
  /* If a specific features is selected */
  if (FeatureId != 0)
  {
    var featurePageModel = (FeaturePageModel)model;

    TitleView.Title = featurePageModel.CurrentFeature.Title;
    AdBoxTopView.BoxTitle = "More Features";
    AdBoxTopView.Model = featurePageModel.AdBoxModel;
    RegisterView("Body", new FeatureDisplayView(httpContext,
      this, featurePageModel.CurrentFeature));
  }
  else
  {
    var featuresAllPageModel = (FeaturesAllPageModel)model;

    TitleView.Title = "Builder for ASP.NET - Features";
    AdBoxTopView.BoxTitle = "Highlights";
    AdBoxTopView.Model = featuresAllPageModel.AdBoxModel;
    RegisterView("Body", new FeaturesAllView(httpContext, this,
      featuresAllPageModel.Features));
  }
}
```



### Code Listing 2: Showing Builder for ASP.NET code in a Builder's BuildPage() method

The problems with this ([code listing 1](#codeListing1)) approach are:

1. The controller can’t ensure that the view and all partial views are looking for (and getting) the data it stuffed in ViewData using the same string keys.
2. By looking at the code in the controller's <code>action</code> method, it is impossible to tell what is really going on, because all you see is a bunch of things added to ViewData, but you can’t tell who is using what (if at all). That is, you can't tell which View and or partial view is using what thing in the dictionary and if this thing (the item in the dictionary) is even the correct type for the other thing (view and/or partial view) using it
3. No strong typing, and so no type checking, no compile time checks and no IDE navigation help between controller and view's methods and properties, sub classes/super classes
4. If the same partial view is used by other controllers then these controllers also need to use the same string keys to stuff their data into ViewData. But there is no way to ensure that at the time of writing or reading code
5. If the API of the partial view changes or the names of the keys a partial view relies upon changes there is no way to tell during development time what pages are going to break. In a strongly typed system like .NET a simple Ctrl + Shift + B would highlight all such breaking changes. But this is not the case with ASP.NET MVC due to the loosely typed ViewData

<a id="viewmodelsubsettingissue"></a>

A strongly typed view makes thing slightly better. So you can define a specific ViewModel for your view and now the view can refer to this ViewModel is a strongly typed manner. But what about the partial views? Needless to say that if you analyze all this you'll conclude that:

1. The controller has to know about all the requirements of the view, partial views, master views as well as any child actions
2. Either the view further breaks down your ViewModel into sub viewmodels and hands these sub viewmodels to each of the partial views. Or, every partial view and master view are privy to some other view's data. If you do the former, then the view needs to be aware of what the partial views need (just like the controller needs to know), which means both the controller and view need to know about the partial views, master views and child actions. So that's not any better. Doing the later is not correct either.

If the controller had access to instances of the view, partial views, master views etc. then you'd have code like that shown in [Code listing 2](#codeListing2). Doing all of the above \*is\* the controller's concern. If not, these concerns propagate throughout. Take a look at [Figure 3](#figure3). It shows you the connectivity and control flow of what the picture would look like where the controller has direct access to the view, partial views and master views.
## The Controller is not really in control

Take a look at [Figure 1](#figure1), and you’ll see that the controller only really talks to the view (via ViewData nonetheless because it never really has access to an instance of the view). It doesn’t control or seemingly know of the partial views this view may in turn enlist, in order to get the job done. But the controller does need to know of the partial views because it has to pass data and instructions to partial views. One could argue separation of concerns here. But I beg to differ because propagating responsibilities down the line makes a system incoherent, unmanageable and a maintenance/debugging nightmare. You have to follow bread crumbs from the controller to the view and from there to other partial views just to get a sense of what is going on and who is doing it and who is using what piece of data (that the controller put into ViewData). A big part of the reason for this design seems to be that the view needs to be compiled (the html + code) and so an instance of the view can only be realized after compiling. However, since the view does not use a code file, the controller won't know how to reference the view since it doesn't have a class type to reference at the time of compilation. One could get around this by having the view descend from one of your own base classes, that way you can reference the view solely as the base type and so the controller can be compiled. But getting an instance of a view (due to the ViewEngine and compilation model) is not that easy. [Code listing 3](#codeListing3), below shows how you can get an instance of a view. It's pretty convoluted, since it is not the intent of code compilation model. 

<a id="codeListing3"></a>





```csharp
  public class HomeController : BaseController
  {
    public ActionResult Index()
    {
      ViewData["Title"] = "Movies In Theaters";
      ViewData["AdvertBoxTopName"] = "Popular Channels";
      ViewData.Model = BusinessModule.GetHomePageThumbnails();

      ViewEngineResult result = new ViewEngineResult(
        new RazorViewExt(ControllerContext,
        "~/Views/Home/Index.cshtml",
        "~/Views/Shared/LayoutSite.cshtml"),
        new RazorViewEngine());      
      
      return View(result.View);
    }
  }

  public class RazorViewExt : RazorView
  {
    public RazorViewExt(ControllerContext controllerContext, string viewPath,
      string layoutPath)
      :base(controllerContext, viewPath, layoutPath, false, null) 
    {

    }

    protected override void RenderView(ViewContext viewContext, TextWriter writer,
      object instance)
    {
      /* This view descends from BaseHomeIndexView */
      BaseHomeIndexView viewInstance = (BaseHomeIndexView)instance;
      /* viewInstance is now a valid reference to the Home Controller's
       * Index action's view */

      
      /* The other way to do this is to treat the parameter "instance"
       * as dynamic */
      /* this will allow you to set properties and call methods,
       * but no strong typing */
      dynamic viewInstanceDyn = instance;
      viewInstanceDyn.SomeProperty = "SomeValue";

      base.RenderView(viewContext, writer, instance);
    }
  }
```



### Code Listing 3: Getting a reference to an instance of a View

If you created instances of your own classes that implemented <code>IView</code>, then you get all the benefits and none of the demerits. That tells me that the current design (and inability to program in a strongly typed manner and all the other things we've been talking about so far) are due to one or more of the following:

1. A design limitation in the way the compilation model/ViewEngine works
2. They gave up code files for views (they were there initially) without realizing the down side
3. Or, that's how they intended the design to be.

## The View is in control

One could argue that (in the ASP.NET MVC design) the view is really in control. Well, at least insofar as the partial views and passing data on to them is concerned. The issues with this reasoning are:

1. For a view to be in control, the controller needs to know what the view needs, since the view doesn't get its data directly from the model. So once again, concerns have been propagated rather than being confined
2. The view is not really in control of the partial views it enlists. The only way it can communicate to a partial view is – you guessed it, ViewData (or a subset of a ViewModel, but we already [talked about the issue with that](#viewmodelsubsettingissue))

It’s almost as if no one wants to take responsibility and so everyone needs to be concerned!
## RenderAction() / Child Actions

Let me start by stating the problem <code>RenderAction()</code> is trying to solve. Imagine that in your page, you have a menu system. Typically, menu systems are complex because they are contextual and they depend on the user and her access rights and the page she is on. As a result, one could argue that the menu is not the concern of the view. Ok, I could argue either way, but I’ll go along with this argument. 

<a id="figure2"></a>





<figure data-recovered-figure="figure-02">
<a href="/images/writing/problems-with-asp-net-mvc-framework-design/figure-02.webp"><img src="/images/writing/problems-with-asp-net-mvc-framework-design/figure-02.webp" alt="The same MVC diagram highlights the View, partials and child-action path while dimming the original controller and model." loading="lazy" /></a>
<figcaption data-reconstruction>Redrawn from the original RenderAction illustration, preserving its highlighted portion of the flow.</figcaption>
</figure>



### Figure 2: Showing the control flow for <code>RenderAction()</code>

So the view enlists the services of the Child Action (that is <code>RenderAction()</code> really calls out to another action. This action could be in any controller and is not limited to an action in the controller that started the chain reaction. If we’re arguing separation of concerns, then why is the view calling out to a child action in the first place? Further, in order to call out to a child action (using <code>RenderAction()</code>) it has to be completely aware of the data to pass on to it (again using ViewData to extract the correct item(s) or portions of particular item(s). In other words it is coupled to the Child Action. If the child action changes its API (the parameters and/or types of these parameters) all views that call out to this child action that is not supposedly their concern need to change. And in a situation like this that’s pretty much every view in your system! Let’s say for argument sake that the menu controller (and the views and partial views involved) is self sufficient in that it can function completely as expected using information it can get via the Request context (i.e. request path information, query strings, cookies, session, user identity etc.). I would imagine that if the menu system were designed properly, then that is how it would be designed. Well, it so happens, that when you call into a child action, it is a brand new request (it basically goes back out to the entry point of the ASP.NET pipeline and re-enters the pipeline as a brand new request). See [Figure 2](#figure2). The problem with this design is that the context of the original request is completely lost. So the menu controller doesn't get the information it needs. But wait, the original view has to ensure that it sends all of the information it needs when it calls out to it using <code>RenderAction()</code>. Do you see this tsunami rushing back at you? No, ok, If the view has to send the data to the child action, who provides the view with this data? The controller of course! So now every controller and every view in the system are completely aware of and coupled to this supposedly “not your concern” child action. Well, without really being aware, that is. If you look at [Figure 2](#figure2) again, you’ll start to see the flaws in the design by simply looking at the interconnections between the various parts and the flow of control. Compare that with what you see in [Figure 3](#figure3) below 

<a id="figure3"></a>





<figure data-recovered-figure="figure-03">
<a href="/images/writing/problems-with-asp-net-mvc-framework-design/figure-03.webp"><img src="/images/writing/problems-with-asp-net-mvc-framework-design/figure-03.webp" alt="A Builder receives the request and directly composes five Views within a Page, with links to a Model and a subordinate Builder." loading="lazy" /></a>
<figcaption data-reconstruction>Redrawn from the original Builder composition diagram, preserving all five Views and their direct connections.</figcaption>
</figure>



You'll also notice in [Figure 2](#figure2), that the control hands of the job of rendering the menu to the menu controller (the second controller in the figure). The controller doesn't need to know what information or data to provide the second controller because this controller has the complete request context of the original (the same request really) request. The design shown in [Figure 3](#figure3) solves of the issues cited thus far.

1. The Controller is in control
2. The controller has direct access to all views/partial views, master views etc. as instances of classes
3. The Child Action issue doesn't exist

There are a few other design issues, that I'll mention briefly but I won't explain the issues in detail. They are:

1. Routing - Separation of concerns
   - Is setting default values for action method parameters the concern of the routing engine or would you rather, the method implementation take care of that? In .NET 4.0 one can even define default parameter values in method signatures.
   - Shouldn't on be able to define the routes the controller says it will handle be in the controller rather than in a central location?
2. Html and Code interspersed - Well, you either don't mind it or you can't stand it.
   - However, the current design forces both. That is, html + code and code + html
3. HtmlHelperitis
4. Attributeitis
5. Rubyitis

## Naming conventions

I guess Rubyitis could be blamed for the naming and loose typing conventions in ASP.NET MVC? It is a well known and accepted norm to name method names as verbs or verb phrases. Similarly names of properties should be noun or noun phrases. So while in a controller action method, when you see something called <code>View</code>. What do you think it is? Is it a property or a method? If it is a method, is it returning something or not? And if it is a method and it is returning something, what is it returning? You can't tell any of this from the name of the method. Yes, it is a name of a method and it returns an <code>ActionResult</code> Now when you’re in a view, you have access to something called <code>View</code>. What do you supposed that is? I'll give you a clue. You could also write: <code>View.Title</code>. Did that help? Or are you even more confused?
