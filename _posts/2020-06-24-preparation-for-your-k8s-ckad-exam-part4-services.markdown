---
layout: post-with-toc
title:  "CKAD Exam Preparation 4/4 - Deployments, Services and Networking"
date:   2020-06-24 08:00:00 +0200
categories: Kubernetes Certification Application Developer CNCF K8s Cloud Native Computing CKAD Linux Foundation deployments services
feedback: "https://github.com/jmcanterafonseca/jmcanterafonseca.github.io/issues/4"
---

{% include K8s/series.markdown %}

## 🖥️ &nbsp;&nbsp;Deployments

{% include see-also.markdown content="https://kubernetes.io/docs/concepts/workloads/controllers/deployment/" %}

Create a new Deployment boilerplate via a dry-run:

{% highlight shell %}
kubectl create deployment ex1 --image=nginx  --dry-run=client -o=yaml > dep1.yaml
{% endhighlight %}

Then such deployment can be tuned, for instance setting the number of desired **replicas**:

{% highlight yaml %}
{% include examples/dep1.yaml %}
{% endhighlight %}

Check Deployment status:
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

{% include remember.markdown content="A Replica Set is created as a subsidiary of a Deployment." %}

List the Pods associated to a Deployment:
{% highlight shell %}
kubectl get pods -n jmcf --selector='app=ex1' -o=wide
{% endhighlight %}

{% highlight shell %}
NAME                   READY   STATUS    RESTARTS   AGE     IP            
ex1-678d4cb9c5-lx7sx   1/1     Running   0          7m30s   172.17.0.32
ex1-678d4cb9c5-lzlkk   1/1     Running   0          7m30s   172.17.0.47
ex1-678d4cb9c5-zmknk   1/1     Running   0          7m30s   172.17.0.48
{% endhighlight %}

{% include remember.markdown content="A Deployment is based on a templated Pod. There should be as many Pods as desired replicas." %}

{% include remember.markdown content="A delete of a Deployment is on cascade, i.e. all subsidiary Pods will be deleted." %}

A Deployment can be updated just through `kubectl edit`:

{% highlight shell %}
kubectl edit -n jmcf -f dep1.yaml
{% endhighlight %}

{% include remember.markdown content="When you edit a Deployment a new revision might be created, allowing you to rollback later to a previous configuration." %}

Update Deployment image:

{% highlight shell %}
kubectl set image deployment/ex1 nginx=nginx:1.9.1 -n jmcf
{% endhighlight %}

{% highlight shell %}
kubectl get rs -n jmcf -o=wide --selector='app=ex1'
NAME             DESIRED   CURRENT   READY   AGE     CONTAINERS   IMAGES        SELECTOR
ex1-678d4cb9c5   0         0         0       3h30m   nginx        nginx         app=ex1
ex1-79c777cf98   3         3         3       171m    nginx        nginx:1.9.1   app=ex1
{% endhighlight %}

{% include remember.markdown content="Changing the image of a Deployment implies the creation of a new Replica Set." %}

### Rollout

To check the rollout status of a Deployment: 
{% highlight shell %}
kubectl rollout status deploy ex1 -n jmcf -w
{% endhighlight %}

{% include remember.markdown content="`maxSurge` and `maxUnavailable` (`spec.strategy`) are two important parameters that govern how the rollout process is conducted." %}

Display rollout history of a Deployment:
{% highlight shell %}
kubectl rollout history deployments/ex1 -n jmcf
{% endhighlight %}

Rolling back to a previous revision:
{% highlight shell %}
kubectl rollout undo deployments/ex1 --to-revision=1 -n jmcf
{% endhighlight %}

{% include remember.markdown content="A rollback generates a new revision." %}

Scaling out a Deployment:
{% highlight shell %}
kubectl scale deployments/ex1 --replicas=5 -n jmcf
{% endhighlight %}

{% include remember.markdown content="Scaling out a Deployment **does not** generate a new revision." %}

Auto scale an existing Deployment:
{% highlight shell %}
kubectl autoscale deployments/ex1 --min=5 --max=10 --cpu-percent=80 -n jmcf
{% endhighlight %}

{% include remember.markdown content="Requesting autoscaling implies the creation of an Horizontal Pod Autoscaler." %}

{% include remember.markdown content="An Horizontal Pod Autoscaler takes precedence over a Replica Set." %}

List the existing Horizontal Pod Autoscalers:
{% highlight shell %}
kubectl get hpa -n jmcf
{% endhighlight %}

{% highlight shell %}
NAME   REFERENCE        TARGETS         MINPODS   MAXPODS   REPLICAS   AGE
ex1    Deployment/ex1   <unknown>/80%   5         10        5          2m57s
{% endhighlight %}

Remove Horizontal Autoscaling:
{% highlight shell %}
kubectl delete hpa/ex1 -n jmcf
{% endhighlight %}

## 🧱 Services

Create a headless (without Cluster IP) Service 
{% highlight shell %}
kubectl create service clusterip my-service --tcp=80:80 --clusterip="None" --dry-run=client -o=yaml > service.yaml
{% endhighlight %}

{% highlight yaml %}
{% include examples/service.yaml %}
{% endhighlight %}

{% include remember.markdown content="A headless Service shall not include any port mapping. The ports exposed are just Pod's containers ports" %}

{% include remember.markdown content="A Service is assigned a DNS name, usually in the form `my-service.namespace.svc.cluster.local`" %}

{% include remember.markdown content="A Service only groups Pods based on matching labels." %}

{% highlight shell %}
kubectl describe -f service.yaml
{% endhighlight %}

{% highlight shell %}
Name:              my-service
Namespace:         jmcf
Labels:            app=ex1
Annotations:       Selector:  app=ex1
Type:              ClusterIP
IP:                None
Port:              80-80  80/TCP
TargetPort:        80/TCP
Endpoints:         172.17.0.47:80,172.17.0.48:80,172.17.0.49:80
Session Affinity:  None
Events:            <none>
{% endhighlight %}

Test that `my-service` has been configured properly:
{% highlight shell %}
kubectl run test1 -it --rm=true --image=busybox --restart=Never -n jmcf -- wget -O - http://my-service.jmcf.svc.cluster.local
{% endhighlight %}

{% include remember.markdown content="`http://my-service` and `http://my-service.jmcf` should work as well." %}

Create a Cluster IP Service

{% highlight shell %}
kubectl create service clusterip my-service --tcp=8080:80 --dry-run=client -o=yaml > service-clusterip.yaml
{% endhighlight %}

{% highlight yaml %}
{% include examples/service-clusterip.yaml %}
{% endhighlight %}

{% include remember.markdown content="`targetPort` (the second element in the `--tcp` parameter) is the Pod's container port." %}

Describe and test

Create Node Port Service



## 🌐 Networking

### Ingress Controllers

### Network Policies


{% include feedback.markdown %}
