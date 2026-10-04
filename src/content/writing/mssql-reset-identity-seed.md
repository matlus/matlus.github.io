---
title: MSSQL–Reset Identity seed
description: DBCC CHECKIDENT resets an identity seed to a chosen value. A table example
  explains why the reseed value precedes the desired next identifier after test data
  is deleted.
datePublished: '2011-02-02'
dateModified: '2011-02-02'
tags:
- sql-server
- identity-columns
hero: mssql-reset-identity-seed
draft: false
---

There are times when I need to reset the identity seed value for tables with identity columns. Its rare that I need to do this and so this post is really a "note to self" if you will. But maybe others might find it handy as well:

<code>DBCC CHECKIDENT('sometable', RESEED, 0);</code>

Change 'sometable' to the name of your table. If you need to set the seed value to something other than zero, change the last parameter in the call from 0 to what you need. The way that last parameter works is this:

Let's say you have a table (with an identity column) with 20 records. You've deleted a few records (because you've inserted records during test and you've now deleted them) and you know if you were to insert another record it is going to get an identity value of 42 say, but you want it to be 21. In order for this to work as you'd expect, set the last parameter to 20. Note, that's 20 and not 21. Of course make sure there are no records with an identity value greater than the value you set.
