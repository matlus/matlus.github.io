---
title: DataReader Wrappers - TypeSafe
description: Typed DbDataReader wrappers centralize field access and null handling.
  Examples compare reusing one wrapper through IEnumerable<T> with creating objects
  for a List<T>.
datePublished: '2010-11-18'
dateModified: '2010-11-18'
tags:
- datareaders
- ado-net
- data-access
- csharp
hero: datareader-wrappers-typesafe
draft: false
---

DataReaders (<code>DbDataReader</code>), in .NET give you the fastest access to your data. There is nothing that beats the speed of DataReaders. However, there are a few drawbacks to using them

1. No Type Checking
2. If field ordering or field name changes in your stored procedures or queries will likely break your code
3. Code that uses DataReaders tends to be not so clear to read

Here is a example of what the typical code looks like: Lets say we have a blog item record that has the following fields:

1. ItemId
2. MemberId
3. ItemTitle
4. ItemDesc
5. ItemPubdate
6. ItemCommentCnt
7. ItemAllowComment

In order to use a DataReader your code might look like the following: 
### DataReader - using field names



```csharp
using (DbDataReader dr = GetBlog(42))
{
  var blogs = new List<BlogItem>();
  while (dr.Read())
  {
    var blogItem = new BlogItem();

    blogItem.ItemId = (long)dr["ItemId"];
    blogItem.MemberId = (long)dr["MemberId"];
    blogItem.ItemTitle = (string)dr["Itemtitle"];
    blogItem.ItemDesc = dr["ItemDesc"] != DBNull.Value ? (string)dr["ItemDesc"] : null;
    blogItem.ItemPubdate = (DateTime)dr["ItemPubdate"];
    blogItem.ItemCommentCnt = (int)dr["ItemCommentCnt"];
    blogItem.ItemAllowComment = (bool)dr["ItemAllowComment"];

    blogs.Add(blogItem);

  }
  return blogs;
}
```




In the code above, I'm using field names to get at the fields, but it is faster if you index into the fields as shown below.
### DataReader using Field index



```csharp
using (DbDataReader dr = GetBlog(42))
{
  var blogs = new List<BlogItem>();
  while (dr.Read())
  {
    var blogItem = new BlogItem();

    blogItem.ItemId = (long)dr[0];
    blogItem.MemberId = (long)dr[1];
    blogItem.ItemTitle = (string)dr[2];
    blogItem.ItemDesc = dr[3] != DBNull.Value ? (string)dr[3] : null;
    blogItem.ItemPubdate = (DateTime)dr[4];
    blogItem.ItemCommentCnt = (int)dr[5];
    blogItem.ItemAllowComment = (bool)dr[6];

    blogs.Add(blogItem);

  }
  return blogs;
}
```




In both these code snippets there are a few problems.

1. No compile type type checking
2. Readability isn't too good
3. If a field is null-able (like ItemDesc above) then the code to access the field's value is even more cumbersome

Here is what I use in order to be able to use DataReaders but no have the issues cited above.
### DataReader Wrapper



```csharp
/// <summary>
///This is the Base Class for all DbDataReader Wrappers
/// </summary>
public class BaseDbDataReaderWrapper
{
    public DbDataReader DbDataReader { get; set; }

    public BaseDbDataReaderWrapper()
    {
    }

    public BaseDbDataReaderWrapper(DbDataReader dbDataReader)
      :this()
    {
        DbDataReader = dbDataReader;
    }
}

/// <summary>
///This class is a wrapper around a DbDataReader,
///Associated with the stored procedure - usp_GET_BLOG_ITEM
///This class provides a strongly typed interface to access data from the DbDataReader.
///containing the result of the given stored procedure.
/// </summary>
public sealed class BlogItemDrw : BaseDbDataReaderWrapper
{
    public Int64 ItemId { get { return (Int64)DbDataReader[0]; } }
    public Int64 MemberId { get { return (Int64)DbDataReader[1]; } }
    public String ItemTitle { get { return (String)DbDataReader[2]; } }
    public String ItemDesc { get { if (DbDataReader[3] != DBNull.Value) return (String)DbDataReader[3]; else return default(String); } }
    public DateTime ItemPubdate { get { return (DateTime)DbDataReader[4]; } }
    public Int32 ItemCommentCnt { get { return (Int32)DbDataReader[5]; } }
    public Boolean ItemAllowComment { get { return (Boolean)DbDataReader[6]; } }
    public BlogItemDrw()
      :base()
    {
    }

    public BlogItemDrw(DbDataReader dbDataReader)
      :base(dbDataReader)
    {
    }
}
```




