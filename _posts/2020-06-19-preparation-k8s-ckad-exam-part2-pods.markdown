---
layout: post-with-toc
title:  "CKAD Exam Preparation 2/4 - Pods and Jobs"
date:   2020-06-19 08:00:00 +0200
categories: Kubernetes Certification Application Developer CNCF K8s Cloud Native Computing CKAD Linux Foundation Pods
feedback: "https://github.com/jmcanterafonseca/jmcanterafonseca.github.io/issues/2"
---

## ▶️ Introduction

This part is devoted to **Pods and Jobs** as key primitives of the CKAD Exam Curriculum. To learn more about the CKAD Exam please read this [overview]({% post_url 2020-06-25-preparation-k8s-ckad-exam-overview %}).

{% include K8s/series.markdown %}

## ⚙️ Running Pods

{% include see-also.markdown content="https://kubernetes.io/docs/concepts/workloads/Pods/" %}

To general formula for **running** a K8s Pod is:

{% highlight shell %}
kubectl run <Pod_NAME> --image=<IMAGE> --port=<PORT> --labels=<LABELS> --env=<ENV> -- <COMMAND>
{% endhighlight %}

{% include remember.markdown content="The `<COMMAND>` has to be the literal command as you would type it on a command line. After the `--` only the command line shall appear" %} 

{% include remember.markdown content="`<PORT>` is purely informative." %} 

An example of the above is the following: 

{% highlight shell %}
kubectl run b1 --image=busybox --port=3456 --labels='app=my-app' --env='var1=val1' -- sh -c 'sleep 3600'
{% endhighlight %}

{% include remember.markdown content="`busybox` is one of your best allies when it comes to creating testing/dummy Pods. Another option is `alpine`." %} 

{% include remember.markdown content="By default a Pod's container will always be restarted by K8s once it dies." %} 

We can easily **execute** a process inside the former Pod, for instance we can check environment variables:

{% highlight shell %}
kubectl exec b1 -it -- env
{% endhighlight %}

**Running** a "casual", temporal Pod inside a Cluster:

{% highlight shell %}
kubectl run tmPod -it --image=busybox --restart=Never --rm=true -- sh
{% endhighlight %}

{% include remember.markdown content="`-it` allows to attach your container to the local console." %} 

{% include remember.markdown content="`run` is for running Pods and `exec` is for executing commands on Pods (or, more precisely, containers pertaining to Pods)" %} 

If you need to customize a Pod manifest you can start with a **YAML boilerplate**, edit it and finally apply it.
The `--dry-run=client` and `-o=yaml` are the key options when it comes to creating a boilerplate, for instance:

{% highlight shell %}
kubectl run b2 --image=busybox --env='var1=val1' --dry-run=client -o=yaml -- sh -c 'sleep 3600' > b2.yaml
{% endhighlight %}

will generate a `b2.yaml` file containing:

{% highlight yaml %}
{% include examples/b2.yaml %}
{% endhighlight %}

then you can **edit** the file `b2.yaml` adding the **custom** directives you may need and finally 

{% highlight shell %}
kubectl apply -f b2.yaml
{% endhighlight %} 

To check the **logs** of a Pod 

{% highlight shell %}
kubectl logs b2 
{% endhighlight %}

{% include remember.markdown content="If a Pod executes more than one container you can always select the target container with `-c <CONTAINER_NAME>`" %} 

{% include remember.markdown content="Use `--previous` to get logs of a **previous** execution. `-f` can be used to stream logs." %} 

## 🧰 Pod manifest examples

Hereby you will find some Pod manifest examples highlighting different features related to Pods. 

### Simple Pod

{% highlight yaml %}
{% include examples/simple-pod.yaml %}
{% endhighlight %}

### Pod with a custom Service Account

{% include remember.markdown content="A Service Account allows service within a Namespace to call the K8s API Server." %} 

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

{% include remember.markdown content="A Security Context allows to set up a UID and GID under which the container process will execute." %} 

{% highlight yaml %}
{% include examples/pod-security-context.yaml %}
{% endhighlight %}

### Pod with resource declaration

{% include remember.markdown content="If a Namespace defines quotas then resource declaration is mandatory." %}

{% highlight yaml %}
{% include examples/Pod-resources.yaml %}
{% endhighlight %}

### Pod with main and Sidecar containers

{% include remember.markdown content="There are other multi-container patterns such as Ambassador or Adapter." %}

{% highlight yaml %}
{% include examples/pod-sidecar.yaml %}
{% endhighlight %}

## ⏰ Jobs

{% include see-also.markdown content="https://kubernetes.io/docs/tasks/job/" %}

**Create** a Job
{% highlight shell %}
kubectl create job j1 --image=alpine --restart=OnFailure -- date
{% endhighlight %}

**List** Jobs
{% highlight shell %}
kubectl get jobs
{% endhighlight %}

A Job YAML **manifest**

{% highlight yaml %}
{% include examples/job.yaml %}
{% endhighlight %}

{% include remember.markdown content="Parallelism and deadlines allow to have finer control of Job execution." %}

{% include remember.markdown content="The Pod used to incarnate your Job will remain unless you set `ttlSecondsAfterFinished`." %} 

{% include remember.markdown content="Jobs are based on a templated Pod." %}

Create a **Cron Job** scheduled once per minute
{% highlight shell %}
kubectl create cronjob cj1 --image=alpine --schedule="*/1 * * * *" --restart=OnFailure  -- date
{% endhighlight %}

{% include remember.markdown content="A Cron Job schedule is in Cron format, see [https://en.wikipedia.org/wiki/Cron](https://en.wikipedia.org/wiki/Cron)." %}

List **Cron Jobs**
{% highlight shell %}
kubectl get cronjobs
{% endhighlight %}

A Cron Job YAML **manifest**

{% highlight yaml %}
{% include examples/cronjob.yaml %}
{% endhighlight %}

{% include remember.markdown content="Cron Jobs are based on a templated Job." %}

You can list the **Pods launched** to incarnate and execute your (Cron) Job:

{% highlight shell %}
kubectl get Pods -n jmcf --show-labels --selector='app=my-cjob'
{% endhighlight %}

{% highlight shell %}
NAME                       READY   STATUS              RESTARTS   AGE    LABELS
my-cjob-1592928720-rgvsd   0/1     Completed           0          3m3s   app=my-cjob,job-name=my-cjob-1592928720
{% endhighlight %}

{% include remember.markdown content="For Cron Jobs there is a limit in the number of Pods kept in history as per the `successfulJobsHistoryLimit` parameter." %}

You can **inspect logs** of a (Cron) Job by showing logs of an incarnating Pod:

{% highlight shell %}
kubectl logs -n jmcf my-cjob-1592928720-rgvsd
{% endhighlight %}

## ⏭️ Next in this series

[Configuration and Volumes]({% post_url 2020-06-20-preparation-k8s-ckad-exam-part3-configuration %})

{% include feedback.markdown %}