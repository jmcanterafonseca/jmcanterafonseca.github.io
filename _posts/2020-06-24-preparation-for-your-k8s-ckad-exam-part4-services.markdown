---
layout: post-with-toc
title:  "CKAD Exam Preparation 4/4 - Deployments, Services and Network"
date:   2020-06-24 08:00:00 +0200
categories: Kubernetes Certification Application Developer CNCF K8s Cloud Native Computing CKAD Linux Foundation deployments services
feedback: "https://github.com/jmcanterafonseca/jmcanterafonseca.github.io/issues/4"
---

{% include K8s/series.markdown %}

## 🧱 Deployments

{% include see-also.markdown content="https://kubernetes.io/docs/concepts/configuration/" %}

To start with, a new Deployment boilerplate can be created via a dry-run:

{% highlight shell %}
kubectl create deployment ex1 --image=nginx  --dry-run=client -o=yaml > dep1.yaml
{% endhighlight %}

Then such deployment can be tuned, see below:

{% highlight yaml %}
{% include examples/dep1.yaml %}
{% endhighlight %}

{% highlight shell %}
kubectl get deployments/ex1 -n jmcf -o=wide -w
{% endhighlight %}

{% highlight shell %}
NAME   READY   UP-TO-DATE   AVAILABLE   AGE     CONTAINERS   IMAGES   SELECTOR
ex1    3/3     3            3           2m18s   nginx        nginx    app=ex1
{% endhighlight %}

{% highlight shell %}
kubectl get rs -n jmcf -o=wide --selector='app=ex1'
{% endhighlight %}

{% highlight shell %}
NAME             DESIRED   CURRENT   READY   AGE     CONTAINERS   IMAGES   SELECTOR
ex1-678d4cb9c5   3         3         3       5m23s   nginx        nginx    app=ex1,
{% endhighlight %}

{% highlight shell %}
kubectl get pods -n jmcf --selector='app=ex1' -o=wide
{% endhighlight %}

{% highlight shell %}
NAME                   READY   STATUS    RESTARTS   AGE     IP            
ex1-678d4cb9c5-lx7sx   1/1     Running   0          7m30s   172.17.0.32
ex1-678d4cb9c5-lzlkk   1/1     Running   0          7m30s   172.17.0.47
ex1-678d4cb9c5-zmknk   1/1     Running   0          7m30s   172.17.0.48
{% endhighlight %}

{% include remember.markdown content="A Deployment is based on a templated Pod. There should be created as many Pods as replicas." %}

{% include remember.markdown content="A Deployment automatically creates a Replica Set for controlling the number of replicas." %}

A Deployment can be updated just through `kubectl edit`:

{% highlight shell %}
kubectl edit -n jmcf -f dep1.yaml
{% endhighlight %}

{% include remember.markdown content="When you edit a Deployment a new revision might be created, allowing you to rollback later to a previous configuration." %}

The image of our Deployment can be updated through command line:

{% highlight shell %}
kubectl set image deployment/ex1 nginx=nginx:1.9.1 -n jmcf
{% endhighlight %}

### Rollout

To check rollout status of a deployment: 
{% highlight shell %}
kubectl rollout status deploy ex1 -n jmcf
{% endhighlight %}

Display rollout history
{% highlight shell %}
kubectl rollout history deployments/ex1 -n jmcf
{% endhighlight %}

Rolling back to a different revision
{% highlight shell %}
kubectl rollout undo deployments/ex1 --to-revision=1 -n jmcf
{% endhighlight %}

Scaling out a deployment
{% highlight shell %}
kubectl scale deployments/ex1 --replicas=5 -n jmcf
{% endhighlight %}

{% include remember.markdown content="Scaling out a Deployment **does not** generate a new revision." %}

Auto scale an existing deployment
{% highlight shell %}
kubectl autoscale deployments/ex1 --min=5 --max=10 --cpu-percent=80 -n jmcf
{% endhighlight %}

{% include remember.markdown content="Requesting autoscaling implies the creation of an Horizontal Pod Autoscaler." %}

You can list the existing Horizontal Pod Autoscalers by
{% highlight shell %}
kubectl get hpa -n jmcf
{% endhighlight %}

{% highlight shell %}
NAME   REFERENCE        TARGETS         MINPODS   MAXPODS   REPLICAS   AGE
ex1    Deployment/ex1   <unknown>/80%   5         10        5          2m57s
{% endhighlight %}

{% include remember.markdown content="Requesting autoscaling implies the creation of an Horizontal Pod Autoscaler." %}

## Services


## Network

### Ingress Controllers

### Network Policies


{% include feedback.markdown %}