The class above is designed in such as way as to require only one instance of the class while you're iterating over the DataReader. This technique also has a postivate impact on performance, since you're not creating a new instance of this class for each record in your DataReader.
## IEnumerable&lt;T> - DbDataReader

The way you'd use this class is really in a method that returns an <code>IEnumerable&lt;T&gt;</code>.
### IEnumerable DataReader Wrapper



```csharp
public IEnumerable<BlogItem> GetBlogs()
{
  using (DbDataReader dr = GetBlogsDataReader())
  {
    var blogItem = new BlogItem(dr);
    while (dr.Read())
    {
      yield return blogItem;
    }
  }
}
```




When you use a DataReader like this (<code>IEnumerable&lt;T&gt;</code>) you have to be careful in that you need to be aware that each time you iterate over the <code>IEnumerable</code>, you're really querying the database again. Further, the code that returns the DataReader (<code>GetBlogsDataReader()</code> in this case) should make sure the connection is closed when the DataReader is disposed by using the <code>CommandBehavior.CloseConnection</code> behavior at the time of calling the <code>ExecuteReader()</code> method on a command instance like so:



```text
return command.ExecuteReader(CommandBehavior.CloseConnection);
```



## List&lt;T> - DbDataReader

There may be times when you need to use a List&lt;T> instead of an IEnumerable&lt;T> because you either have multiple result sets being returned in the DataReader or you need to fire another query and you can't have a DbDataReader open and fire another query using the same connection. In such situations your class could look like this:
### List DataReader



```csharp
  public sealed class BlogItem
  {
    public Int64 ItemId { get; private set; }
    public Int64 MemberId { get; private set; }
    public String ItemTitle { get; private set; }
    public String ItemDesc { get; private set; }
    public DateTime ItemPubdate { get; private set; }
    public DateTime ItemPubtime { get; private set; }
    public Decimal ItemRatingAvg { get; private set; }
    public Int32 ItemViewCnt { get; private set; }
    public Int32 ItemCommentCnt { get; private set; }
    public Int32 ItemRatingCnt { get; private set; }
    public Int32 ItemFavoriteCnt { get; private set; }
    public Boolean ItemIsPrivate { get; private set; }
    public Boolean ItemAllowComment { get; private set; }
    public Boolean ItemIsPublished { get; private set; }

    public BlogItem(DbDataReader dbDataReader)
      : base()
    {
      ItemId = (Int64)dbDataReader[0];
      MemberId = (Int64)dbDataReader[1];
      ItemTitle = (String)dbDataReader[2];
      ItemDesc = dbDataReader[3] != DBNull.Value ? (String)dbDataReader[3] : default(String);
      ItemPubdate = (DateTime)dbDataReader[4];
      ItemRatingAvg = (Decimal)dbDataReader[5];
      ItemViewCnt = (Int32)dbDataReader[6];
      ItemCommentCnt = (Int32)dbDataReader[7];
      ItemRatingCnt = (Int32)dbDataReader[8];
      ItemFavoriteCnt = (Int32)dbDataReader[9];
      ItemIsPrivate = (Boolean)dbDataReader[10];
      ItemAllowComment = (Boolean)dbDataReader[11];
      ItemIsPublished = (Boolean)dbDataReader[12];
    }
  }
```




And the way you'd use this class to return a <code>List&lt;BlogItem&gt;</code> is
### Using List DataReader Wrapper class



```csharp
     internal  List <BlogItem > GetMemberBlogsList(long  memberId)
```





```csharp
     {
```





```csharp
       using  (var  dr = DataAccessModule.GetMemberBlogs(memberId))
```





```csharp
       {
```





```csharp
         var  blogItems = new  List <BlogItem >();
```





```csharp
         while  (dr.Read())
```





```csharp
           blogItems.Add(new  BlogItem (dr));
```





```csharp
         return  blogItems;
```





```csharp
       }
```





```csharp
     }
```





```csharp
 
```





```csharp
 
```



## Code Generation

Ideally, you'd want these wrapper classes to be automatically generated for you as per the stored procedure's metadata. That way, if you change the number of fields or field ordering in your stored procedures the class definition changes and of course if there is a breaking change, you'll know that as soon as you compile your project.
I'll be posting another blog about the code generation aspect and I'll make the source code and a sample project available for download as well.
