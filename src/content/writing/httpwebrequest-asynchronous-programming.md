---
title: HttpWebRequest - Asynchronous Programming Model/Task.Factory.FromAsyc
description: HttpWebRequest callbacks and Task.Factory.FromAsync support asynchronous
  GET and POST calls, with five approaches compared for collecting concurrent responses.
datePublished: '2011-02-23'
dateModified: '2026-10-03'
tags:
- http
- asynchronous-io
- asynchronous-programming-model
- task-composition
- benchmarking
- csharp
hero: httpwebrequest-asynchronous-programming
draft: false
---

The Asynchronous Programming Model (or APM) has been around since .NET 1.1 and is still (as of .NET 4.0) the best/recommended solution for asynchronous I/O. Many people go down the route of using a multi-threaded approach to try get speedup when the workload is I/O bound. Using multiple threads to do I/O bound tasks such as Disk I/O and Network I/O, won't (in most cases) give you any speed up and in fact could end up hurting performance.

If the workload is compute bound (rather than I/O bound) then it makes complete sense to use multiple threads (provided you have multiple cores and the work is fairly long running and so justifies the overhead of spawning and managing multiple threads), as discussed in this post [Data Parallel – Parallel Programming in C#/.NET](/writing/data-parallel-parallel-programming-in-net/ "Data Parallel – Parallel Programming in C#/.NET")

Using the APM is not the easiest thing to do primarily because it works with callbacks so you start in one method in your code and you get the result in another method. So ideally you should re-think you design so as to work in an asynchronous workflow pattern rather than a synchronous pattern.

In this post I’m going to show you a few ways in which you can use the HttpWebRequest class to make multiple http requests while getting really good performance/throughput. I strongly advice against using threads for I/O bound work when you're after performance and throughput. Of course in some cases, you could be using the synchronous option or the synchronous option with threads if I/O throughput is not a big concern. Or you could use a combination of threads and asynchronous work. It all depends.

When working with Http we invariably have different needs in different projects. Sometimes we:

1. Need to make multiple calls to some endpoint and wait till each one is done before we can process all of the responses.
2. Need to make multiple calls but have to wait for each one to complete because the response of one feeds into the request of the next.
3. Need to make multiple calls to some endpoint and can continue processing the responses as soon as we receive them (the ideal situation for an Asynchronous work flow).
4. All of the above could be using either the Http GET or POST methods. In the case of the Http POST method there is an additional asynchronous call to be made so it adds a bit more complexity.

In this post I’ll show you various options to accomplish these kinds of things using the APM as well as Tasks (System.Threading.Tasks.Task).

The HttpWebRequest makes it particularly difficult to use the APM because if you want to use it (correctly) for POST methods in an asynchronous manner it involves calling two methods asynchronously back to back and thus also involves 2 separate callback methods.

First let’s take a look at how we’d use the HttpWebRequest in an asynchronous manner, with the assumption that your program logic (or workflow) is designed to be asynchronous as well. I’m intentionally not using lambdas here for those of you who either don’t like to use lambdas or get confused by them.

In the code listing below, I present the HttpSocket class that essentially makes it really simple to make asynchronous Http calls. Note that the reason I've presented a class here is because there are some common methods that the primary methods (listed below) use and so I thought it best to present 4 of these methods in the form of a class.

The class is a static class and essentially a wrapper that provides some helper methods as well. This class has 4 public methods of interest to this discussion, namely:

1. PostAsync
2. GetAsync
3. PostAsyncTask
4. GetAsyncTask

The <code>PostAsync</code> and <code>GetAsync</code> methods use the Begin/End pairs of methods available in the <code>HttpWebRequest</code> class. While the <code>PostAsyncTask</code> and <code>GetAsyncTask</code> methods use <code>Tasks</code> (new in .NET 4.0) to get the job done. In particular, they use the <code>Task.Factory.FromAsync</code> method.

From a performance perspective, both styles perform the same, but the <code>PostAsync</code> and <code>GetAsync</code> methods use less resources and this could be beneficial in large production systems where you make tons of http calls out to some other http service.



<a id="codelisting1"></a>

 
### The HttpSocket class



```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net;
using System.Collections.Specialized;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using System.Runtime.Serialization.Json;

namespace ConsoleApplication3
{
  public static class HttpSocket
  {
    static HttpWebRequest CreateHttpWebRequest(string url, string httpMethod, string contentType)
    {
      var httpWebRequest = (HttpWebRequest)WebRequest.Create(url);
      httpWebRequest.ContentType = contentType;
      httpWebRequest.Method = httpMethod;
      return httpWebRequest;
    }

    static byte[] GetRequestBytes(NameValueCollection postParameters)
    {
      if (postParameters == null || postParameters.Count == 0)
        return new byte[0];
      var sb = new StringBuilder();
      foreach (var key in postParameters.AllKeys)
        sb.Append(key + "=" + postParameters[key] + "&");
      sb.Length = sb.Length - 1;
      return Encoding.UTF8.GetBytes(sb.ToString());
    }

    static void BeginGetRequestStreamCallback(IAsyncResult asyncResult)
    {
      Stream requestStream = null;
      HttpWebRequestAsyncState asyncState = null;
      try
      {
        asyncState = (HttpWebRequestAsyncState)asyncResult.AsyncState;
        requestStream = asyncState.HttpWebRequest.EndGetRequestStream(asyncResult);
        requestStream.Write(asyncState.RequestBytes, 0, asyncState.RequestBytes.Length);
        requestStream.Close();
        asyncState.HttpWebRequest.BeginGetResponse(BeginGetResponseCallback,
          new HttpWebRequestAsyncState
          {
            HttpWebRequest = asyncState.HttpWebRequest,
            ResponseCallback = asyncState.ResponseCallback,
            State = asyncState.State
          });
      }
      catch (Exception ex)
      {
        if (asyncState != null)
          asyncState.ResponseCallback(new HttpWebRequestCallbackState(ex));
        else
          throw;
      }
      finally
      {
        if (requestStream != null)
          requestStream.Close();
      }
    }

    static void BeginGetResponseCallback(IAsyncResult asyncResult)
    {
      WebResponse webResponse = null;
      Stream responseStream = null;
      HttpWebRequestAsyncState asyncState = null;
      try
      {
        asyncState = (HttpWebRequestAsyncState)asyncResult.AsyncState;
        webResponse = asyncState.HttpWebRequest.EndGetResponse(asyncResult);
        responseStream = webResponse.GetResponseStream();
        var webRequestCallbackState = new HttpWebRequestCallbackState(responseStream, asyncState.State);
        asyncState.ResponseCallback(webRequestCallbackState);
        responseStream.Close();
        responseStream = null;
        webResponse.Close();
        webResponse = null;
      }
      catch (Exception ex)
      {
        if (asyncState != null)
          asyncState.ResponseCallback(new HttpWebRequestCallbackState(ex));
        else
          throw;
      }
      finally
      {
        if (responseStream != null)
          responseStream.Close();
        if (webResponse != null)
          webResponse.Close();
      }
    }

    /// <summary>
    /// If the response from a remote server is in text form
    /// you can use this method to get the text from the ResponseStream
    /// This method Disposes the stream before it returns
    /// </summary>
    /// <param name="responseStream">The responseStream that was provided in the callback delegate's HttpWebRequestCallbackState parameter</param>
    /// <returns></returns>
    public static string GetResponseText(Stream responseStream)
    {
      using (var reader = new StreamReader(responseStream))
      {
        return reader.ReadToEnd();
      }
    }

    /// <summary>
    /// This method uses the DataContractJsonSerializer to
    /// Deserialize the contents of a stream to an instance
    /// of an object of type T.
    /// This method disposes the stream before returning
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <param name="stream">A Stream. Typically the ResponseStream</param>
    /// <returns>An instance of an object of type T</returns>
    static T DeSerializeToJson<T>(Stream stream)
    {
      using (stream)
      {
        var deserializer = new DataContractJsonSerializer(typeof(T));
        return (T)deserializer.ReadObject(stream);
      }
    }

    /// <summary>
    /// This method does an Http POST sending any post parameters to the url provided
    /// </summary>
    /// <param name="url">The url to make an Http POST to</param>
    /// <param name="postParameters">The form parameters if any that need to be POSTed</param>
    /// <param name="responseCallback">The callback delegate that should be called when the response returns from the remote server</param>
    /// <param name="state">Any state information you need to pass along to be available in the callback method when it is called</param>
    /// <param name="contentType">The Content-Type of the Http request</param>
    public static void PostAsync(string url, NameValueCollection postParameters,
      Action<HttpWebRequestCallbackState> responseCallback, object state = null,
      string contentType = "application/x-www-form-urlencoded")
    {
      var httpWebRequest = CreateHttpWebRequest(url, "POST", contentType);
      var requestBytes = GetRequestBytes(postParameters);
      httpWebRequest.ContentLength = requestBytes.Length;

      httpWebRequest.BeginGetRequestStream(BeginGetRequestStreamCallback,
        new HttpWebRequestAsyncState()
        {
          RequestBytes = requestBytes,
          HttpWebRequest = httpWebRequest,
          ResponseCallback = responseCallback,  
          State = state
        });
    }

    /// <summary>
    /// This method does an Http GET to the provided url and calls the responseCallback delegate
    /// providing it with the response returned from the remote server.
    /// </summary>
    /// <param name="url">The url to make an Http GET to</param>
    /// <param name="responseCallback">The callback delegate that should be called when the response returns from the remote server</param>
    /// <param name="state">Any state information you need to pass along to be available in the callback method when it is called</param>
    /// <param name="contentType">The Content-Type of the Http request</param>
    public static void GetAsync(string url, Action<HttpWebRequestCallbackState> responseCallback,
      object state = null, string contentType = "application/x-www-form-urlencoded")
    {
      var httpWebRequest = CreateHttpWebRequest(url, "GET", contentType);

      httpWebRequest.BeginGetResponse(BeginGetResponseCallback,
        new HttpWebRequestAsyncState()
        {
          HttpWebRequest = httpWebRequest,
          ResponseCallback = responseCallback,
          State = state
        });
    }

    public static void PostAsyncTask(string url, NameValueCollection postParameters,
      Action<HttpWebRequestCallbackState> responseCallback, object state = null,
      string contentType = "application/x-www-form-urlencoded")
    {
      var httpWebRequest = CreateHttpWebRequest(url, "POST", contentType);
      var requestBytes = GetRequestBytes(postParameters);
      httpWebRequest.ContentLength = requestBytes.Length;

      var asyncState = new HttpWebRequestAsyncState()
      {
        RequestBytes = requestBytes,
        HttpWebRequest = httpWebRequest,
        ResponseCallback = responseCallback,
        State = state
      };

      Task.Factory.FromAsync<Stream>(httpWebRequest.BeginGetRequestStream,
        httpWebRequest.EndGetRequestStream, asyncState, TaskCreationOptions.None)
        .ContinueWith<HttpWebRequestAsyncState>(task =>
        {
          var asyncState2 = (HttpWebRequestAsyncState)task.AsyncState;
          using (var requestStream = task.Result)
          {
            requestStream.Write(asyncState2.RequestBytes, 0, asyncState2.RequestBytes.Length);
          }          
          return asyncState2;
        })
        .ContinueWith(task =>
        {
          var httpWebRequestAsyncState2 = (HttpWebRequestAsyncState)task.Result;
          var hwr2 = httpWebRequestAsyncState2.HttpWebRequest;
          Task.Factory.FromAsync<WebResponse>(hwr2.BeginGetResponse,
            hwr2.EndGetResponse, httpWebRequestAsyncState2, TaskCreationOptions.None)
            .ContinueWith(task2 =>
            {
              WebResponse webResponse = null;
              Stream responseStream = null;
              try
              {
                var asyncState3 = (HttpWebRequestAsyncState)task2.AsyncState;
                webResponse = task2.Result;
                responseStream = webResponse.GetResponseStream();
                responseCallback(new HttpWebRequestCallbackState(responseStream, asyncState3));
              }
              finally
              {
                if (responseStream != null)
                  responseStream.Close();
                if (webResponse != null)
                  webResponse.Close();
              }
            });
        });
    }

    public static void GetAsyncTask(string url, Action<HttpWebRequestCallbackState> responseCallback,
      object state = null, string contentType = "application/x-www-form-urlencoded")
    {
      var httpWebRequest = CreateHttpWebRequest(url, "GET", contentType);
      Task.Factory.FromAsync<WebResponse>(httpWebRequest.BeginGetResponse,
        httpWebRequest.EndGetResponse, null).ContinueWith(task =>
          {
            var webResponse = task.Result;
            var responseStream = webResponse.GetResponseStream();
            responseCallback(new HttpWebRequestCallbackState(webResponse.GetResponseStream(), state));
            responseStream.Close();
            webResponse.Close();
          });
    }
  }

  /// <summary>
  /// This class is used to pass on "state" between each Begin/End call
  /// It also carries the user supplied "state" object all the way till
  /// the end where is then hands off the state object to the
  /// HttpWebRequestCallbackState object.
  /// </summary>
  class HttpWebRequestAsyncState
  {
    public byte[] RequestBytes { get; set; }
    public HttpWebRequest HttpWebRequest { get; set; }
    public Action<HttpWebRequestCallbackState> ResponseCallback { get; set; }
    public Object State { get; set; }
  }

  /// <summary>
  /// This class is passed on to the user supplied callback method
  /// as a parameter. If there was an exception during the process
  /// then the Exception property will not be null and will hold
  /// a reference to the Exception that was raised.
  /// The ResponseStream property will be not null in the case of
  /// a sucessful request/response cycle. Use this stream to
  /// exctract the response.
  /// </summary>
  public class HttpWebRequestCallbackState
  {
    public Stream ResponseStream { get; private set; }
    public Exception Exception { get; private set; }
    public Object State { get; set; }

    public HttpWebRequestCallbackState(Stream responseStream, object state)
    {
      ResponseStream = responseStream;
      State = state;
    }

    public HttpWebRequestCallbackState(Exception exception)
    {
      Exception = exception;
    }
  }
}
```



### Code List 1: Showing the Complete HttpSocket class

## Using HttpWebRequests in Asynchronous Workflows

Using any of the methods in the HttpSocket class for asynchronous workflows is really simple. You call one of the Postxxx or Getxxx methods passing it some parameters and the callback delegate as shown in the [Code Listing 2](#codelisting2) below.

In this case we're using the PostAsyn method. We send in the url and since it is a POST (rather than a GET) we send in the postParameters as well. Each of these methods also requires a callback delegate that is called back with the response of the http call. In the example below we've used a lambda as the callback. The response call back is an



```text
Action<HttpWebRequestCallbackState>
```



The <code>HttpWebRequestCallbackState</code> is a custom class that holds a bunch of state information including the Response Stream (that contains the response). You can find that class in [Code Listing 1](#codelisting1) above.

What's important to realize here is that the loop finishes almost instantly. We don't block the main thread and we're not spawning additional threads. The callback will be called for each response, as and when a response is received and we simply continue on with processing the response as we see fit. In the example, we're simply writing out the response to the console. Another thing to keep in mind is that the responses will not arrive in the order in which requests were made. This is quite normal and if our workflow is truly asynchronous then this shouldn't be a problem.

### A Note ServicePointManager

If you are making multiple http requests to the same domain, you'll find that only two concurrent requests are actually being made. This is because the DefaultConnectionLimit (per domain) is 2. If you're making multiple concurrent requests to different domains, then you don't need to modify this limit. If you do modify the limit (because you're making multiple calls to the same domain) then be sure to test various numbers to see what works best. Please also keep in mind that the server being called will be heavily loaded and if the work the server side needs to do is "long running", then you could potentially stress the server more than it can handle, or because you're stressing the server the performance of your application starts to degrade rather than improve. 



<a id="codelisting2"></a>



### Simple useage scenario with Asynchronous Workflow



```csharp
      ServicePointManager.DefaultConnectionLimit = 50;
      var url = "http://localhost/HttpTaskServer/default.aspx";

      var iterations = 1000;
      for (int i = 0; i < iterations; i++)
      {
        var postParameters = new NameValueCollection();
        postParameters.Add("data", i.ToString());
        HttpSocket.PostAsync(url, postParameters, callbackState =>
          {
            if (callbackState.Exception != null)
              throw callbackState.Exception;
            Console.WriteLine(HttpSocket.GetResponseText(callbackState.ResponseStream));
          });
      }
```



### Code Listing 2: Using the PostAsync method of the HttpSocket class

## Making Multiple Concurrent Requests and Waiting on All

Sometimes, we can't use an asynchronous workflow but we'd like to fire multiple requests as fast as possible and then wait till all jobs have complete before we continue on to process the responses. There are many ways in which to tackle this kind of problem. In this post we'll be looking at 5 different ways in which we can accomplish this kind of thing.

Each one has it's merits (ease of use versus complexity) and performance and resource utilization metrics.

### Using the techniques presented here for other kinds of work

The techniques shown here can be used for work other than Http requests such as:

- Sending bulk Emails
- Processing Files on a disk
- Sending/Receiving files over Ftp
- Pretty much and I/O bound work

If you do use these techniques for other work, be sure to do your own testing if performance/throughput is a primary concern. If performance is not a major criteria, then any one of these methods can be used.

1. Use Tasks to make synchronous Http requests and wait on all tasks to complete before proceeding. The method <code>CallHttpWebRequestTaskAndWaitOnAll</code> in [Code Listing 4](#codelisting4) below demonstrates this.
2. We could spawn <code><i>n</i></code> number of threads and in each thread make synchronous Http requests and as soon as a thread completes, spawn another thread and keep doing this till all work items have finished. In other word, we put a cap on the number of threads we spawn and therefore the number of threads executing at any given point in time but ensure that at all times there are n threads busy doing work rather than sitting idle. The method <code>CallHttpWebRequestSyncAndWaitOnAll</code> in [Code Listing 5](#codelisting5) below demonstrates this.
3. We could do the actual Http requests asynchronously and somehow collect the results of each response as they complete while blocking the main thread till all asynchronous jobs have completed. This technique is demonstrated in the method <code>CallHttpWebRequestAsyncAndWaitOnAll</code> in [Code Listing 6](#codelisting6) below.
4. A variation on the previous theme is that we could use a combination of a parallel programming technique called [Data Parallel](/writing/data-parallel-parallel-programming-in-net/), where the work items are partitioned in chunks and then each chunk is processed by a thread. Within each thread we make asynchronous Http requests collecting the responses as they come in and wait for all threads to complete before returning. The method <code>CallHttpWebRequestASyncDataParallelAndWaitOnAll</code> shown in [Code Listing 7](#codelisting7) below demonstrates this.
5. We could use another construct available to us as part of the .NET 4.0 framework, the <code>Parallel</code>, class. This class essentially uses the [Data Parallel](/writing/data-parallel-parallel-programming-in-net/) technique as well but the it has the advantage of being able to use new features of the .NET 4.0 thread pool. Using the <code>Parallel</code> class is really simple as you you'll see. Within the <code>Parallel.ForEach</code> loop, we'll make synchronous Http calls and store the responses for each request and wait till all work items have been processed. The Parallel class makes it simple to "wait on all" because it finishes when all work items have finished. The method <code>CallHttpWebRequestSyncParallelForEachAndWaitOnAll</code> in [Code Listing 8](#codelisting8) below shows such an implementation.

Some explanation as to how some of this works (in the way these methods are being used in these tests) is in order. In [Code Listing 3](#codelisting3) below you can see We initialize the <code>DefaultConnectionLimit</code> to 100. We then initialize an array of <code>Work</code> object instances (100 elements in the array) that we'll be passing to each of these methods as the "work load". The <code>Work</code> class is also shown in [Code Listing 3](#codelisting3) below.



<a id="codelisting3"></a>


### Initialization code



```csharp
    static void Main(string[] args)
    {
      ServicePointManager.DefaultConnectionLimit = 100;
      var url = "http://localhost/HttpTaskServer/default.aspx";
      var iterations = 10;

      var workItems = (from w in Enumerable.Range(0, 100)
                       let postParameters = new NameValueCollection { { "data", w.ToString() } }
                       select new Work() { Id = w, PostParameters = postParameters }).ToArray();

      Thread.Sleep(1000);
      Benchmarker.MeasureExecutionTime("ParallelForEach              ", iterations, CallHttpWebRequestASyncParallelForEachAndWaitOnAll, url, workItems);
      Benchmarker.MeasureExecutionTime("AsyncAndWaitOnAll            ", iterations, CallHttpWebRequestAsyncAndWaitOnAll, url, workItems);
      Benchmarker.MeasureExecutionTime("ASyncDataParallelAndWaitOnAll", iterations, CallHttpWebRequestASyncDataParallelAndWaitOnAll, url, workItems);
      Benchmarker.MeasureExecutionTime("TaskAndWaitOnAll             ", iterations, CallHttpWebRequestTaskAndWaitOnAll, url, workItems);
      Benchmarker.MeasureExecutionTime("SyncAndWaitOnAll             ", iterations, CallHttpWebRequestSyncAndWaitOnAll, url, workItems);
      Console.WriteLine("All work Done.");      
      Console.ReadLine();
    }

  class Work
  {
    public int Id { get; set; }
    public NameValueCollection PostParameters { get; set; }
    public string ResponseData { get; set; }
    public Exception Exception { get; set; }
  }
```



### Code Listing 3: Showing the initialization and calls to each of the methods

While initializing the work object instances we initialize the <code>Id</code> property of each instance to the "index" of the array element. So the first element's <code>Id</code> property is set to 1, the second's to 2 and so on. We also initialize the PostParameters property to an instance containing the name and value of "data" and "1" for the first element and "data" and "2" for the second element and so on. This is essentially the data that is POSTed to the remote server. In other words the Http content for each http request will be

data=x

Where "x" is different for each request and will be the same as the Id of the work item. Of course you'll change this to suit your particular needs.

Next, you should notice that the Work class has a <code>ResonseData</code> property. This is the property that holds the response of each http request we make. Again, in this case the response is a string but you can change this to be any other type to suite your response (like a JSON object for example).

The key point to notice here is that each work item contains the data required to make the request and then the response that comes back for each request. So after each of these methods returns, iterating over the array of work items and accessing the <code>ResponseData</code> property of each element will yield the response that each work item got back from the remote server.

The Benchmarker class simply calls a method n times and profiles it. In this case there are 100 items on our workItems array and we call each method 10 times. So effectively, each method makes a total 1,000 Http Requests but in batches of 10. We could increase the number of items in our workItems array to 1000 and do only one iteration as well.



<a id="codelisting4"></a>


### Using Tasks and Task.WaitAll



```csharp
    /// <summary>
    /// This method makes a bunch (workItems.Count()) of HttpRequests using Tasks
    /// The work each task performs is a synchronous Http request. Essentially each
    /// Task is performed on a different thread and when all threads have completed
    /// this method returns
    /// </summary>
    /// <param name="url"></param>
    /// <param name="workItems"></param>
    static void CallHttpWebRequestTaskAndWaitOnAll(string url, IEnumerable<Work> workItems)
    {      
      var tasks = new List<Task>();
      foreach (var workItem in workItems)
      {
        tasks.Add(Task.Factory.StartNew(wk =>
        {
          var wrkItem = (Work)wk;
          wrkItem.ResponseData = GetWebResponse(url, wrkItem.PostParameters);
        }, workItem));
      }
      Task.WaitAll(tasks.ToArray());
    }
```



### Code Listing 4: Showing the CallHttpWebRequestTaskAndWaitOnAll method



<a id="codelisting5"></a>


### Using the ThreadPool and putting a cap on the number of threads



```csharp
    /// <summary>
    /// This method makes a bunch (workItems.Count()) of HttpRequests synchronously
    /// using a pool of threads with a certain cap on the number of threads.
    /// As soon as a thread finishes a now job is started till no more work items are left.
    /// After all http requests are complete, this method returns
    /// </summary>
    /// <param name="url"></param>
    /// <param name="workItems"></param>
    static void CallHttpWebRequestSyncAndWaitOnAll(string url, IEnumerable<Work> workItems)
    {
      //Since the threads will be blocked for the most part (not using the CPU)
      //We're using 4 times as many threads as there are cores on the machine.
      //Play with this number to ensure you get the performance you keeping an
      //eye on resource utlization as well.
      int maxThreadCount = Environment.ProcessorCount * 4;
      int executingThreads = 0;
      //This variable is used to throttle the number of threads
      //created to the maxThreadCount
      object lockObj = new object();

      foreach (var workItem in workItems)
      {
        ThreadPool.QueueUserWorkItem((state) =>
          {
            var work = (Work)state;
            try
            {
              work.ResponseData = GetWebResponse(url, work.PostParameters);
              Interlocked.Decrement(ref executingThreads);
            }
            catch (Exception ex)
            {
              work.Exception = ex;
              Interlocked.Decrement(ref executingThreads);
            }

          }, workItem);

        //If maxThreadCount threads have been spawned
        //then wait for any of them to finish before
        //spawning additional threads. Therby limiting
        //the number of executing (and spawned)
        //threads to maxThreadCount
        lock (lockObj)
        {
          executingThreads++;
          while (executingThreads == maxThreadCount)
            Thread.Sleep(1);
        }
      }

      //Wait on all executing threads to complete
      while (executingThreads != 0)
        Thread.Sleep(1);
    }
```



### Code Listing 5: Showing the CallHttpWebRequestSyncAndWaitOnAll method



<a id="codelisting6"></a>


### Using Asynchronous Http Requests and waiting on all



```csharp
    /// <summary>
    /// This method makes a bunch (workItems.Count()) of HttpRequests asynchronously
    /// The main thread is blocked until all asynchronous jobs are complete.
    /// After all http requests are complete, this method returns
    /// </summary>
    /// <param name="url"></param>
    /// <param name="workItems"></param>
    private static void CallHttpWebRequestAsyncAndWaitOnAll(string url, IEnumerable<Work> workItems)
    {
      var pending = workItems.Count();
      using (var mre = new ManualResetEvent(false))
      {
        foreach (var workItem in workItems)
        {
          HttpSocket.PostAsync(url, workItem.PostParameters, callbackState =>
          {
            var hwrcbs = (HttpWebRequestCallbackState)callbackState;
            using (var responseStream = hwrcbs.ResponseStream)
            {
              var reader = new StreamReader(responseStream);
              ((Work)hwrcbs.State).ResponseData = reader.ReadToEnd();
              if (Interlocked.Decrement(ref pending) == 0)
                mre.Set();
            }
          }, workItem);
        }
        mre.WaitOne();
      }
    }
```



### Code Listing 6: Showing the CallHttpWebRequestAsyncAndWaitOnAll method



<a id="codelisting7"></a>


### Using a combination of Data Parallel and Asynchronous Http Requests



```csharp
    /// <summary>
    /// This method makes a bunch (workItems.Count()) of HttpRequests asynchronously
    /// but partitions the workItem into chunks. The number of chunks is determined
    /// by the number of cores in the machine. The main thread is blocked
    /// until all asynchronous jobs are complete
    /// After all http requests are complete, this method returns
    /// </summary>
    /// <param name="url"></param>
    /// <param name="workItems"></param>
    private static void CallHttpWebRequestASyncDataParallelAndWaitOnAll(string url, IEnumerable<Work> workItems)
    {
      var coreCount = Environment.ProcessorCount;
      var itemCount = workItems.Count();
      var batchSize = itemCount / coreCount;

      var pending = itemCount;
      using (var mre = new ManualResetEvent(false))
      {
        for (int batchCount = 0; batchCount < coreCount; batchCount++)
        {
          var lower = batchCount * batchSize;
          var upper = (batchCount == coreCount - 1) ? itemCount : lower + batchSize;
          var workItemsChunk = workItems.Skip(lower).Take(upper).ToArray();

          foreach (var workItem in workItemsChunk)
          {
            HttpSocket.PostAsync(url, workItem.PostParameters, callbackState =>
              {
                var hwrcbs = (HttpWebRequestCallbackState)callbackState;
                using (var responseStream = hwrcbs.ResponseStream)
                {
                  var reader = new StreamReader(responseStream);
                  ((Work)hwrcbs.State).ResponseData = reader.ReadToEnd();
                  if (Interlocked.Decrement(ref pending) == 0)
                    mre.Set();
                }
              }, workItem);
          }
        }
        mre.WaitOne();
      }
    }
```



### Code Listing 7: Showing the CallHttpWebRequestASyncDataParallelAndWaitOnAll method



<a id="codelisting8"></a>


### Using the Parallel.ForEach method to make synchronous Http calls in parallel



```csharp
    /// <summary>
    /// This method makes a bunch (workItems.Count()) of HttpRequests synchronously
    /// using Parallel.ForEach. Behind the scenes Parallel.ForEach partitions the
    /// workItem into chunks (Data Parallel). The main thread is blocked
    /// until all workItems have been processed.
    /// After all http requests are complete, this method returns
    /// </summary>
    /// <param name="url"></param>
    /// <param name="workItems"></param>
    private static void CallHttpWebRequestSyncParallelForEachAndWaitOnAll(string url, IEnumerable<Work> workItems)
    {
      Parallel.ForEach(workItems, work =>
      {
        try
        {
          work.ResponseData = GetWebResponse(url, work.PostParameters);
        }
        catch (Exception ex)
        {
          work.Exception = ex;
        }
      });
    }
```



### Code Listing 8: Showing the CallHttpWebRequestSyncParallelForEachAndWaitOnAll method

The table below shows the timing results of each of the methods listed above. The results are shown in the order for fastest first. As you can see the method that does Not use threads is the fastest. The next is the method that uses as many threads as there are CPU cores on the machine (The machine used to perform these tests has 4 cores) but all work is done asynchronously (on 4 threads).

The hand crafted method SyncAndWaitOnAll comes in, in 3rd place and very close in 4th place is the Parralel.ForEach and last is the method that uses Tasks.

I should note that I performed **each test by itself multiple times**, and during these test the SyncAndWaitOnAll and the Parallel.ForEach methods were extremely close, frequently swapping places and you can see from their timings that they were in fact very close. The TaskAndWaitOnAll method wasn't too far behind most times either.

The reason the results turned out the way they did is because the workload is an I/O bound workload and I/O bound workloads don't benefit by spawning threads. In fact spawning threads for I/O bound work only hurts performance due to the thread management and context switching overheads. Keep in mind also that the results here are for making 1000 http requests and even then the results are not that different.

In the real world it may not be possible to use an asynchronous workflow, especially if you are trying to back-fit it into already existing synchronous workflows. So any of the methods resented here will work just as well.

**All times are in milliseconds**



<table>
<tbody>
<tr>
<td>Method</td>
<td>Total</td>
<td>Average</td>
<td>Min</td>
<td>Max</td></tr>
<tr>
<td>AsyncAndWaitOnAll</td>
<td>20114.2131</td>
<td>2011.4213</td>
<td>2004.7027</td>
<td>2055.6508</td></tr>
<tr>
<td>ASyncDataParallelAndWaitOnAll</td>
<td>21306.043</td>
<td>21306.043</td>
<td>2005.8313</td>
<td>2412.8763</td></tr>
<tr>
<td>SyncAndWaitOnAll</td>
<td>23136.3949</td>
<td>2313.6394</td>
<td>2011.8277</td>
<td>2603.461</td></tr>
<tr>
<td>ParallelForEach</td>
<td>23438.7341</td>
<td>2343.8734</td>
<td>2010.1335</td>
<td>3154.8706</td></tr>
<tr>
<td>TaskAndWaitOnAll</td>
<td>27978.052</td>
<td>2797.8052</td>
<td>2211.2131</td>
<td>4459.7625</td></tr></tbody></table>



The method shown in [Code Listing 9](#codelisting9) below is the method some of the methods listed above call. It makes synchronous Http requests and returns after receiving the response.



<a id="codelisting9"></a>


### The GetWebResponse (Synchronous) method that some of the other methods use.



```csharp
    static string GetWebResponse(string url, NameValueCollection parameters)
    {
      var httpWebRequest = (HttpWebRequest)WebRequest.Create(url);
      httpWebRequest.ContentType = "application/x-www-form-urlencoded";
      httpWebRequest.Method = "POST";

      var sb = new StringBuilder();
      foreach (var key in parameters.AllKeys)
        sb.Append(key + "=" + parameters[key] + "&");
      sb.Length = sb.Length - 1;

      byte[] requestBytes = Encoding.UTF8.GetBytes(sb.ToString());
      httpWebRequest.ContentLength = requestBytes.Length;

      using (var requestStream = httpWebRequest.GetRequestStream())
      {
        requestStream.Write(requestBytes, 0, requestBytes.Length);
      }

      Task<WebResponse> responseTask = Task.Factory.FromAsync<WebResponse>(httpWebRequest.BeginGetResponse, httpWebRequest.EndGetResponse, null);
      using (var responseStream = responseTask.Result.GetResponseStream())
      {
        var reader = new StreamReader(responseStream);
        return reader.ReadToEnd();
      }
    }
```



### Code Listing 9: Showing the GetWebResponse method that is called from some of the other methods

Here is the Benchmark class that was used for the performance tests.
### The Benchmark class used for these Performance Tests



```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;

namespace Diagnostics.Performance
{
  public static class Benchmarker
  {
    private static void WarmUp(Action action)
    {
      action();
      GC.Collect();
    }

    private static void DisplayResults(string benchmarkName, TimeSpan totalTime, TimeSpan averageTime, TimeSpan minTime, TimeSpan maxTime)
    {
      Console.WriteLine("---------------------------------");
      Console.WriteLine(benchmarkName);
      Console.WriteLine("\tTotal time  : " + totalTime.TotalMilliseconds + "ms");
      Console.WriteLine("\tAverage time: " + averageTime.TotalMilliseconds + "ms");
      Console.WriteLine("\tMin time    : " + minTime.TotalMilliseconds + "ms");
      Console.WriteLine("\tMax time    : " + maxTime.TotalMilliseconds + "ms");
      Console.WriteLine("---------------------------------");
      Console.WriteLine();
    }

    public static void MeasureExecutionTime(string benchmarkName, int noOfIterations, Action action)
    {
      var totalTime = new TimeSpan(0);
      var averageTime = new TimeSpan(0);
      var minTime = TimeSpan.MaxValue;
      var maxTime = TimeSpan.MinValue;

      WarmUp(action);
      GC.Collect();
      GC.WaitForPendingFinalizers();
      GC.Collect();

      var total = new TimeSpan(0);
      var sw = Stopwatch.StartNew(); 
      for (int i = 0; i < noOfIterations; i++)
      {
        sw.Restart();
        action();
        sw.Stop();

        GC.Collect();
        GC.WaitForPendingFinalizers();
        GC.Collect();

        var thisIteration = sw.Elapsed;
        total += thisIteration;

        if (thisIteration > maxTime)
          maxTime = thisIteration;
        if (thisIteration < minTime)
          minTime = thisIteration;
      }

      totalTime = total;
      averageTime = new TimeSpan(total.Ticks / noOfIterations);

      DisplayResults(benchmarkName, totalTime, averageTime, minTime, maxTime);
    }
  }
}
```



### The Benchmarker Class

I hope you've found this post and the information and data I've presented here useful.
