---
layout: post
title:  "CKAD Exam Tips Preparation 2/4 - Pods"
date:   2020-06-19 08:00:00 +0200
categories: Kubernetes Certification Application Developer CNCF K8s Cloud Native Computing CKAD Linux Foundation
feedback: "https://github.com/jmcanterafonseca/jmcanterafonseca.github.io/issues/2"
---

## Introduction

This blog post series summarizes the study notes I have been taking during the preparation of 
the [Certified Kubernetes Application Developer](https://training.linuxfoundation.org/certification/certified-kubernetes-application-developer-ckad) (CKAD) exam. 

If you want to know more about this series please visit the [series 1 article]()

## The Series

During these blog series I summarize the main "study hooks" in order to be successful in your exam, as I was. The series is
composed by the following articles:

* Part 1. General Tips.
* Part 2. Pods and configuration. (This part)
* Part 3. Service and Deployments.
* Part 4. Volumes, Network Policies.

## Pod Running Tips 

To general formula for **running** a pod is:

{% highlight shell %}
kubectl run <POD_NAME> --image=<IMAGE> --port=<PORT> --labels=<LABELS> --env=<ENV> -- <COMMAND>
{% endhighlight %}
**Remember:** The `<COMMAND>` has to be the literal command as you would type it on a command line. After the `--` only the command line shall appear. 

**Remember:** `<PORT>` is purely informative. 

An example of the above is the following: 

{% highlight shell %}
kubectl run b1 --image=busybox --port=3456 --labels='app=my-app' --env='var1=val1' -- sh -c 'sleep 3600'
{% endhighlight %}

**Remember:** `busybox` is one of your best allies when it comes to creating testing/dummy pods. Another option is `alpine`. 
**Remember:** A pod by default will always be restarted by K8s once it dies. 

If we want to **execute** something inside the former pod, for instance to check environment variables:

{% highlight shell %}
kubectl exec b1 -it -- env
{% endhighlight %}

Running a "casual, temporal Pod" inside the cluster is quite easy:

{% highlight shell %}
kubectl run tmpod -it --image=busybox --restart=Never --rm=true -- sh
{% endhighlight %}

**Remember:** `-it` allows to attach your container to the local console. 

**Remember:** `run` is for running pods and `exec` is for executing commands over pods (or more precisely containers pertaining to pods).

If you need to customize a Pod manifest you can start with a YAML boilerplate, edit it and finally apply it.
The `--dry-run=client` and `-o=yaml` are the key options when it comes to creating a boilerplate, for instance:

{% highlight shell %}
kubectl run b2 --image=busybox --env='var1=val1' --dry-run=client -o=yaml -- sh -c 'sleep 3600' > b2.yaml
{% endhighlight %}

will generate a b2.yaml file containing:

{% highlight yaml %}
{% include examples/b2.yaml %}
{% endhighlight %}

then you can edit the file `b2.yaml` adding the custom directives you may need and finally 

{% highlight shell %}
kubectl apply -f b2.yaml
{% endhighlight %} 

To check the logs of a pod 

{% highlight shell %}
kubectl logs b2 
{% endhighlight %}

**Remember:** If a pod executes more than one container you can always select the target container with `-c <CONTAINER_NAME>`

**Remember:** Use `--previous` to get logs of a previous execution. `-f` can be used to stream logs. 

## Pod manifest examples

Hereby you will find some pod manifest examples highlighting different features related to pods

### Simple Pod

{% highlight yaml %}
{% include examples/simple-pod.yaml %}
{% endhighlight %}

### Pod with a custom service account

{% highlight yaml %}
{% include examples/pod-sa.yaml %}
{% endhighlight %}

### Pod with liveness probe

{% highlight yaml %}
{% include examples/pod-liveness.yaml %}
{% endhighlight %}

### Pod with readiness probe

{% highlight yaml %}
{% include examples/pod-readiness.yaml %}
{% endhighlight %}

### Pod with security context

{% highlight yaml %}
{% include examples/pod-security-context.yaml %}
{% endhighlight %}

### Pod with resource declaration

{% highlight yaml %}
{% include examples/pod-resources.yaml %}
{% endhighlight %}

### Pod with main and sidecar containers

{% highlight yaml %}
{% include examples/pod-sidecar.yaml %}
{% endhighlight %}

## Feedback
Have you enjoyed this article? Have you found it useful? 
Tell me you feedback [here]({{ page.feedback}}) (A github account is needed)
