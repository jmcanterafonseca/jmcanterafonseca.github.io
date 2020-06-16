---
layout: post
title:  "CKAD Exam Tips Preparation 1/4"
date:   2020-06-16 18:00:00 +0200
categories: Kubernetes Certification CNCF K8s Cloud Native Computing CKAD Linux Foundation
feedback: "https://docs.google.com/forms/d/e/1FAIpQLSc6wUtP7uzMhf_gCZgWwxtrl3dgZCyd1qVaJa71Nib0U9fHJA/viewform?usp=pp_url&entry.276315985=CKAD+Exam+Notes&entry.486182672=Yes"
---

If you like this blog article please [don't forget to like it here]({{ page.feedback}})

This blog post series summarizes the study notes I have been taking during the preparation of 
the [Certified Kubernetes Application Developer](https://training.linuxfoundation.org/certification/certified-kubernetes-application-developer-ckad) (CKAD) exam. 

The CKAD is a certification offered by the [Cloud Native Computing Foundation](https://www.cncf.io/).
It is intended to assess your skills as an application developer able to define application resources and use core primitives to build, monitor, and troubleshoot scalable applications and tools in Kubernetes (K8s). If you want to start learning K8s the Linux Foundation
offers a free course [Introduction to Kubernetes](https://www.edx.org/es/course/introduction-to-kubernetes). 

In order to pass the exam it is fundamental not only to have a solid understanding of the main K8s primitives 
but also to be pretty fluent with the `kubectl` command line. Therefore, it is very important to remember the most frequently used
command line options and the main elements of the K8s object manifests (preferably in YAML format). 

During these series I will summarize the main "study hooks" to remember in order to be successful in your exam. 

## Documentation Tips 

During the exam you will be allowed to open only a browser tab pointing to the K8s documentation Web site. 
The main links to remember are below, namely the concepts one, as it will allow you to copy and paste object manifests easily. 

* Documentation home page: [https://kubernetes.io/docs/home/](https://kubernetes.io/docs/home/)
* K8s concepts: [https://kubernetes.io/docs/concepts/](https://kubernetes.io/docs/concepts/)
* K8s reference: [https://kubernetes.io/docs/reference/](https://kubernetes.io/docs/reference/)
* `kubectl` cheat sheet [https://kubernetes.io/docs/reference/kubectl/cheatsheet/](https://kubernetes.io/docs/reference/)



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
