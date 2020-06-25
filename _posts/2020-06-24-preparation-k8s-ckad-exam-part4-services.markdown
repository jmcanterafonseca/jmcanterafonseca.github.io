---
layout: post-with-toc
title:  "CKAD Exam Preparation 4/4 - Deployments, Services and Networking"
date:   2020-06-24 08:00:00 +0200
categories: Kubernetes Certification Application Developer CNCF K8s Cloud Native Computing CKAD Linux Foundation deployments services
feedback: "https://github.com/jmcanterafonseca/jmcanterafonseca.github.io/issues/4"
---

## Introduction

This part outlines the key networking aspects of the CKAD Exam Curriculum. To learn more about the CKAD exam please read this [overview]({% post_url 2020-06-25-preparation-k8s-ckad-exam-overview %}).

{% include K8s/series.markdown %}

## 🖥️ Deployments

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

{% include see-also.markdown content="https://kubernetes.io/docs/concepts/services-networking/service" %}

### Headless Service

Create a headless (without Cluster IP) Service 
{% highlight shell %}
kubectl create service clusterip my-service --tcp=80:80 --clusterip="None" --dry-run=client -o=yaml > service.yaml
{% endhighlight %}

{% highlight yaml %}
{% include examples/service.yaml %}
{% endhighlight %}

{% include remember.markdown content="The name of a Service object must be a valid DNS label name." %}

{% include remember.markdown content="The ports exposed under a headless Service are just Pod's container(s) ports" %}

{% include remember.markdown content="A Service is assigned a DNS name, usually in the form `<service-name>.<namespace>.svc.cluster.local`" %}

{% include remember.markdown content="A Service groups Pods based on matching labels." %}

{% highlight shell %}
kubectl describe service my-service -n jmcf
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
kubectl run test1 -it --rm=true --image=busybox --restart=Never -n jmcf -- wget -O - http://my-service
kubectl run test1 -it --rm=true --image=busybox --restart=Never -n jmcf -- wget -O - http://my-service.jmcf
kubectl run test1 -it --rm=true --image=busybox --restart=Never -n jmcf -- wget -O - http://my-service.jmcf.svc.cluster.local
{% endhighlight %}

### Cluster IP Service

Create a Cluster IP Service

{% highlight shell %}
kubectl create service clusterip my-service --tcp=8080:80 --dry-run=client -o=yaml > service-clusterip.yaml
{% endhighlight %}

{% highlight yaml %}
{% include examples/service-clusterip.yaml %}
{% endhighlight %}

{% include remember.markdown content="`targetPort` (the second element in the `--tcp` parameter) is the Pod's container port." %}

{% highlight shell %}
kubectl describe service my-service-cip -n jmcf
{% endhighlight %}

{% highlight shell %}
Name:              my-service-cip
Namespace:         jmcf
Labels:            app=ex1
Annotations:       Selector:  app=ex1
Type:              ClusterIP
IP:                10.96.72.170
Port:              8080-80  8080/TCP
TargetPort:        80/TCP
Endpoints:         172.17.0.47:80,172.17.0.48:80,172.17.0.49:80
Session Affinity:  None
Events:            <none>
{% endhighlight %}

Test that the Cluster IP has been assigned properly:
{% highlight shell %}
kubectl run test1 -it --rm=true --image=busybox --restart=Never -n jmcf -- wget -O - http://10.96.72.170:8080
kubectl run test1 -it --rm=true --image=busybox --restart=Never -n jmcf -- wget -O - http://my-service-cip:8080
kubectl run test1 -it --rm=true --image=busybox --restart=Never -n jmcf -- wget -O - http://my-service-cip.jmcf:8080
kubectl run test1 -it --rm=true --image=busybox --restart=Never -n jmcf -- wget -O - http://my-service-cip.jmcf.svc.cluster.local:8080
{% endhighlight %}

### Node Port Service

Create Node Port Service

{% highlight shell %}
kubectl create service nodeport my-service-np --tcp=8080:80 --dry-run=client -o=yaml > service-nodeport.yaml
{% endhighlight %}

{% highlight yaml %}
{% include examples/service-nodeport.yaml %}
{% endhighlight %}

