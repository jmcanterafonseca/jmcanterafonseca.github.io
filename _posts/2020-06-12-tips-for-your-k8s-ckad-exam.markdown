---
layout: post
title:  "CKAD Exam Tips"
date:   2020-06-12 08:22:51 +0200
categories: Kubernetes Certification CNCF
feedback: "https://docs.google.com/forms/d/e/1FAIpQLSc6wUtP7uzMhf_gCZgWwxtrl3dgZCyd1qVaJa71Nib0U9fHJA/viewform?usp=pp_url&entry.276315985=CKAD+Exam+Notes&entry.486182672=Yes"
---

If you like this blog article please [don't forget to click here]({{ page.feedback}})

This blog post summarizes the study notes I took during the preparation of the CKAD exam. 

The Certified Kubernetes Application Developer is a certification offered by the Cloud Native Computing Foundation.
It is intended to assess your skills as an application developer who can take advantage of the modern container orchestration
features offered by Kubernetes. 

In order to pass the exam it is fundamental not only to understand the main K8s primitives 
but also to be pretty fluent with the `kubectl` command line. Thus, it is very important to remember the most used
command line options and the main elements of the K8s object manifests (YAML). 


Explain data structures

{% highlight bash %}
kubectl explain pod.spec.containers --recursive | more
{% endhighlight %}

Help with kubectl commands

{% highlight bash %}
kubectl create deployment --help
{% endhighlight %}

Have you enjoyed this article? Was it useful? 
Tell me you feedback [here]({{ page.feedback}})
