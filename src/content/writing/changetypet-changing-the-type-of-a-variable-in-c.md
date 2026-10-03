---
title: ChangeType<T> - Changing the type of a variable in C#
description: ChangeType<T> converts request strings through registered binders, handling
  numbers, arrays, enums, and custom DTOs while keeping conversion calls consistent
  across web pages.
datePublished: '2010-11-08'
dateModified: '2026-10-03'
tags:
- request-binding
- type-conversion
- asp-net
- csharp
hero: changetypet-changing-the-type-of-a-variable-in-c
draft: false
---

Working on Web applications invariably means you need to change the data received (which is generally in the form of a string) into some other data type such as <code>Int32</code> or <code>Double</code> etc. In the .NET framework there are a few ways in which you can accomplish this (sort of):

- Using the <code><a href="https://web.archive.org/web/20240415161728/http://msdn.microsoft.com/en-us/library/system.convert(v=VS.100).aspx" target="_blank">Convert</a></code> static class
- Using the <code><a href="https://web.archive.org/web/20240415161728/http://msdn.microsoft.com/en-us/library/dtb69x08.aspx" target="_blank">Convert.ChangeType</a></code> method if your types implement the<code><a href="https://web.archive.org/web/20240415161728/http://msdn.microsoft.com/en-us/library/system.iconvertible.aspx" target="_blank">IConvertible</a></code> interface
- Using the <code><a href="https://web.archive.org/web/20240415161728/http://msdn.microsoft.com/en-us/library/ms171819.aspx" target="_blank">Type Descriptor</a></code> Architecture that's part of the .NET framework (typically used by visual controls at design time)

## Converting from String to ValueTypes

Typically, converting from a string to <code>ValueTypes</code> is fairly simple since you can either use the <code>Convert.ToXXX</code> or use the <code>XXX.Parse()</code> methods. In fact on the face of it this doesn't seem like a problem that needs a solution since the solutions already exist. However, when you're building an application, you don't want keep repeating your code, and as it applies Web applications, this is a need you have in every page of your website. That is, there are some Form fields or QueryStrings that you're interested in that need to be converted from a string to another data type. And because there is no real framework in place that can handle this very common scenario you end up writing the same code over and over.
## A Solution to the ChangeType problem

Let me start with stating the problem clearly. You've got data coming to you in the form of a string, typically in the form of a <code>NameValueCollection</code>, since the <code>Request</code> object provides the <code>Form</code> fields and <code>QueryString</code> in the form of NameValueCollections. You want to extract the values from these collections to assign them to variables or properties you've defined in your class. This data is typically user input data so you need to accommodate the various styles in which a user may input data. So let's look at a specific case. We have a variable or property of type <code>Int32</code> called <code>Price</code>. The user may input this data in the form in one of the following ways:

1. 4236
2. $4236
3. 4,236
4. $4,236

Or leave the field blank. Another common scenario is a form field that accepts tag that are comma separated, such as: <code>C#,ASP.NET,Http</code> and you need to convert these values to a string[] in your code. Ideally, you'd want one method in a class within your framework that can do all this for you. Let's call this method <code>ChangeType</code>, since this method needs to return different kinds of types it could either return an <code>Object</code> type or we could have a generic method in the form



```csharp
public T ChangeType<T>(string parameterName, T defaultValue = default(T))
```



You'll quickly realize that implementing this method is really not that simple. The reason is that you can't convert the return type of this method to be a specific type even though you know the type parameter is that type. In other words the code below won't compile with the error, "Cannot convert type int to 'T'" or "Cannot implicitly convert type int to 'T'".



```csharp
public T ChangeType<T>(string parameterName, T defaultValue = default(T))
{
  Type typeOft = typeof(T);
  var value = Request.Form[parameterName];

  if (typeOft == typeof(Int32))
    return (T)Int32.Parse(value);
  else if (typeOft == typeof(Int64))
    return (T)Int64.Parse(value);
}
```



### A Simple Solution

A simple (non extensible) solution would be to have this method call out to other methods that return an <code>Object</code> type and you can then cast it to <code>T</code> in this method and return it. Like so.



