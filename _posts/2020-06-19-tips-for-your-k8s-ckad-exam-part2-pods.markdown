---
layout: post-with-toc
title:  "CKAD Exam Preparation 2/4 - Pods and Jobs"
date:   2020-06-19 08:00:00 +0200
categories: Kubernetes Certification Application Developer CNCF K8s Cloud Native Computing CKAD Linux Foundation pods
feedback: "https://github.com/jmcanterafonseca/jmcanterafonseca.github.io/issues/2"
---

{% include K8s/series.markdown %}

## ⚙️ Running Pods 

To general formula for **running** a K8s pod is:

{% highlight shell %}
kubectl run <POD_NAME> --image=<IMAGE> --port=<PORT> --labels=<LABELS> --env=<ENV> -- <COMMAND>
{% endhighlight %}
{% include remember.markdown content="The `<COMMAND>` has to be the literal command as you would type it on a command line. After the `--` only the command line shall appear" %} 

{% include remember.markdown content="`<PORT>` is purely informative." %} 

An example of the above is the following: 

{% highlight shell %}
kubectl run b1 --image=busybox --port=3456 --labels='app=my-app' --env='var1=val1' -- sh -c 'sleep 3600'
{% endhighlight %}

{% include remember.markdown content="`busybox` is one of your best allies when it comes to creating testing/dummy pods. Another option is `alpine`." %} 

{% include remember.markdown content="A pod by default will always be restarted by K8s once it dies." %} 

We can easily **execute** a process inside the former pod, for instance we can check environment variables:

{% highlight shell %}
kubectl exec b1 -it -- env
{% endhighlight %}

Running a "casual, temporal Pod" inside the cluster is quite easy:

{% highlight shell %}
kubectl run tmpod -it --image=busybox --restart=Never --rm=true -- sh
{% endhighlight %}

{% include remember.markdown content="`-it` allows to attach your container to the local console." %} 

{% include remember.markdown content="`run` is for running pods and `exec` is for executing commands on pods (or, more precisely, containers pertaining to pods)" %} 

If you need to customize a Pod manifest you can start with a YAML boilerplate, edit it and finally apply it.
The `--dry-run=client` and `-o=yaml` are the key options when it comes to creating a boilerplate, for instance:

{% highlight shell %}
kubectl run b2 --image=busybox --env='var1=val1' --dry-run=client -o=yaml -- sh -c 'sleep 3600' > b2.yaml
{% endhighlight %}

will generate a `b2.yaml` file containing:

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

{% include remember.markdown content="If a pod executes more than one container you can always select the target container with `-c <CONTAINER_NAME>`" %} 

{% include remember.markdown content="Use `--previous` to get logs of a previous execution. `-f` can be used to stream logs." %} 

## 🧰 Pod manifest examples

Hereby you will find some pod manifest examples highlighting different features related to pods. 

### Simple Pod

{% highlight yaml %}
{% include examples/simple-pod.yaml %}
{% endhighlight %}

### Pod with a custom service account

{% include remember.markdown content="A service account allows service within a namespace to call the K8s API Server." %} 

{% highlight yaml %}
{% include examples/pod-sa.yaml %}
{% endhighlight %}

### Pod with liveness probe

{% include remember.markdown content="There are thresholds to consider the process as dead." %} 

{% highlight yaml %}
{% include examples/pod-liveness.yaml %}
{% endhighlight %}

### Pod with readiness probe

{% include remember.markdown content="There are thresholds to consider the process as ready." %} 

{% highlight yaml %}
{% include examples/pod-readiness.yaml %}
{% endhighlight %}

### Pod with security context

{% include remember.markdown content="A security context allows to set up a UID and GID under which the container process will execute." %} 

{% highlight yaml %}
{% include examples/pod-security-context.yaml %}
{% endhighlight %}

### Pod with resource declaration

{% include remember.markdown content="If a namespace defines quotas then resource declaration is mandatory." %}

{% highlight yaml %}
{% include examples/pod-resources.yaml %}
{% endhighlight %}

### Pod with main and sidecar containers

{% include remember.markdown content="There are other multi-container patterns such as ambassador or adapter." %}

{% highlight yaml %}
{% include examples/pod-sidecar.yaml %}
{% endhighlight %}

## ⌨️ Jobs

Create a Job
{% highlight shell %}
kubectl create job j1 --image=alpine --restart=OnFailure -- date
{% endhighlight %}

Create a Cron Job scheduled once per minute
kubectl create cronjob cj1 --image=alpine --schedule="*/1 * * * *" --restart=OnFailure  -- date

A Job which defines parallelism and completion deadlines:

{% highlight yaml %}
{% include examples/job.yaml %}
{% endhighlight %}

A Cron Job 

{% highlight yaml %}
{% include examples/cronjob.yaml %}
{% endhighlight %}

{% include remember.markdown content="Jobs are based on a templated Pod" %}

{% include remember.markdown content="Parallelism and deadlines allow to have finer control of a Job" %}

## ⏭️ Next in this series

[Configuration and Volumes]({% post_url 2020-06-20-tips-for-your-k8s-ckad-exam-part3-configuration %})

{% include feedback.markdown %}