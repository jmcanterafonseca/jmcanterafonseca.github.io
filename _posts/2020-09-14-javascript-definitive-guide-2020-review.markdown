---
layout: post
title:  "Javascript .- The Definitive Guide .- 2020 Edition .- Review"
description: "This blog post provides a review of David Flanagan's book on Javascript. (2020 Edition)"
date:   2020-09-14 08:00:00 +0200
categories: Javascript Flanagan 7th Edition Book Review
comments: false 
---

## Introduction

Javascript is a language in continuos evolution. From its original roots as a form validation language on the Web to being nowadays a complete programming language intended to both front-end and backend (Node.js) development. During this more than 20 years journey the language has been extended, and starting from 2015, (ES6 major milestone) it has evolved year after year incorporating different features largely demanded by the community.

As strong tech professionals, we are required not to only keep up to date on this important technology, but also to fully understand how it works under the hoods, including its main APIs, operators and idiomatic constructs. I have always considered [David Flanagan](https://davidflanagan.com/)'s books the reference ones. I had the honour to work together with him in the Firefox OS project and he kindly handed me a copy of the [Seventh Edition](https://www.oreilly.com/library/view/javascript-the-definitive/9781491952016/) of his book. [Sixth edition](https://www.oreilly.com/library/view/javascript-the-definitive/9781449393854/) was published 9 years ago and since then Javascript has consolidated as one of the most modern and dynamic programming languages. 

This blog post is a summary of the main review highlights I can make after reading the book. I can confess that I have really enjoyed it, as it has helped me to gain an overview of where the language is and where it is headed to. In addition, I have been able to fully grasp, among other things, how classes, modules or asynchronous constructs really work. 

## General overview of the book

The book is written so that no previous knowledge of Javascript is assumed. It starts assuming zero prior knowledge of Javascript. Thus if you are new to the language it is also a very advisable reading. The first chapter starts with a quick tour of Javascript with very helpful but simple code snippets. That is, in my opinion, one of the greatest advantages of the book. There are no lengthy examples but code snippets that go straight to the point. It is really helpful if you plan, as I do, to use the book as a reference to consult in case of doubt. 

The book continues with the classical constructs of the language: statements, objects, strings, arrays, functions. Nonetheless, when a new Ecmascript 2020 feature is available, it is properly explained and remarked. Then, the book continues dealing with more advanced subjects such as classes, modules, the standard library, iterators or asynchronous programming. The latter aspects of the language have been adding new constructs and syntactic sugar during last years, and fortunately, the author is able to introduce them seamlessly going from the classical, low level, concepts to the newer, higher level abstractions. 

Another advantage of the book is that it remains agnostic on the target execution environment (Node.js or Web Browser). However, at the end of the book, two specific chapters are devoted to programming on Web Browsers and Node.js respectively. In the case of Web Browsers SVG, Web Components, Audio, History or Canvas APIs are explained with examples. Concerning Node.js important aspects such as EventEmitters, Streams, Buffers child processes or files are properly discussed. 

The last chapter talks about different tools (module managers, linters, prettifiers, test frameworks, transpilers, type annotations, ...) that are of much importance when developing real world applications. Extension languages such as Typescript are mentioned but not developed in detail, as they are becoming less relevant once new features are landing in the ES standard. 

## Top 5 Remarkable Learnings by Reading the Book 

Personally, (I have been working regularly with Javascript during the last 10 years), by reading the book, the top 5 learnings I have found more useful and relevant are: 

* New Javascript operators:

** Conditional Property access: `a.b?.c`

** Conditional Invocation: `log?.(x)`

** First Defined Operator: `a ?? b ?? c`

** Spread operator `const myObj = { ...otherObj }`

** Computed Properties: `const obj = { [PROPERTY_NAME]: "x" }`

* Asynchronous Programming under the hoods:  The journey from callbacks to `await` / `async` stopping by `Promise`. 

**  `Promise`, `Promise.allSettled` vs `Promise.all`. Promise settlement explained. 

** `await`, `async` operators and their implementation. 

** Asynchronous iteration (`for await` loops). 

** Event Emitters in Node. 

** Workers (both Node and Web Browser) and Child Processes.

* Modules: The journey from CommonJS Modules to the standard `import` and `export` sentences. How modules are declared and work in a Web Browser execution environment: `<script type=module>`. 

* Classes: The journey from constructor functions, the `prototype` and the syntactic sugar of `class` declaration. 

* New APIs:

** `Map`, `Set` classes. 

** URL APIs and fetch API (goodbye to XHR). 

** Typed Arrays 

** Streams

** Internationalization API

** Fully-fledged Console APIs

## Conclusions

David Flanagan has made an excellent job in writing the seventh Edition of "Javascript the Definitive Guide". If you want to have a solid understanding of Javascript is a must buy and read. Last but not least, thank you very much to David for enabling us as better professionals. 