```csharp
public T ChangeType<T>(string parameterName, T defaultValue = default(T))
{
  Type typeOft = typeof(T);
  var value = Request.Form[parameterName];

  if (String.IsNullOrEmpty(value.Trim()))
    return default(T);
  if (typeOft == typeof(Int32))
    return (T)ConvertToInt32(value);
  else if (typeOft == typeof(Int64))
    return (T)ConvertToInt64(value);
  else if (typeOft == typeof(Double))
    return (T)ConvertToDouble(value);
  else if (typeOft == typeof(Decimal))
    return (T)ConvertToDecimal(value);
  return default(T);
}
```



And the implementations of the secondary methods might look like this:



```csharp
private object ConvertToInt32(string value)
{
  return Int32.Parse(value,
    NumberStyles.Currency ^ NumberStyles.AllowDecimalPoint);
}

private object ConvertToInt64(string value)
{
  return Int64.Parse(value,
    NumberStyles.Currency ^ NumberStyles.AllowDecimalPoint);
}

private object ConvertToDouble(string value)
{
  return Double.Parse(value, NumberStyles.Currency);
}

private object ConvertToDecimal(string value)
{
  return Decimal.Parse(value, NumberStyles.Currency);
}
```



## An Extensible solution for ChangeType&lt;T>

The solution I present is an extensible solution, in that you can add your own binders for types (custom types) that you'd like to handle. The way you'd use the solution is really simple. In your page class for example, you'd call this method like so:



```text
int amount = ChangeType<int>("Amount");
```



If you wanted to specify a default value (other than zero in this case) in case that field was not entered by the user then you could do this:



```text
int amount = ChangeType<int>("Amount", -1);
```



In the case of the tags field that needs to be converted to a string[]



```text
string[] tags = ChangeType<string[]>("tags");
```



There are 3 parts to this solution.

1. And Interface called <code>IRequestBinder</code>. Your custom binders will implement this interface (just one method)
2. The <code>RequestBinder</code> class that maintains a list of registered binders and issues the appropriate binder
3. A Generic method <code>ChangeType&lt;T&gt;</code> that does all the hard work of abstracting all of this and allows you to write code like that shown above.

So first, lets take a look at the <code>IRequestBinder</code> interface



```csharp
public interface IRequestBinder
{
  object Bind(HttpContextBase httpContext, Type convertToType,
    string parameterName = null, object defaultValue = null);
}
```



The <code>RequestBinder</code> is the class you register your binders with by using the <code>Add</code> method. If you have binders that you want your system to handle out of the box, then you can register those binders in the static constructor of this class as you can see the the code listing below. Because the class is a static class you can register a binder from anywhere in your system as well. As a result, you don't have to modify the class in order to register new binders. Simply call the <code>Add</code> static method of the class from anywhere in your application. The <code>RequestBinder</code> class handles all of the registration as well as instantiation of your binder classes for you. Furthermore, once it has created an instance of your binder class, if maintains that instance in a dictionary so it doesn't have to keep creating instances each time you need a binder for the same type again.



```csharp
public static class RequestBinder
{
  private static readonly Dictionary<string, RuntimeTypeHandle>
    registeredBinders = new Dictionary<string, RuntimeTypeHandle>();
  private static readonly Dictionary<string, IRequestBinder>
    instantiatedBinders = new Dictionary<string, IRequestBinder>();

  static RequestBinder()
  {
    Add(typeof(String), typeof(StringRequestBinder));
    Add(typeof(Int32), typeof(Int32RequestBinder));
    Add(typeof(Int64), typeof(Int64RequestBinder));
    Add(typeof(Double), typeof(DoubleRequestBinder));
    Add(typeof(DateTime), typeof(DateTimeRequestBinder));
    Add(typeof(Boolean), typeof(BooleanRequestBinder));
    Add(typeof(Decimal), typeof(DecimalRequestBinder));
    Add(typeof(Int32[]), typeof(Int32ArrayRequestBinder));
    Add(typeof(String[]), typeof(StringArrayRequestBinder));
    Add(typeof(Double[]), typeof(DoubleArrayRequestBinder));
    Add(typeof(Enum), typeof(EnumRequestBinder));
  }

  public static void Add(Type binderForType, Type requestBinderType)
  {
    Type interfaceType = requestBinderType.GetInterface("IRequestBinder");
    if (interfaceType != null)
    {
      var fullName = binderForType.FullName;
      if (registeredBinders.ContainsKey(fullName))
        registeredBinders.Remove(fullName);
      registeredBinders.Add(fullName, requestBinderType.TypeHandle);
    }
  }

  public static bool Contains(Type type)
  {
    return registeredBinders.ContainsKey(type.FullName);
  }

  public static IRequestBinder GetBinder(Type type)
  {
    var fullName = type.FullName;
    if (!registeredBinders.ContainsKey(fullName))
      throw new RequestBinderException(
        "No RequestBinder found for Type: " + fullName);
    if (instantiatedBinders.ContainsKey(fullName))
      return instantiatedBinders[fullName];
    else
    {
      var typeHandle = registeredBinders[fullName];
      IRequestBinder binder = 
        (IRequestBinder)Activator.CreateInstance(
        Type.GetTypeFromHandle(typeHandle));
      instantiatedBinders.Add(fullName, binder);
      return binder;
    }
  }
}
```



