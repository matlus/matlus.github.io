---
title: Getting the No Of CPUs and Cores
description: WMI queries expose core counts, logical and physical processors, bitness,
  and architecture in C#, with narrower queries returning only the CPU information
  required.
datePublished: '2011-02-07'
dateModified: '2026-10-03'
tags:
- wmi
- cpu-hardware
- csharp
hero: getting-the-no-of-cpus-and-cores
draft: false
---

Using WMI (Windows Management Instrumentation) it is really simple to get the all kinds of weird and useful information about the hardware of a computer. Here I use <code>ManagementObjectSearcher</code> from the <code>System.Management</code> assembly/namespace to get at information on the CPU. In particular:

- No of Cores
- No of Logical Processors
- No of Physical Processors
- Hardware Bitness (32/64 bit etc.)
- CPU Architecture (x86, x64, Itanium etc.)

### WMI Code to Extract information in the CPU



```csharp
    private static void GetCpuInformation()
    {
      var noOfCores = 0;
      foreach (var item in new System.Management.ManagementObjectSearcher("Select * from Win32_Processor").Get())
      {
        noOfCores += int.Parse(item["NumberOfCores"].ToString());
        Console.WriteLine("Bitness: {0}", item["AddressWidth"]);
        Console.WriteLine("Architecture: {0}", GetArchitectureDiscription(int.Parse(item["Architecture"].ToString())));
      }

      Console.WriteLine("Number Of Cores: {0}", noOfCores);

      foreach (var item in new System.Management.ManagementObjectSearcher("Select * from Win32_ComputerSystem").Get())
      {
        Console.WriteLine("Number Of Logical Processors: {0} ", item["NumberOfLogicalProcessors"]);
        Console.WriteLine("Number Of Physical Processors: {0} ", item["NumberOfProcessors"]);
      }      
    }

    private static string GetArchitectureDiscription(int architectureNo)
    {
      switch (architectureNo)
      {
        case 0: return "x86";
        case 1: return "MIPS";
        case 2: return "Alpha";
        case 3: return "PowerPC";
        case 6: return "Itanium-based systems";
        case 9: return "x64";
        default:
          return "Unkown";
      }
    }
```



There is quite a bit more information available from both the [Win32\_Processor](https://web.archive.org/web/20230605173454/http://msdn.microsoft.com/en-us/library/aa394373(v=vs.85).aspx "WMI Win32_Processor Class") WMI class as well as the [Win32\_ComputerSystem](https://web.archive.org/web/20230605173454/http://msdn.microsoft.com/en-us/library/aa394102(v=vs.85).aspx "WMI Win32_ComputerSystem Class"), so you may want to check out the other properties/information these object provide.

I use the number of cores information to (naïvely) determine how many threads I can/should spawn when I'm doing some multi-threaded work. Of course nowadays with availability of <code>Tasks</code> in .NET and <code>Parallel.For</code> etc. one should probably use facilities built into the .NET framework where possible.

You can optimize the queries if you need to. For example, we're doing a select \* from for each of queries you see in the code listing above. You could change that to return only the properties you're interested in. For example the seconds query above could be rewritten as



```text
"Select NumberOfLogicalProcessors, NumberOfProcessors from Win32_ComputerSystem"
```



The rest of the code will remain the same, including the way in which the properties are extracted from the result.
