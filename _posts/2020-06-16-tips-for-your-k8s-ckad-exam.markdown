---
layout: post
title:  "CKAD Exam Tips Preparation 1/4"
date:   2020-06-16 08:00:00 +0200
categories: Kubernetes Certification Application Developer CNCF K8s Cloud Native Computing CKAD Linux Foundation
feedback: "https://docs.google.com/forms/d/e/1FAIpQLSc6wUtP7uzMhf_gCZgWwxtrl3dgZCyd1qVaJa71Nib0U9fHJA/viewform?usp=pp_url&entry.276315985=CKAD+Exam+Notes&entry.486182672=Yes"
---

If you like this blog article please [don't forget to like it here]({{ page.feedback}})

This blog post series summarizes the study notes I have been taking during the preparation of 
the [Certified Kubernetes Application Developer](https://training.linuxfoundation.org/certification/certified-kubernetes-application-developer-ckad) (CKAD) exam. 

The CKAD is a certification offered by the [Cloud Native Computing Foundation](https://www.cncf.io/), a project hosted by the [Linux Foundation](https://www.linuxfoundation.org/).
It is intended to assess your skills as an application developer able *to define application resources and use core primitives to build, monitor, and troubleshoot scalable applications and tools in Kubernetes (K8s)*. If you want to start learning K8s I would recommend this training course: [Introduction to Kubernetes](https://www.edx.org/es/course/introduction-to-kubernetes). 
Mathew Palmer has developed a [course and a book](https://matthewpalmer.net/kubernetes-app-developer/) more targeted to preparing the CKAD.

In order to pass the exam it is fundamental not only to have a solid understanding of the main K8s primitives 
but also to **be pretty fluent with the `kubectl` command line**. Therefore, it is very important to remember the more frequently used command line options and the main elements of the K8s object manifests (preferably in **YAML** format, as it is terser). You can found mock tasks somewhat similar to those found on the exam thanks to the work of
[Dimitris-Ilias Gkanatsios](https://github.com/dgkanatsios/CKAD-exercises).

During these blog series I summarize the main "study hooks" in order to be successful in your exam, as I was. 

## Documentation Tips 

During the exam you will be allowed to open **only one browser tab** pointing to the K8s documentation Web site. 
The main links to remember are below, namely the concepts one, as it will allow you to copy and paste certain
object manifests easily, for instance `PersistentVolume` or `PersistentVolumeClaim`. 

* Documentation home page: [https://kubernetes.io/docs/home/](https://kubernetes.io/docs/home/)
* K8s concepts: [https://kubernetes.io/docs/concepts/](https://kubernetes.io/docs/concepts/)
* K8s reference: [https://kubernetes.io/docs/reference/](https://kubernetes.io/docs/reference/)
* `kubectl` cheat sheet [https://kubernetes.io/docs/reference/kubectl/cheatsheet/](https://kubernetes.io/docs/reference/)

`kubectl` is ready to enable autocomplete and that can save you precious time. I found kubectl autocomplete enabled during my exam but in any case you can find how to enable it in the cheat sheet. 

To remember the syntax and structure of YAML object manifests `kubectl explain` will be your best ally. 
Just using the syntax `<object_name>.<property>` you can get the corresponding documentation without going
to documentation web pages. Remember that any K8s object has four main fields: `apiVersion`, `kind`, `metadata` and `spec` and the meaty part is at `spec`. 

{% highlight shell %}
kubectl explain pod.spec.containers --recursive
kubectl explain deployment.spec
{% endhighlight %}

At any time you can get detailed kubectl command syntax. The nice thing about `--help` is
that it is available at any nesting level, for instance:

{% highlight shell %}
kubectl --help
kubectl create --help
kubectl create deployment --help
{% endhighlight %}

## Configuration and Namespaces Tips
Your exam is going to be conducted (from a base node) in different K8s clusters and namespaces. 
`kubectl` allows you to work against different clusters provided you have set the proper configuration context. 

To view your configuration: 

{% highlight shell %}
kubectl config view
{% endhighlight %}

Remember that: 

{% highlight shell %}
Config = { Users, Clusters, Contexts, Current-Context }
Context = (Cluster, User, Namespace)
{% endhighlight %}

If you want to set up a new context with a particular user, cluster and namespace:

{% highlight shell %}
kubectl config set-context <CONTEXT_NAME> --namespace=<NAMESPACE_NAME> 
--user <USER_NAME> --cluster <CLUSTER_NAME>
{% endhighlight %}

{% highlight shell %}
kubectl config use-context <CONTEXT_NAME> 
{% endhighlight %}

If your context is not pointing to the namespace you want to work with you can specify it:

{% highlight shell %}
kubectl -n  <NAMESPACE>
kubectl --namespace=<NAMESPACE>
{% endhighlight %}

To refer to all namespaces: 

{% highlight shell %}
kubectl -A
kubectl --all-namespaces
{% endhighlight %}

**Remember:** *A namespace can also be defined at the `metadata` level of an object manifest*.

## Generic Operations

Create an object

{% highlight shell %}
kubectl apply -f <manifest.yaml>
{% endhighlight %}

Apply an object manifest

{% highlight shell %}
kubectl apply -f <manifest.yaml>
{% endhighlight %}

**Remember:** *Some objects do not admit overriding certain fields.*

Delete an object

{% highlight shell %}
kubectl delete -f <manifest.yaml>
kubectl delete pods/mypod --grace-period=1
{% endhighlight %}

Get information about an object

{% highlight shell %}
kubectl get -f <manifest.yaml> -o=wide
kubectl get pods/mypod -o=yaml
kubectl describe -f <manifest.yaml>
{% endhighlight %}

Use JSON Path to filter fields of an object descriptor (manifest)

{% highlight shell %}
kubectl get pod nginx -o jsonpath='{.metadata.annotations}{"\n"}'
{% endhighlight %}

To re-label an object

{% highlight shell %}
kubectl label pods foo ‘status=unhealthy’ --overwrite
{% endhighlight %}

Remove labels from a set of objects (Using the notation <label>-)

{% highlight shell %}
kubectl label pods --selector=’app=v1’ app-
{% endhighlight %}

Annotate several objects

{% highlight shell %}
kubectl annotate pods nginx1 nginx2 nginx3 ‘description=a description’ 
{% endhighlight %}

## Feedback
Have you enjoyed this article? Have you found it useful? 
Tell me you feedback [here]({{ page.feedback}})
