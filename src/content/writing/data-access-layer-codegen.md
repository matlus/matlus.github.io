---
title: Data Access Layer CodeGen
description: Stored-procedure metadata drives ADO.NET code generation and typed DbDataReader
  wrappers, supporting streamed results or materialized lists according to how callers
  use the data.
datePublished: '2010-12-19'
dateModified: '2026-10-03'
tags:
- code-generation
- ado-net
- data-access
- datareaders
- stored-procedures
- csharp
hero: data-access-layer-codegen
draft: false
---

In an earlier article ([DataReader Wrappers – Type Safe](/writing/datareader-wrappers-typesafe/)) I talked about using a DbDataReader wrapper class that allowed you to use a DbDataReader in a strongly typed way giving you the following additional benefit:

The ability to use a DbDataReader as an IEnumerable&lt;T>, giving is a performance advantage over other options because there is only ever one instance of the wrapper class created no matter how many records you've got.

In this post I'll be presenting a tool that generates the Data Access Layer code using ADO.NET Core as the method of Data Access. ADO.NET core is the fastest way to access any database, bar none. According to Microsoft ADO.NET Core is about 3 times faster than any other Data Access method including Entity Framework and Linq to SQL.

### Source Code and Project download

You can download the source code and sample project from here [SpCodeGenerator](https://web.archive.org/web/20240414172206/http://www.matlus.com/content/uploads/SpCodeGenerator/SpCodeGenerator.zip). Keep in mind that the GUI in the sample project is just a simple GUI. The source code of the Meta Data Extraction and code generation is pretty solid. I've used this tool to generate code for large production system as well as this blog. 

In addition, this tool also produces the DbDataReader wrapper classes and code you'll require.

## Features of the Generated Code

For every "Get\_XXX" stored procedure in your database the tool generates the appropriate data access code, including the DbDataReader wrapper class that matches the schema of the result set.

If your stored procedure returns multiple result sets then the code generator will generate the appropriate DbDataReader wrapper classes for each of the results sets.

For the Insert, Update, Delete stored procedures, the code generates the code for the command parameter assignment part of the code. You'll need to write the code that makes that actual call to the stored procedure. Mind you, the bulk of the code is generated for you (creating instances of the command parameters that match your stored procedure's parameters and types and assigning them to a command). You could easily modify the code generation to create that code for you as well.

The generated code also includes a method that creates a DataTable or DataSet (as the case may be) for each of the "Get\_XXX" stored procedures.

If you prefer to use POCO classes instead of a DataTable or DbDataReader, you can easily add a code generator that does that for you. The tool is extensible and it's really a matter of subscribing to an event that provides all the meta data information about your stored procedure making it really easy to generate the code required for a POCO class definition.

The code that available for download also includes a class that generates DataTable wrappers. This allows you to use a DataTable in a strongly typed fashion. It is not "active" (that is by default this class is not in use) but it's a simple matter of hooking it in.

I've used the tool to generate all of the Data Access layer code including the DbDataReader wrapper classes and a few other classes (explained later) for over 980 stored procedures I have in one of the projects I've worked on. It takes about 30 seconds to generate close to 100,000 lines of code.