{% highlight shell %}
kubectl describe service my-service-np -n jmcf
{% endhighlight %}

{% highlight shell %}
Name:                     my-service-np
Namespace:                jmcf
Labels:                   app=ex1
Annotations:              Selector:  app=ex1
Type:                     NodePort
IP:                       10.106.215.220
Port:                     8080-80  8080/TCP
TargetPort:               80/TCP
NodePort:                 8080-80  31460/TCP
Endpoints:                172.17.0.47:80,172.17.0.48:80,172.17.0.49:80
Session Affinity:         None
External Traffic Policy:  Cluster
Events:                   <none>
{% endhighlight %}

Test that the Node Port has been assigned properly:
{% highlight shell %}
wget -O - http://192.168.99.101:31460
kubectl run test1 -it --rm=true --image=busybox --restart=Never -n jmcf -- wget -O - http://10.106.215.220:8080
kubectl run test1 -it --rm=true --image=busybox --restart=Never -n jmcf -- wget -O - http://my-service-np:8080
kubectl run test1 -it --rm=true --image=busybox --restart=Never -n jmcf -- wget -O - http://my-service-np.jmcf:8080
kubectl run test1 -it --rm=true --image=busybox --restart=Never -n jmcf -- wget -O - http://my-service-np.jmcf.svc.cluster.local:8080
kubectl run test1 -it --rm=true --image=busybox --restart=Never -n jmcf -- wget -O - http://172.17.0.47
{% endhighlight %}

## 🌐 Networking

### Ingress

{% include see-also.markdown content="https://kubernetes.io/docs/concepts/services-networking/ingress/" %}

{% include remember.markdown content="Ingress exposes HTTP and HTTPS routes from outside the cluster to services within the cluster." %}

{% include remember.markdown content="You must have an **ingress controller** to satisfy an Ingress. Only creating an `Ingress` resource has no effect." %}

An Ingress which enables reverse proxying to your Service from a canonical address:

{% highlight yaml %}
{% include examples/ingress.yaml %}
{% endhighlight %}

Then you can get access to your Service through (provided external DNS entry or `etc/hosts` has been set up):
{% highlight shell %}
curl http://ckad.example.org/ex1
{% endhighlight %}

{% include remember.markdown content="The annotation `nginx.ingress.kubernetes.io/rewrite-target: /` enables reverse proxying." %}


### Network Policies

{% include see-also.markdown content="https://kubernetes.io/docs/concepts/services-networking/network-policies/" %}

{% include remember.markdown content="To use network policies, you must be using a networking solution which supports NetworkPolicy. Creating a `NetworkPolicy` resource without a controller that implements it will have no effect." %}

Define a Network Policy that allows to talk to, our previously defined, `ex1` Pods only from containers belonging to the `jmcf` Namespace which are labeled as `role=test`.

{% highlight shell %}
kubectl label namespace jmcf 'project=ckad'
{% endhighlight %}

{% include remember.markdown content="Namespace selector needs matching labels." %}

{% highlight yaml %}
{% include examples/network-policy.yaml %}
{% endhighlight %}

{% highlight shell %}
kubectl describe NetworkPolicy test-network-policy -n jmcf
{% endhighlight %}

{% highlight shell %}
Name:         test-network-policy
Namespace:    jmcf
Created on:   2020-06-25 14:03:55 +0200 CEST
Labels:       <none>
Annotations:  Spec:
  PodSelector:     app=ex1
  Allowing ingress traffic:
    To Port: 80/TCP
    From:
      NamespaceSelector: project=ckad
    From:
      PodSelector: role=test
  Not affecting egress traffic
  Policy Types: Ingress
{% endhighlight %}

{% include remember.markdown content="A Network Policy defines **white lists** for ingress traffic, egress traffic or both." %}

{% include remember.markdown content="A Network Policy applies to certain Pods (those matching labels) in a Namespace." %}

{% include remember.markdown content="A Network Policy ingress or egress rules determines from or to which Pods and/or Namespaces
traffic is allowed." %}

{% include remember.markdown content="If you declare `Ingress` or `Egress` policy types (under `policyTypes`), and no rule is provided under that category then no traffic of such category will be allowed." %}

{% include feedback.markdown %}