In order to retrieve a registered binder, you'll use the <code>GetBinder</code> method passng in the <code>Type</code> for which you need a binder. So for example if you need the binder for an <code>Int32</code> type you'll make the following call.



```text
var binder = RequestBinder.GetBinder(typeof(Int32));
Int32 value = (Int32)binder.Bind(HttpContext, type, parameterName, defaultValue);
```



In order to make all of this a lot easier to use we can have our ChangeType&lt;T> method do all the work like so.



```text
protected T ChangeType<T>(string parameterName,
  T defaultValue = default(T))
{
  Type type = typeof(T);
  if (RequestBinder.Contains(type))
    return (T)RequestBinder
      .GetBinder(type)
      .Bind(HttpContext, type, parameterName, defaultValue);
  else if (type.IsEnum)
    return (T)RequestBinder
      .GetBinder(typeof(Enum))
      .Bind(HttpContext, type, parameterName, defaultValue);
  else
    return defaultValue;        
}
```



## Handling Custom Types

What if you wanted the <code>RequestBinder</code> to be able to handle your custom types? Well, it's a simple matter of registering a binder for your custom type. However the ChangeType&lt;T> method probably needs an overload since you don't need to send it the name of a parameter since typically, the custom object binds to multiple fields in your form. So the overloaded method would look like this:



```csharp
protected T ChangeType<T>() where T : class, new()
{
  Type type = typeof(T);
  if (RequestBinder.Contains(type))
    return (T)RequestBinder.GetBinder(type).Bind(HttpContext, type);
  else
    return default(T);
}
```



## the Complete Solution

The code listing below is a listing on the <code>RequetBinder</code> class along with various custom binders that handle the default scenarios for the most part. There is a base class called <code>RequestBinderBase</code> that has some common functionality the other binders use. But you don't need to have your binders descend from this base class unless you need that functionality.
### RequestBinder and others



