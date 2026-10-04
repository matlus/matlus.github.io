---
title: Linq Group By - Finding Duplicates
description: Group lessons by AddedDate and select groups containing more than one
  item to find duplicates with LINQ, retaining the shared date and all matching lesson
  objects.
datePublished: '2011-02-02'
dateModified: '2011-02-02'
tags:
- linq
- duplicate-detection
- csharp
hero: linq-group-by-finding-duplicates
draft: false
---

This post is a little snippet on using Linq to find duplicates in a list of objects where a specific property of the object is used to find the duplicates. In this particular example, the objects are <code>Lessons</code> and in addition to other properties each lesson has a <code>AddedDate</code> property and what we need to do is find all lessons where the <code>AddedDate</code> is a duplicate of another lesson.

In order to solve this we use <code>Group By</code> and we group by the <code>AddedDate</code> property and if any group has a count greater than 1, it is a duplicate and we need to get those. For test purposes, I've defined a variable called <code>testDateAndTime</code> that is assigned to the current DateTime. And then at the time of initializing the Lesson instances, I've assigned two lessons the same date and time using this variable. The two lessons (as shown in the code listing below) are:

1. Preposition / Phrasal Verb
2. German Verbs in the Present Tense

### Linq - Group By Finding Duplicates



```csharp
  class Program
  {
    static void Main(string[] args)
    {
      var testDateAndTime = DateTime.Now;

      var lessons = new Lesson[] {
        new Lesson { Title="Verb Tense", Subject="English", AddedDate = DateTime.Now.AddMinutes(1)},
        new Lesson { Title="Conditionals", Subject="English", AddedDate = DateTime.Now.AddDays(2)},
        new Lesson { Title="Gerunds and Infinitives", Subject="English", AddedDate = DateTime.Now.AddDays(3)},
        new Lesson { Title="Vocabulary", Subject="English", AddedDate = DateTime.Now.AddDays(4)},
        new Lesson { Title="Preposition / Phrasal Verb", Subject="English", AddedDate = testDateAndTime},
        new Lesson { Title="Greetings", Subject="German", AddedDate = DateTime.Now.AddMinutes(5)},
        new Lesson { Title="Personal pronouns", Subject="German", AddedDate = DateTime.Now.AddDays(6)},
        new Lesson { Title="Introduction to nouns and gender", Subject="German", AddedDate = DateTime.Now.AddDays(7)},
        new Lesson { Title="Two important verbs", Subject="German", AddedDate = DateTime.Now.AddDays(8)},
        new Lesson { Title="German Verbs in the Present Tense", Subject="German", AddedDate = testDateAndTime}
      };

      var groupedLessons = from l in lessons
                           group l by l.AddedDate into g
                           where g.Count() > 1
                           select new { AddedDate = g.Key, Lessons = g };

      foreach (var k in groupedLessons)
      {
        Console.WriteLine("Added Date: " + k.AddedDate);
        foreach (var l in k.Lessons)
        {
          Console.WriteLine("\t Lesson Title: " + l.Title);
        }
      }
    }
  }

  public class Lesson
  {
    public string Title { get; set; }
    public string Subject { get; set; }
    public DateTime AddedDate { get; set; }
  }
```



If you run this program you'll see the following output, which is what you'd expect.



```text
Added Date: 2/2/2011 8:08:59 AM         Lesson Title: Preposition / Phrasal Verb         Lesson Title: German Verbs in the Present Tense
```


