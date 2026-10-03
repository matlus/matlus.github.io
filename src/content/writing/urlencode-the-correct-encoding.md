---
title: UrlEncode –The correct encoding
description: A C# UrlEncode implementation preserves unreserved characters and percent-encodes
  others, with character-by-character comparisons against HttpUtility.UrlEncode.
datePublished: '2011-02-03'
dateModified: '2026-10-03'
tags:
- url-encoding
- http
- csharp
hero: urlencode-the-correct-encoding
draft: false
---

While developing the [OAuth C# Lubrary](/writing/oauth-c-library/) I discovered that the <code>HttpUtility</code> class that's available in the <code>System.Web</code> assembly in .NET (in particular the <code>HttpUtility.UrlEncode()</code> method) doesn't quite do it correctly. So I had to develop my own method that did the encoding correctly. I used [this wiki page](https://web.archive.org/web/20230331000205/http://en.wikipedia.org/wiki/Percent-encoding) as a reference.

Notice the <code>UrlEncode()</code> method in the code listing below, that's the method I present in this post. The outputs of the <code>HttpUtility.UrlEncode()</code> method any my <code>UrlEncode()</code> method are listed below such that you can compare the two outputs.

### UrlEncoding a string in C# the correct way



```csharp
  class Program
  {
    private readonly static string unreservedCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~";

    static void Main(string[] args)
    {
      var url = "!*'();:@&=+$,/?#[] <>~.\"{}|\\-`_^%";

      Console.WriteLine("Using HttpUtility: " + HttpUtility.UrlEncode(url));
      Console.WriteLine("Using UrlEncode:   " + UrlEncode(url));
      Console.WriteLine(HttpUtility.UrlDecode(UrlEncode(url)));

      Console.ReadLine();
    }

    /// <summary>
    /// This method is the correct implementation of UrlEncode.
    /// Given a string, it returns a UrlEncoded version on the string.
    /// </summary>
    /// <param name="value">the string/url to be UrlEncoded</param>
    /// <returns>The UrlEncoded string</returns>
    public static string UrlEncode(string value)
    {
      if (String.IsNullOrEmpty(value))
        return String.Empty;

      var sb = new StringBuilder();

      foreach (char @char in value)
      {
        if (unreservedCharacters.IndexOf(@char) != -1)
          sb.Append(@char);
        else
          sb.AppendFormat("%{0:x2}", (int)@char);
      }
      return sb.ToString();
    }
  }
```





<table>
<tbody>
<tr>
<td> </td>
<td>!</td>
<td>*</td>
<td>'</td>
<td>(</td>
<td>)</td>
<td>;</td>
<td>:</td>
<td>@</td>
<td>&amp;</td>
<td>=</td>
<td>+</td>
<td>$</td>
<td>,</td>
<td>/</td>
<td>?</td>
<td>#</td>
<td>[</td>
<td>]</td></tr>
<tr>
<td>HttpUtility<br/></td>
<td>!</td>
<td>*</td>
<td>%27</td>
<td>(</td>
<td>)</td>
<td>%3b</td>
<td>%3a</td>
<td>%40</td>
<td>%26</td>
<td>%3d</td>
<td>%2b</td>
<td>%24</td>
<td>%2c</td>
<td>%2f</td>
<td>%3f</td>
<td>%23</td>
<td>%5b</td>
<td>%5d</td></tr>
<tr>
<td>UrlEncode</td>
<td>%21</td>
<td>%2a</td>
<td>%27</td>
<td>%28</td>
<td>%29</td>
<td>%3b</td>
<td>%3a</td>
<td>%40</td>
<td>%26</td>
<td>%3d</td>
<td>%2b</td>
<td>%24</td>
<td>%2c</td>
<td>%2f</td>
<td>%3f</td>
<td>%23</td>
<td>%5b</td>
<td>%5d</td></tr></tbody></table>



<table>
<tbody>
<tr>
<td> </td>
<td>&lt;</td>
<td>&gt;</td>
<td>~</td>
<td>.</td>
<td>"</td>
<td>{</td>
<td>}</td>
<td>|</td>
<td>\</td>
<td>-</td>
<td>`</td>
<td>_</td>
<td>^</td>
<td>%</td>
<td>space</td></tr>
<tr>
<td>HttpUtility</td>
<td>%3c</td>
<td>%3e</td>
<td>%7e</td>
<td>.</td>
<td>%22</td>
<td>%7b</td>
<td>%7d</td>
<td>%7c</td>
<td>%5c</td>
<td>-</td>
<td>%60</td>
<td>_</td>
<td>%5e</td>
<td>%25</td>
<td>+</td></tr>
<tr>
<td>UrlEncode</td>
<td>%3c</td>
<td>%3e</td>
<td>~</td>
<td>.</td>
<td>%22</td>
<td>%7b</td>
<td>%7d</td>
<td>%7c</td>
<td>%5c</td>
<td>-</td>
<td>%60</td>
<td>_</td>
<td>%5e</td>
<td>%25</td>
<td>%20</td></tr></tbody></table>