```csharp
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Globalization;
using System.Web;
using Matlus.Web.Builder.Exceptions;

namespace Matlus.Web.Builder
{
  public interface IRequestBinder
  {
    object Bind(HttpContextBase httpContext, Type convertToType,
      string parameterName = null, object defaultValue = null);
  }

  public static class RequestBinder
  {
    private static readonly Dictionary<string, RuntimeTypeHandle>
      registeredBinders = new Dictionary<string, RuntimeTypeHandle>();
    private static readonly Dictionary<string, IRequestBinder>
      instantiatedBinders = new Dictionary<string, IRequestBinder>();

    static RequestBinder()
    {
      Add(typeof(String), typeof(StringRequestBinder));
      Add(typeof(Int32), typeof(Int32RequestBinder));
      Add(typeof(Int64), typeof(Int64RequestBinder));
      Add(typeof(Double), typeof(DoubleRequestBinder));
      Add(typeof(DateTime), typeof(DateTimeRequestBinder));
      Add(typeof(Boolean), typeof(BooleanRequestBinder));
      Add(typeof(Decimal), typeof(DecimalRequestBinder));
      Add(typeof(Int32[]), typeof(Int32ArrayRequestBinder));
      Add(typeof(String[]), typeof(StringArrayRequestBinder));
      Add(typeof(Double[]), typeof(DoubleArrayRequestBinder));
      Add(typeof(Enum), typeof(EnumRequestBinder));
    }

    public static void Add(Type binderForType, Type requestBinderType)
    {
      Type interfaceType = requestBinderType.GetInterface("IRequestBinder");
      if (interfaceType != null)
      {
        var fullName = binderForType.FullName;
        if (registeredBinders.ContainsKey(fullName))
          registeredBinders.Remove(fullName);
        registeredBinders.Add(fullName, requestBinderType.TypeHandle);
      }
    }

    public static bool Contains(Type type)
    {
      return registeredBinders.ContainsKey(type.FullName);
    }

    public static IRequestBinder GetBinder(Type type)
    {
      var fullName = type.FullName;
      if (!registeredBinders.ContainsKey(fullName))
        throw new RequestBinderException(
          "No RequestBinder found for Type: " + fullName);
      if (instantiatedBinders.ContainsKey(fullName))
        return instantiatedBinders[fullName];
      else
      {
        var typeHandle = registeredBinders[fullName];
        IRequestBinder binder =
          (IRequestBinder)Activator.CreateInstance(
          Type.GetTypeFromHandle(typeHandle));
        instantiatedBinders.Add(fullName, binder);
        return binder;
      }
    }
  }

  public abstract class RequestBinderBase : IRequestBinder
  {
    protected static NameValueCollection GetRequestNameValueCollection(HttpContextBase httpContext)
    {
      var combinedNameValueCollection = new NameValueCollection();
      foreach (string key in httpContext.Request.Form.Keys)
      {
        var value = httpContext.Request.Form[key];
        if (value != null)
          combinedNameValueCollection.Add(key, value);
      }

      foreach (string key in httpContext.Request.QueryString.Keys)
      {
        var value = httpContext.Request.QueryString[key];
        if (value != null)
          combinedNameValueCollection.Add(key, value);
      }
      return combinedNameValueCollection;
    }

    #region IRequestBinder Members

    public abstract object Bind(HttpContextBase httpContext, Type convertToType, string parameterName = null, object defaultValue = null);

    #endregion
  }

  public sealed class Int32RequestBinder : RequestBinderBase
  {
    public override object Bind(HttpContextBase httpContext, Type convertToType, string parameterName = null, object defaultValue = null)
    {
      var value = GetRequestNameValueCollection(httpContext)[parameterName];
      if (!String.IsNullOrEmpty(value))
      {
        return Int32.Parse(value, NumberStyles.Currency ^ NumberStyles.AllowDecimalPoint);
      }
      else
        return defaultValue;
    }
  }

  public sealed class StringRequestBinder : RequestBinderBase
  {
    public override object Bind(HttpContextBase httpContext, Type convertToType, string parameterName = null, object defaultValue = null)
    {
      var value = GetRequestNameValueCollection(httpContext)[parameterName];
      if (!String.IsNullOrEmpty(value))
        return value;
      else
        return defaultValue;
    }
  }

  public sealed class Int64RequestBinder : RequestBinderBase
  {
    public override object Bind(HttpContextBase httpContext, Type convertToType, string parameterName = null, object defaultValue = null)
    {
      var value = GetRequestNameValueCollection(httpContext)[parameterName];
      if (!String.IsNullOrEmpty(value))
      {
        return Int64.Parse(value, NumberStyles.Currency ^ NumberStyles.AllowDecimalPoint);
      }
      else
        return defaultValue;
    }
  }

  public sealed class DoubleRequestBinder : RequestBinderBase
  {
    public override object Bind(HttpContextBase httpContext, Type convertToType, string parameterName = null, object defaultValue = null)
    {
      var value = GetRequestNameValueCollection(httpContext)[parameterName];
      if (!String.IsNullOrEmpty(value))
      {
        return Double.Parse(value, NumberStyles.Currency);
      }
      else
        return defaultValue;
    }
  }

  public sealed class DateTimeRequestBinder : RequestBinderBase
  {
    public override object Bind(HttpContextBase httpContext, Type convertToType, string parameterName = null, object defaultValue = null)
    {
      var value = GetRequestNameValueCollection(httpContext)[parameterName];
      if (!String.IsNullOrEmpty(value))
      {
        return DateTime.Parse(value);
      }
      else
        return defaultValue;
    }
  }

  public sealed class DecimalRequestBinder : RequestBinderBase
  {
    public override object Bind(HttpContextBase httpContext, Type convertToType, string parameterName = null, object defaultValue = null)
    {
      var value = GetRequestNameValueCollection(httpContext)[parameterName];
      if (!String.IsNullOrEmpty(value))
      {
        return Decimal.Parse(value, NumberStyles.Currency);
      }
      else
        return defaultValue;
    }
  }

  public sealed class BooleanRequestBinder : RequestBinderBase
  {
    public override object Bind(HttpContextBase httpContext, Type convertToType, string parameterName = null, object defaultValue = null)
    {
      var value = GetRequestNameValueCollection(httpContext)[parameterName];
      if (!String.IsNullOrEmpty(value))
      {
        switch (value.ToString().Trim())
        {
          case "False":
          case "false":
          case "0":
          case "off":
          case "":
            return false;
          case "True":
          case "true":
          case "1":
          case "on":
            return true;
          default:
            return false;
        }
      }
      else
        return defaultValue;
    }
  }

  public sealed class StringArrayRequestBinder : RequestBinderBase
  {
    public override object Bind(HttpContextBase httpContext, Type convertToType, string parameterName = null, object defaultValue = null)
    {
      var value = GetRequestNameValueCollection(httpContext)[parameterName];
      if (!String.IsNullOrEmpty(value))
      {
        value = value.Trim();
        if (value.Length == 0)
          return Activator.CreateInstance(convertToType, new object[] { 0 });
        else
        {
          var values = value.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
          var strArray = new String[values.Length];
          for (int i = 0; i < values.Length; i++)
            strArray[i] = values[i];
          return strArray;
        }
      }
      return defaultValue;
    }
  }

  public sealed class Int32ArrayRequestBinder : RequestBinderBase
  {
    #region IRequestBinder Members

    public override object Bind(HttpContextBase httpContext, Type convertToType, string parameterName = null, object defaultValue = null)
    {
      var value = GetRequestNameValueCollection(httpContext)[parameterName];
      if (!String.IsNullOrEmpty(value))
      {
        value = value.Trim();
        if (value.Length == 0)
          return Activator.CreateInstance(convertToType, new object[] { 0 });
        else
        {
          var values = value.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
          var intArray = new Int32[values.Length];
          for (int i = 0; i < values.Length; i++)
            intArray[i] = Int32.Parse(values[i]);
          return intArray;
        }
      }
      return defaultValue;
    }

    #endregion
  }

  public sealed class DoubleArrayRequestBinder : RequestBinderBase
  {
    #region IRequestBinder Members

    public override object Bind(HttpContextBase httpContext, Type convertToType, string parameterName = null, object defaultValue = null)
    {
      var value = GetRequestNameValueCollection(httpContext)[parameterName];
      if (!String.IsNullOrEmpty(value))
      {
        value = value.Trim();
        if (value.Length == 0)
          return Activator.CreateInstance(convertToType, new object[] { 0 });
        else
        {
          var values = value.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
          var dblArray = new Double[values.Length];
          for (int i = 0; i < values.Length; i++)
            dblArray[i] = Double.Parse(values[i]);
          return dblArray;
        }
      }
      return defaultValue;
    }

    #endregion
  }

  public sealed class EnumRequestBinder : RequestBinderBase
  {
    public override object Bind(HttpContextBase httpContext, Type convertToType, string parameterName = null, object defaultValue = null)
    {
      var value = GetRequestNameValueCollection(httpContext)[parameterName];
      if (!String.IsNullOrEmpty(value))
      {
        return Enum.Parse(convertToType, value);
      }
      else
        return defaultValue;
    }
  }

}
```



