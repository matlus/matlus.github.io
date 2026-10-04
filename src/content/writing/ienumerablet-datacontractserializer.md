---
title: DataContractSerializer-IEnumerable<T>
description: A JsonSerializer streams IEnumerable<T> directly to JSON, preserving
  DataMember names and supporting JSONP while a DbDataReader wrapper avoids building
  an intermediate list.
datePublished: '2011-01-25'
dateModified: '2011-01-25'
tags:
- serialization
- json
- datareaders
- csharp
hero: ienumerablet-datacontractserializer
draft: false
---

The [<code>DataContractSerializer</code>](https://web.archive.org/web/20240415161635/http://msdn.microsoft.com/en-us/library/system.runtime.serialization.datacontractserializer.aspx "Serializes and deserializes an instance of a type into an XML stream or document using a supplied data contract.") class is mainly used in WCF services but you can use it in any kind of project including ASP.NET based applications.

There are some nice features this class offers in contrast to [<code>JavaScriptSerializer</code>](https://web.archive.org/web/20240415161635/http://msdn.microsoft.com/en-us/library/system.web.script.serialization.javascriptserializer.aspx "Provides serialization and deserialization functionality for AJAX-enabled applications.") like the ability to control how property names get serialized using the DataMember attribute. One problem with this class is that it does not support serializing <code>IEnumerable&lt;T&gt;</code>. It supports generic collections such as <code>List&lt;T&gt;</code> but that's not what I need since there is a reason I'm using an <code>IEnumerable&lt;T&gt;</code> to serialize to JSON.

In this post I'll present a <code><a href="#jsonserializer">JsonSerlizer</a></code> class that supports <code>IEnumerable&lt;T&gt;.</code> Some of the features of this class are as follows:

1. Supports serializing IEnumberable&lt;T> in addition to other collections types as well as non-collection types
2. Serializes directly to System.IO.Stream (in contrast to JavaScriptSerializer)
3. Supports JSONP, so you can publish your JSON feeds to the public

First let me begin by showing how I get the data and why I need to serialize and IEnumerable&lt;T> in the first place.

In [code listing 1](#codelisting1) below, you can see the class <code>SubCategoryDrw</code> that will be serialized. It looks a bit complex but it's really just a POCO. It's what I call a [DataReader Wrapper](/writing/datareader-wrappers-typesafe/ "DataReader Wrappers - TypeSafe"). Anyway, I've decorated the class with the required <code>DataContract</code> attribute and its properties with the <code>DataMember</code> attribute while also modifying the property names and/or case that I'd like each property to be serialized as. This feature (the ability to change the name and /or case of property name) is the reason why I prefer using the <code>DataContractSerializer</code> class over the <code>JavaScriptSerializer</code> class.



<a id="codelisting1"></a>

 
### The SubCategoryDrw class



```csharp
  [DataContract]
  public sealed class SubCategoryDrw : BaseDbDataReaderWrapper
  {
    #region Properties

    private Int32 categoryId;
    [DataMember(Name="categoryId")]
    public Int32 CategoryId { get { switch (Mode) { case WrapperMode.Wrapper: return (Int32)DbDataReader[0]; case WrapperMode.Dto: return categoryId; default: return default(Int32); } } set { categoryId = value; } }
    private Int32 subCategoryId;
    [DataMember(Name = "subCategoryId")]
    public Int32 SubCategoryId { get { switch (Mode) { case WrapperMode.Wrapper: return (Int32)DbDataReader[1]; case WrapperMode.Dto: return subCategoryId; default: return default(Int32); } } set { subCategoryId = value; } }
    private String categoryDescription;
    [DataMember(Name = "categoryDesc")]
    public String CategoryDescription { get { switch (Mode) { case WrapperMode.Wrapper: return (String)DbDataReader[2]; case WrapperMode.Dto: return categoryDescription; default: return default(String); } } set { categoryDescription = value; } }
    private String subCategoryDescription;
    [DataMember(Name = "subCategoryDesc")]
    public String SubCategoryDescription { get { switch (Mode) { case WrapperMode.Wrapper: return (String)DbDataReader[3]; case WrapperMode.Dto: return subCategoryDescription; default: return default(String); } } set { subCategoryDescription = value; } }

    #endregion Properties

    public SubCategoryDrw(DbDataReader dbDataReader, WrapperMode mode)
      : base(dbDataReader, mode)
    {
      switch (Mode)
      {
        case WrapperMode.Wrapper:
          break;
        case WrapperMode.Dto:
          categoryId = (Int32)DbDataReader[0];
          subCategoryId = (Int32)DbDataReader[1];
          categoryDescription = (String)DbDataReader[2];
          subCategoryDescription = (String)DbDataReader[3];
          break;
      }
    }
  }
```



### Code Listing 1: Showing the POCO SubCategory class that will be serlized

In [code listing 2](#codelisting2), you see a method I have in my business layer, that returns an <code>IEnumerable&lt;SubCategoryDrw&gt;</code>. Because the intent is to go from data stream, straight out to the Http Response Stream in order to get the best performance possible, not only do I use a <code>DbDataReader</code> directly (along with a [DataReader wrapper class](/writing/datareader-wrappers-typesafe/ "DataReader Wrappers - TypeSafe") so I get type safety) and return an <code>IEnumerable&lt;T&gt;</code>, which basically means the data that comes out of the database is streamed directly to the Http Response stream in one single iteration.



<a id="codelisting2"></a>


### Business Layer Method - GetSubCategories()



```csharp
    public IEnumerable<SubCategoryDrw> GetSubCategories()
    {
      using (var dr = DataModule.GetSubCategories())
      {
        var subCategoryDrw = new SubCategoryDrw(dr, WrapperMode.Wrapper);
        while (dr.Read())
          yield return subCategoryDrw;
      }
    }
```



### Code Listing 2: Showing the Business layer method returning an IEnumerable&lt;SubCategoryDrw>







In [code listing 3](#codelisting3) below you can see a WCF method wherein I use the JsonSerializer presented in this post to serialize a sequence of SubCategories. Note that I'm showing you a WCF method implementation, but you'll most likely use the JsonSerializer presented in this post in non-WCF applications since WCF 4.0 does handle serializing IEnumerable&lt;T>.



<a id="codelisting3"></a>


### WCF Operation Contract



```csharp
    [WebGet(UriTemplate = "/subcategories/")]
    public void GetSubCategories()
    {
      var categories = BusinessModule.GetSubCategories();
      JsonSerializer.Serialize(categories, Response.OutputStream, Request.QueryString["callback"]);
    }
```



### Code Listing 3: The WCF method that uses the JsonSerlizer to serialize an IEnumerable&lt;SubCategoryDrw>

### WCF 4.0 Supports Serializing IEnumerable&lt;T> via <code>CreateJsonResponse</code>



```csharp
    [WebGet(UriTemplate = "/subcategories/")]
    public Message GetSubCategories()
    {
      var categories = BusinessModule.GetSubCategories();
      return WebOperationContext.Current
        .CreateJsonResponse<IEnumerable<SubCategoryDrw>>(categories);
    }

```








## JsonSerializer

As I mentioned earlier, some of the features of this class are as follows:

1. Supports serializing IEnumberable&lt;T> in addition to other collections types as well as non-collection types
2. Serializes directly to System.IO.Stream (in contrast to JavaScriptSerializer)
3. Supports JSONP, so you can publish your JSON feeds to the public

There are just 2 public methods in this class. One that expects and IEnumerable&lt;T> as the object to serialize and another where the object is not an IEnumerable&lt;T> either a List&lt;T> or a non collection type object.



<a id="codelisting4"></a>


### JsonSerializer class



```csharp
public static class JsonSerializer
{
  private static byte[] lBracketBytes = Encoding.UTF8.GetBytes(new char[] { '[' });
  private static byte[] rBracketBytes = Encoding.UTF8.GetBytes(new char[] { ']' });
  private static byte[] commaBytes = Encoding.UTF8.GetBytes(new char[] { ',' });
  private static byte[] rparenBytes = Encoding.UTF8.GetBytes(new char[] { ')' });

  public static void Serialize<T>(T obj, Stream stream, string jsonpCallback = null)
  {
    if (jsonpCallback == null)
      WriteObject(obj, stream);
    else
    {
      WriteJsonPCallbackStart(stream, jsonpCallback);
      WriteObject(obj, stream);
      WriteJsonPCallbackEnd(stream);
    }
  }

  public static void Serialize<T>(IEnumerable<T> sequence, Stream stream, string jsonpCallback = null)
  {
    if (jsonpCallback == null)
      WriteSequence(sequence, stream);
    else
    {
      WriteJsonPCallbackStart(stream, jsonpCallback);
      WriteSequence(sequence, stream);
      WriteJsonPCallbackEnd(stream);
    }
  }

  private static void WriteJsonPCallbackStart(Stream stream, string jsonpCallback)
  {
    byte[] callbackStartBytes = UTF8Encoding.UTF8.GetBytes(jsonpCallback + "(");
    stream.Write(callbackStartBytes, 0, callbackStartBytes.Length);
  }

  private static void WriteJsonPCallbackEnd(Stream stream)
  {
    stream.Write(rparenBytes, 0, rparenBytes.Length);
  }

  private static void WriteObject<T>(T obj, Stream stream)
  {
    var serializer = new DataContractJsonSerializer(typeof(T));
    serializer.WriteObject(stream, obj);
  }

  private static void WriteSequence<T>(IEnumerable<T> sequence, Stream stream)
  {
    var serializer = new DataContractJsonSerializer(typeof(T));
    stream.Write(lBracketBytes, 0, lBracketBytes.Length);
    int i = 0;
    foreach (var item in sequence)
    {
      if (i != 0)
        stream.Write(commaBytes, 0, commaBytes.Length);
      serializer.WriteObject(stream, item);
      i++;
    }
    stream.Write(rBracketBytes, 0, rBracketBytes.Length);
  }
}
```



### Code Listing 4: Listing of the entire JsonSerializer class

That brings us to the end of this post.