[Code listing 1](#codelisting1) below, show the code it generated for one of my stored procedures called usp\_GET\_MEMBER\_BLOGS. The namespace and class name of the partial class for the Data Access layer it generates are configurable. Your main Data Access layer class will be a partial class that has the same name and is in the same namespace.

The two <code>internal</code> methods:

<code>GetMemberBlogs</code> (this returns a DbDataReader)

<code>GetMemberBlogsDataSet</code> (this returns a DataSet in this particular case since my stored procedure returns multiple result sets)

are the ones you'll call from your Business Layer. Notice that the method names are derived from the name of the stored procedure and are in Pascal case as is the convention in C# for method names.



<a id="codelisting1"></a>

 
### Data Access layer code gen



```csharp
//################################################################################
//                 This code file is an Auto Generated file
//      Do NOT Modify this file. All changes to this file WILL BE LOST
//################################################################################

using System;
using System.Data;
using System.Data.Common;

namespace MyApp.DataAccessLayer
{
    internal partial class DataAccessModule
    {
        #region usp_GET_MEMBER_BLOGS

        internal DbDataReader GetMemberBlogs(long memberId)
        {
            using (var command = CreateCommandForGetBlogItem(memberId))
            {
                DbConnection.Open();
                return command.ExecuteReader(CommandBehavior.CloseConnection);
            }
        }

        internal DataSet GetMemberBlogsDataSet(long memberId)
        {
            var adapter = DbProviderFactory.CreateDataAdapter();
            adapter.SelectCommand = CreateCommandForGetBlogItem(memberId);
            var ds = new DataSet();
            adapter.Fill(ds);
            return ds;
        }

        private DbCommand CreateCommandForGetBlogItem(long memberId)
        {
            var command = DbConnection.CreateCommand();
            command.CommandType = CommandType.StoredProcedure;
            command.CommandText = "usp_GET_BLOG_ITEM";
            var parameter = DbProviderFactory.CreateParameter();
            parameter.DbType = DbType.Int32;
            parameter.Direction = ParameterDirection.ReturnValue;
            parameter.ParameterName = "@RETURN";
            command.Parameters.Add(parameter);
            parameter = DbProviderFactory.CreateParameter();
            parameter.DbType = DbType.Int64;
            parameter.Direction = ParameterDirection.Input;
            parameter.ParameterName = "@MEMBER_ID";
            parameter.Value = memberId;
            command.Parameters.Add(parameter);
            return command;
        }

        #endregion usp_GET_MEMBER_BLOGS

    }
}
```



### Code Listing 1 – Showing the basic code generated for the Data Access Layer

[Code listing 2](#codelisting2) below shows the DbDataReader wrapper code that is generated. The code listing also includes a base class that was generated. The wrapper class that has been generated is called <code>MemberBlog0</code> in this case. The stored procedure I've used here returns 8 result sets and so the real code that was generated included 8 class definitions numbered from 0-7. In cases where the stored procedure returns only one result set, the name of the generated class would be <code>MemberBlogs.</code>



<a id="codelisting2"></a>


### DbDataReader Wrapper code gen



```csharp
//################################################################################
//                 This code file is an Auto Generated file
//      Do NOT Modify this file. All changes to this file WILL BE LOST
//################################################################################

using System;
using System.Data;
using System.Data.Common;

namespace MyApp.BusinessLayer
{
    /// <summary>
    /// The WrapperMode enum determines the behavior of
    /// the Wrapper class. That is the class is either
    /// a "wrapper" around the DbDataReader or
    /// it initializes its properties using the DbDataReader
    /// as a "data source"
    /// </summary>
    public enum WrapperMode { Wrapper, Dto }

    /// <summary>
    ///This is the Base Class for all DbDataReader Wrappers
    /// </summary>
    public class BaseDbDataReaderWrapper
    {
        protected DbDataReader DbDataReader { get; private set; }
        protected WrapperMode Mode { get; private set; }

        public BaseDbDataReaderWrapper(DbDataReader dbDataReader, WrapperMode mode)
        {
            DbDataReader = dbDataReader;
            Mode = mode;
        }
    }

    #region [usp_GET_MEMBER_BLOGS]

    /// <summary>
    ///This class is a wrapper around a DbDataReader,
    ///Associated with the stored procedure - usp_GET_MEMBER_BLOGS
    ///This class provides a strongly typed interface to access data from the DbDataReader.
    ///containing the result of the given stored procedure.
    /// </summary>
    public sealed class MemberBlog0 : BaseDbDataReaderWrapper
    {
        #region Properties

        private Int64 categoryId;
        public Int64 CategoryId { get { switch(Mode){ case WrapperMode.Wrapper: return (Int64)DbDataReader[0]; case WrapperMode.Dto: return categoryId; default: return default(Int64); } } set { categoryId = value; } }
        private String categoryName;
        public String CategoryName { get { switch(Mode){ case WrapperMode.Wrapper: return (String)DbDataReader[1]; case WrapperMode.Dto: return categoryName; default: return default(String); } } set { categoryName = value; } }
        private Int64 itemId;
        public Int64 ItemId { get { switch(Mode){ case WrapperMode.Wrapper: return (DbDataReader[2] != DBNull.Value) ? (Int64)DbDataReader[2] : default(Int64); case WrapperMode.Dto: return itemId; default: return default(Int64); } } set { itemId = value; } }
        private Int64 memberId;
        public Int64 MemberId { get { switch(Mode){ case WrapperMode.Wrapper: return (DbDataReader[3] != DBNull.Value) ? (Int64)DbDataReader[3] : default(Int64); case WrapperMode.Dto: return memberId; default: return default(Int64); } } set { memberId = value; } }

        #endregion Properties

        public BMemberlog0(DbDataReader dbDataReader, WrapperMode mode)
            :base(dbDataReader, mode)
        {
            switch(Mode)
            {
                case WrapperMode.Wrapper:
                    break;
                case WrapperMode.Dto:
                    categoryId = (Int64)DbDataReader[0];
                    categoryName = (String)DbDataReader[1];
                    itemId = DbDataReader[2] != DBNull.Value ? (Int64)DbDataReader[2] : default(Int64);
                    memberId = DbDataReader[3] != DBNull.Value ? (Int64)DbDataReader[3] : default(Int64);
                    break;
            }
        }
    }
```





```csharp
    #endregion [usp_GET_MEMBER_BLOGS]
}
```



### Code Listing 2 – The DbDataReader Wrapper generated code

## Using the Generated DbDataReader wrapper class

[Code listing 3](#codelisting3) shows 2 methods from the Business Layer that call into the Data Access layer. One of the methods returns <code>IEnumerable&lt;MemberBlogs&gt;</code> and the other return a <code>IList&lt;MemberBlogs&gt;</code>.

These methods are not code generated, however it would be simple enough to generate them as well if need be. The key thing to remember is that the classes that are part of the tool provide all the metadata you'll need to generate any code that works off of this information.

There are times when you'd use the first method and there are times when you'd use the second method. If you're simply iterating over the result (as fast as possible) to generate html in your ASP.NET MVC or ASP.NET WebForms application or streaming the result as a JSON stream or as a collection in a WCF application or WebService, then you should use the method that returns an <code>IEnumerable&lt;T&gt;</code>.

On the other hand, if you intend to hang on to the result (in your UI layer – ASP.NET WebForms/MVC application for example) or you intend to manipulate the result in some way (using Linq for example) then you should use the method that returns an <code>IList&lt;T&gt;</code>.

The reason is that when you're using a DbDataReader you want to consume the result as fast as possible, since the connection to your database is "open" till you do. In the same token, for the cases cited above you \*want\* to use a DbDataReader because there is no need to create a collection of some POCO objects only to stream them (serialize them) across the internet as a WebService message or JSON message for example). Going from a DbDataReader straight out as a JSON/WebService message is much faster and taxes your server far less (by way of less CPU utilization as well as less memory pressure) allowing you to process many more Request/Response cycles per second.

<a id="codelisting3"></a>

### Using the DbDataReader Wrapper class



```csharp
internal IEnumerable<BlogItem> GetMemberBlogs(long memberId, long itemId)
{
  using (var dr = DataAccessModule.GetMemberBlogs(memberId, itemId))
  {
    var blogItem = new BlogItem(dr, WrapperMode.Wrapper);
    while (dr.Read())
      yield return blogItem;
  }
}

internal IList<BlogItem> GetMemberBlogsList(long memberId, long itemId)
{
  using (var dr = DataAccessModule.GetMemberBlogs(memberId, itemId))
  {
    var list = new List<BlogItem>();
    while (dr.Read())
      list.Add(new BlogItem(dr, WrapperMode.Dto));
    return list;
  }
}
```



### Code Listing 3 – Showing how you'd use the Wrapper classes from your Business Layer

## The Case for using DbDataReaders

There are few reasons for using a DbDataReader in general. I know ma lot of people in the .NET community shun the use of a DbDataReader or DataTable/DataSet. They think that using these classes ties them to a database. Well, that's not true and all. You can create a DataTable or DataSet simply by new-ing up an instance of a DataTable or DataSet and pumping data into it manually or reading in data from an Xml file. That is they don't have to be connected to a database at all.

Similarly, from an instance of a DataTable you can get an instance of a DbDataReader (which is an in memory DbDataReader effectively). No matter how you dice it, these classes do not tie you to a database and nor do they imply you're using a database of any kind.

There are some issues with using DbDataReader or DataTable/DataSet from within a Business layer, and I talked it earlier ([DataReader Wrappers – Type Safe](/writing/datareader-wrappers-typesafe/)) and the wrapper classes are the solution to those issues.

In cases where you're extracting data from your database and simply iterating over this data and producing Html (via an ASP.NET MVC or WebForms app, or JSON or any other "serialized" format, using a DbDataReader makes total sense. There is absolutely no need to go from a DbDataReader to a collection of POCO objects to Html or other serialized formats.

Creating a collection of POCO objects means you've iterated over your result once. Then producing html or JSON or any other serialized format means you're iterating over your result again. Not only that, creating these objects only to throw them away is adding a lot of memory pressure on the GC and it takes a lot of time (CPU cycles) to create instances and assign their properties with values from a DbDataReader. Keep in mind that no matter what data access technology you use, including any ORMs as well as Linq to SQL, they all use DbDataReaders under the hood.

In some performance tests I've conducted, wherein I go from a DbDataReader, eventually out to a Web Page using Html, XML and JSON via one of the following:

1\. POCO objects

2\. DataTable/DataSet

3\. Directly to the output format

I found that going from DbDataReader to POCO objects and then serializing them was by far the slowest. Going from DbDataReader to DataTable to the output format was way faster than POCO but quite a bit slower than going directly from DbDataReader to the desired output format. The difference becomes even more noticeable as the number of records in your result set increases.

And as I mentioned in the beginning of this post, according to Microsoft, ADO.NET core is about 3 times faster than any other Data Access technology. So if speed and scalability are a concern then DbDataReaders are the way to go.

Nonetheless, the code generation tool presented here doesn't stop you from creating POCO classes and using those instead. You're still using ADO.NET core (which is 3 times faster) and you get to use POCO objects in your business layer code.
