---
layout: post
title:  "Deploying datastores for IoT & Big Data: mongoDB on K8s. Secure Replica Set"
description: "This blog post describes how a mongoDB replica set can be deployed and secured on Kubernetes"
date:   2020-11-10 08:00:00 +0200
categories: K8s Kubernetes statefulset mongoDB replica set security IoT Big Data TLS cloud native computing
comments: true 
---

## 🎬 Introduction

This blog post series is intended to give an overview of how datastores capable of supporting high volumes of data from IoT devices and Big Data services can be deployed on Kubernetes. To start with, the [StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) primitive will be used to set up and deploy a [mongoDB Replica Set](). Then, it will demonstrated how other Kubernetes primitives such as [Secret]() can be applied to secure our initial, dummy deployment. An upcoming article will explain how to [shard]() mongoDB. It is assumed that you already have an up and running K8s cluster, such as [minikube](). 

## 📖 StatefulSet Primitive

A StatefulSet is a K8s [Controller](https://kubernetes.io/docs/concepts/architecture/controller/) that manages the deployment and scaling of a set of Pods based on an identical container spec. However, conversely to what happens with [Deployment]() Controllers, these Pods are not interchangeable: each Pod has a persistent identifier that it maintains across any rescheduling.

A StatefulSet shall be associated to a [Service](), to expose its Pods, and to a [PersistentVolumeClaim]() template to gain persistent storage for Pods.  

## Basic Deployment of a mongoDB Replica Set

First of all, a new namespace named `datastores` is created. 

{% highlight shell %}
kubectl create namespace datastores
{% endhighlight %}

Then we need to create the K8s *headless* Service intended to expose our StatefulSet, as follows: 

{% highlight yaml %}
{% include mongo/k8s/examples/mongo-service.yaml %}
{% endhighlight %}

{% include remember.markdown content="Our Service will be bound to Pods labelled as `app: mongoDB-replica`." %}

Also it would be convenient to set up a ConfigMap to support configuration options, for instance the name of our replica set. 

{% highlight yaml %}
{% include mongo/k8s/examples/mongo-config.yaml %}
{% endhighlight %}

Afterwards, the meaty part comes, the declaration of our StatefulSet:

{% highlight yaml %}
{% include mongo/k8s/examples/basic-mongo.yaml %}
{% endhighlight %}

{% include remember.markdown content="We reference the Service created before: `mongo-db-replica`." %}

{% include remember.markdown content="We run containers labelled as `app: mongoDB-replica` in mongoDB's replica set mode." %}

{% include remember.markdown content="We mount a volume `mongo-volume-for-replica` that will be made available through a PersistentVolumeClaim." %}

{% include remember.markdown content="With `volumeClaimTemplates` we define the template of the PersistentVolumeClaims that will automatically be created for each Pod." %}

After applying the manifest shown above this will be the status of our K8s cluster: 

{% highlight shell %}
kubectl get statefulset --namespace=datastores
{% endhighlight %}

{% highlight shell %}
NAME                   READY   AGE
mongo-db-statefulset   3/3     21h
{% endhighlight %}

{% highlight shell %}
kubectl get pods --namespace=datastores --show-labels
{% endhighlight %}

{% highlight shell %}
NAME                     READY   STATUS   LABELS  
mongo-db-statefulset-0   1/1     Running  app=mongoDB-replica
mongo-db-statefulset-1   1/1     Running  app=mongoDB-replica
mongo-db-statefulset-2   1/1     Running  app=mongoDB-replica
{% endhighlight %}

{% highlight shell %}
kubectl describe service --namespace=datastores 
{% endhighlight %}

{% highlight shell %}
Name:              mongo-db-replica
Namespace:         datastores
Labels:            <none>
Annotations:       Selector:  app=mongoDB-replica
Type:              ClusterIP
IP:                None
Port:              <unset>  27017/TCP
TargetPort:        27017/TCP
Endpoints:         172.17.0.14:27017,172.17.0.15:27017,172.17.0.16:27017
{% endhighlight %}

We can observe that three different PersistentVolumeClaims have been created to satisfy the storage demands of our containers: 

{% highlight shell %}
kubectl get pvc --namespace=datastores
{% endhighlight %}

{% highlight shell %}
NAME                                              STATUS   VOLUME                                    
mongo-volume-for-replica-mongo-db-statefulset-0   Bound    pvc-179b1538-0cf6-4440-812e-64dc6de8b1a3
mongo-volume-for-replica-mongo-db-statefulset-1   Bound    pvc-c5c4aeb9-ed79-46a7-a7de-effc244090b6
mongo-volume-for-replica-mongo-db-statefulset-2   Bound    pvc-a7d8196b-ae94-43fd-8b31-2550b36b2997
{% endhighlight %}

We can ping our Pods by name (as they are already bound to the Service named `mongo-db-replica`) as follows:

{% highlight shell %}
kubectl run tm-pod --namespace=datastores -it --image=busybox --restart=Never --rm=true -- ping mongo-db-statefulset-0.mongo-db-replica
{% endhighlight %}

{% highlight shell %}
64 bytes from 172.17.0.14: seq=1 ttl=64 time=0.126 ms
64 bytes from 172.17.0.14: seq=2 ttl=64 time=0.069 ms
{% endhighlight %}

{% include remember.markdown content="Pods pertaining to a StatefulSet are distinguishable and keep their own identity. That's why we can address them by `<pod_id>.<service_name>`." %}

{% include remember.markdown content="The identifier of a Pod pertaining to a StatefulSet is formed by concatenating the name of the StatefulSet (`mongo-db-statefulset`) with a dash (`-`) and the order number (`0`, `1`, `2`, etc.)." %}

## Configuring the mongoDB Replica Set


## Securing our Deployment


## 🖊️ Conclusions

Kubernetes provides powerful primitives to deploy a professional-grade mongoDB datastore service. However, we can go one step further and deploy a sharded mongoDB so that we can scale and give support to IoT and Big Data Applications with further scalability demands. 

{% include feedback.markdown %}
