# Generate Modern Async Article Visuals

Use this prompt set for the **Async-Await in C#** and **C# 8 - Async Streams**
articles. It records the modern visual direction used for their two hero images and
four explanatory figures. Keep the subject and technical requirements for each image
when changing its colors. The earlier vintage image prompt remains in
`docs/image-and-diagram-guide.md` for work that calls for that style.

## How to use this set

For a new image, give the image generator the **Shared direction** below followed
by one **Image brief**. If editing an existing image, include that image as a visual
reference and retain the same brief. Treat any source slide as a reference for the
concept, rather than for its layout, colors, typography, footer, or branding.

Review every output before using it. A generated figure may look convincing while
placing a label on the wrong component or pointing an arrow the wrong way. Keep the
technical explanation in the article text and caption so the image is not the only
source of a fact.

## Shared direction

```text
Create a contemporary high-tech editorial visual for a software-engineering
article. Use a clean, precise composition with restrained geometric forms,
layered server or data-system elements where appropriate, subtle depth, crisp
edges, and generous space. It should feel current and polished, with no vintage
paper, ink, sketching, drafting marks, cross-hatching, retro slide styling,
photographic people, or decorative circuitry.

Palette: dark graphite, charcoal, slate, cool gray, and soft silver, with one
subdued desaturated steel-blue or cyan accent. Keep saturation low and contrast
clear enough to separate paths and layers. Do not use bright orange, red, green,
rainbow palettes, neon glows, or a cyberpunk look.

Preserve the relationships in the image brief. Do not copy labels, watermarks,
confidentiality footers, URLs, logos, or visual artifacts from reference images.
For a hero, include no words or letters. For a figure, use only the requested
short labels, set in a legible modern sans-serif face; do not invent terminology.
```

The **Palette** paragraph is the adjustable part of this prompt set. A later image
can use a slightly warmer or cooler group of low-saturation neutrals and one muted
accent while retaining the same composition and subject. Check contrast and label
legibility after any palette change.

## Image briefs

### 1. Async-Await in C# hero

```text
Make a wide landscape hero, approximately 2.3:1. Show the relationship among an
incoming web request, an IIS/ASP.NET worker, the boundary between application
and operating-system I/O, and the eventual completion of an external operation.
The composition should suggest that a worker becomes available while I/O is
pending and a continuation runs when the result arrives. Use layered server
architecture and a few quiet signal paths or completion pulses. This is a
conceptual editorial illustration, with no labels or literal slide boxes.
```

Current asset: `src/assets/heroes/async-await-in-csharp.webp`.

### 2. C# 8 - Async Streams hero

```text
Make a wide landscape hero, approximately 2.3:1. Depict a database-like source
delivering individual records to a consumer one at a time. Some records have
arrived while many remain at the source. Give the flow a subtle pause-and-resume
rhythm to suggest asynchronous iteration and consumer-controlled pacing. Use
refined geometric layers and a small number of distinct record shapes. This is
a conceptual editorial illustration, with no text or code.
```

Current asset: `src/assets/heroes/csharp-8-async-streams.webp`.

### 3. Synchronous and asynchronous I/O

```text
Make a wide, readable, two-row timeline titled "Synchronous and asynchronous
I/O". The top row shows synchronous I/O: a request thread starts I/O, remains
occupied while device I/O is pending, and processes the result when it completes.
Do not draw an empty gap in that occupied thread's timeline. The bottom row
shows asynchronous I/O: the request thread starts I/O and is released; a
separate lane marked "Thread available for other work" continues during the
device wait; after completion, a continuation runs on an available pool thread.
The continuation need not use the original thread. Separate user-mode and
kernel-mode activity with a subtle boundary. Use clear arrows and only these
short labels where needed: "Synchronous I/O", "Asynchronous I/O", "User mode",
"Kernel mode", "Thread starts I/O", "Thread blocked on I/O", "Device I/O",
"I/O completes", "Thread available for other work", "Continuation runs".
```

Current asset: `public/images/writing/sync-vs-async-io-modern.webp`.

### 4. IIS request processing

```text
Make a wide architecture figure titled "IIS request processing". Draw a clear
horizontal boundary between kernel mode and user mode. An HTTP request enters
HTTP.sys in kernel mode, where a listener and request queue handle it. An
eligible kernel-cache hit can return a response without entering the application.
A cache miss or dynamic request passes to a w3wp.exe worker process in user
mode and its ASP.NET application; the response returns through HTTP.sys. Show
static content as a possible resource without implying that every request
enters ASP.NET. Use directional arrows and only concise labels: "HTTP request",
"HTTP response", "HTTP.sys", "Listener", "Request queue", "Kernel cache",
"Kernel mode", "User mode", "w3wp.exe", "Worker process", "ASP.NET application",
"Static content", "Cache hit", "Cache miss or dynamic request".
```

Current asset: `public/images/writing/iis-request-processing-modern.webp`.

### 5. Synchronous request processing

```text
Make a wide architecture figure titled "Synchronous request processing".
An HTTP request enters an IIS worker process and the ASP.NET pipeline. The CLR
thread pool supplies a worker thread to run an MVC action. The action makes a
blocking remote I/O call, and the same worker remains occupied throughout the
wait. Under load, other requests may wait for an available worker. Show the
thread pool as the source of the worker, not as a serial stage through which
the request travels. Use directional arrows and only concise labels:
"HTTP request", "IIS worker process", "ASP.NET pipeline", "CLR thread pool",
"MVC action", "Blocking I/O call", "Thread occupied while waiting",
"Remote I/O", "Other requests wait".
```

Current asset: `public/images/writing/synchronous-request-processing-modern.webp`.

### 6. I/O completion ports

```text
Make a wide architecture figure titled "I/O completion ports". Within an IIS
worker process, an ASP.NET application starts asynchronous I/O. Its worker
thread returns to the CLR thread pool while I/O remains pending. When the
operating system reports completion through a completion port, an available
pool thread can run the continuation; it need not be the original worker.
Distinguish the operating-system completion port from IIS's HTTP request queue
and cache. Use directional arrows and only concise labels: "IIS worker process",
"ASP.NET application", "CLR thread pool", "Start async I/O", "Thread released",
"I/O pending", "Completion port", "Completion notification",
"Available pool thread", "Continuation runs".
```

Current asset: `public/images/writing/io-completion-ports-modern.webp`.

## Before placing a generated image

- Check every label, arrow, and component relationship against the article. In
  particular, verify when a thread is occupied, when it is released, and which
  component sends the completion notification.
- Read text at the size used on the page, including a narrow viewport. Regenerate
  or edit any image with garbled or cramped labels.
- Remove any source-slide wording, branding, footer, or watermark. Use the
  article's own caption and prose for accessible technical explanation.
- Keep the original generator output outside the repository and prepare the
  selected site asset as a compressed WebP before publishing.