## Handling Custom classes (DTOs)

The class <code>DtoBinder</code> listed below can handle most DTO type classes, including properties that are arrays or <code>Int32</code> or <code>string</code>.
### DtoBinder.cs



```csharp
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Reflection;
using System.Web;

namespace Matlus.Web.Builder
{
  public static class DtoBinder
  {
    private static readonly BindingFlags PROP_BINDING_FLAGS = BindingFlags.Instance | BindingFlags.Public | BindingFlags.IgnoreCase;
    private static readonly BindingFlags PROP_SET_BINDING_FLAGS = BindingFlags.SetProperty | BindingFlags.SetField | BindingFlags.IgnoreCase;

    public static object GetPropertyValue(object dtoObject, string propertyName)
    {
      PropertyInfo propInfo = dtoObject.GetType().GetProperty(propertyName, PROP_BINDING_FLAGS);
      if (propInfo != null)
        return propInfo.GetValue(dtoObject, null);
      else
        return null;
    }

    public static Dictionary<string, PropertyInfo> GetPropertyInfos(object dtoObject)
    {
      var properties = new Dictionary<string, PropertyInfo>();
      foreach (var propInfo in dtoObject.GetType().GetProperties(PROP_BINDING_FLAGS))
        properties.Add(propInfo.Name, propInfo);
      return properties;
    }

    public static T CreateInstanceFromRequest<T>(HttpRequestBase request) where T : new()
    {      
      Type t = typeof(T);
      var propertyInfos = t.GetProperties(PROP_BINDING_FLAGS);
      var instance = new T();
      
      foreach (var propInfo in propertyInfos)
      {
        var value = request.Form[propInfo.Name];
        if (value == null)
          value = request.QueryString[propInfo.Name];
        if (value != null)
          SetPropertyValue(instance, propInfo, value);
      }
      return instance;
    }

    public static void SetPropertyValue(object dtoObject, string propertyName, object propertyValue)
    {
      var propInfo = dtoObject.GetType().GetProperty(propertyName, PROP_BINDING_FLAGS);
      SetPropertyValue(dtoObject, propInfo, propertyValue);
    }

    private static void CleanUpPropertyValue<TResult>(ref object propertyValue) where TResult : struct
    {
      var value = propertyValue as String;
      if (value != null)
      {
        var trimmed = value.Trim();
        if (trimmed.Length == 0)
          propertyValue = default(TResult);
        else
        {
          Type resultType = typeof(TResult);

          if (resultType == typeof(Int32))
            propertyValue = ConvertToInt32(trimmed);
          else if (resultType == typeof(Int64))
            propertyValue = ConvertToInt64(trimmed);
          else if (resultType == typeof(Double))
            propertyValue = ConvertToDouble(trimmed);
          else if (resultType == typeof(Decimal))
            propertyValue = ConvertToDecimal(trimmed);
          else
            propertyValue = trimmed;
        }
      }
    }

    public static void SetPropertyValue(object dtoObject, PropertyInfo propInfo, object propertyValue)
    {
      Type propType = propInfo.PropertyType;
      var typeCode = Type.GetTypeCode(propertyValue.GetType());

      if (propType == typeof(String))
        propInfo.SetValue(dtoObject, propertyValue, PROP_SET_BINDING_FLAGS, null, null, CultureInfo.CurrentCulture);
      else if (propType == typeof(Int32))
      {
        CleanUpPropertyValue<Int32>(ref propertyValue);        
        propInfo.SetValue(dtoObject, propertyValue, PROP_SET_BINDING_FLAGS, null, null, CultureInfo.CurrentCulture);
      }
      else if (propType == typeof(Int64))
      {
        CleanUpPropertyValue<Int64>(ref propertyValue);
        propInfo.SetValue(dtoObject, propertyValue, PROP_SET_BINDING_FLAGS, null, null, CultureInfo.CurrentCulture);
      }
      else if (propType == typeof(Boolean))
        propInfo.SetValue(dtoObject, ConvertToBool(propertyValue), PROP_SET_BINDING_FLAGS, null, null, CultureInfo.CurrentCulture);
      else if (propType == typeof(DateTime))
      {
        CleanUpPropertyValue<DateTime>(ref propertyValue);
        propInfo.SetValue(dtoObject, Convert.ToDateTime(propertyValue), PROP_SET_BINDING_FLAGS, null, null, CultureInfo.CurrentCulture);
      }
      else if (propType == typeof(Double))
      {
        CleanUpPropertyValue<Double>(ref propertyValue);
        propInfo.SetValue(dtoObject, propertyValue, PROP_SET_BINDING_FLAGS, null, null, CultureInfo.CurrentCulture);
      }
      else if (propType == typeof(Decimal))
      {
        CleanUpPropertyValue<Decimal>(ref propertyValue);
        propInfo.SetValue(dtoObject, Convert.ToDecimal(propertyValue), PROP_SET_BINDING_FLAGS, null, null, CultureInfo.CurrentCulture);
      }
      else if (propType.IsEnum)
        propInfo.SetValue(dtoObject, Enum.Parse(propType, Convert.ToString(propertyValue), true), PROP_SET_BINDING_FLAGS, null, null, CultureInfo.CurrentCulture);
      else if (propType == typeof(Array))
        propInfo.SetValue(dtoObject, propertyValue, PROP_SET_BINDING_FLAGS, null, null, CultureInfo.CurrentCulture);
      else if (propType == typeof(String[]))
      {
        if (propertyValue is String)
        {
          var propertyValueAsString = propertyValue.ToString().Trim();
          if (propertyValueAsString.Length == 0)
            propertyValue = new string[0];
          else
            propertyValue = propertyValueAsString.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
        }
        propInfo.SetValue(dtoObject, propertyValue, PROP_SET_BINDING_FLAGS, null, null, CultureInfo.CurrentCulture);
      }
      else if (propType == typeof(Int32[]) || propType == typeof(Int64[]))
      {
        if (propertyValue is String)
        {
          var propertyValueAsString = propertyValue.ToString().Trim();
          if (propertyValueAsString.Length == 0)
            propertyValue = Activator.CreateInstance(propType, new object[] { 0 });
          else
          {
            var values = propertyValueAsString.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
            if (propType == typeof(Int32[]))
            {
              var intArray = new Int32[values.Length];
              for (int i = 0; i < values.Length; i++)
                intArray[i] = Int32.Parse(values[i]);
              propertyValue = intArray;
            }
            else
            {
              var intArray = new Int64[values.Length];
              for (int i = 0; i < values.Length; i++)
                intArray[i] = Int64.Parse(values[i]);
              propertyValue = intArray;
            }
          }
        }
        propInfo.SetValue(dtoObject, propertyValue, PROP_SET_BINDING_FLAGS, null, null, CultureInfo.CurrentCulture);
      }
    }

    private static Int32 ConvertToInt32(string value)
    {
      return Int32.Parse(value, NumberStyles.Currency ^ NumberStyles.AllowDecimalPoint);
    }

    private static Int64 ConvertToInt64(string value)
    {
      return Int64.Parse(value, NumberStyles.Currency ^ NumberStyles.AllowDecimalPoint);
    }

    private static Double ConvertToDouble(string value)
    {
      return Double.Parse(value, NumberStyles.Currency);
    }

    private static Decimal ConvertToDecimal(string value)
    {
      return Decimal.Parse(value, NumberStyles.Currency);
    }

    private static bool ConvertToBool(object objBool)
    {
      switch (objBool.ToString().Trim())
      {
        case "False":
        case "false":
        case "0":
        case "off":
        case "":
          return false;
        case "True":
        case "true":
        case "1":
        case "on":
          return true;
        default:
          return false;
      }
    }
  }
}
```



Then in order to invoke the DtoBinder from the <code>ChangeType&lt;T&gt;</code> method, you'll need to make a small modification to its implementation. The complete implementations are shown below:
### ChangeType methods



```csharp
protected T ChangeType<T>() where T : class, new()
{
  Type type = typeof(T);
  if (RequestBinder.Contains(type))
    return (T)RequestBinder.GetBinder(type).Bind(HttpContext, type);
  else if (!type.IsValueType)
    return DtoBinder.CreateInstanceFromRequest<T>(Request);
  else
    return default(T);
}

protected T ChangeType<T>(string parameterName, T defaultValue = default(T))
{
  Type type = typeof(T);
  if (RequestBinder.Contains(type))
    return (T)RequestBinder.GetBinder(type).Bind(HttpContext, type, parameterName, defaultValue);
  else if (type.IsEnum)
    return (T)RequestBinder.GetBinder(typeof(Enum)).Bind(HttpContext, type, parameterName, defaultValue);
  else
    return defaultValue;        
}
```


