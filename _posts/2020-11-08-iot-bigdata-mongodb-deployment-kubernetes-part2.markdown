---
layout: post-with-toc
title:  "Deploying datastores for IoT & Big Data: mongoDB on K8s. Part 2"
description: "This blog post describes how a secured mongoDB replica set can be deployed on Kubernetes"
date:   2020-11-08 08:00:00 +0200
categories: K8s Kubernetes statefulset mongoDB replica set security IoT Big Data TLS cloud native computing
comments: true 
---

## 🎬 Introduction

This blog post series is intended to give an overview of how datastores capable of supporting high volumes of data from IoT devices and Big Data services can be deployed on Kubernetes. In the [first part of this series]({% post_url 2020-11-05-iot-big-data-mongodb-deployment-kubernetes-part1 %}), the [StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) primitive has been used to set up and deploy a [mongoDB Replica Set](https://docs.mongodb.com/manual/replication/) (cluster). This part demonstrates how other Kubernetes primitives such as [Secret](https://kubernetes.io/docs/concepts/configuration/secret/) can be applied to secure our initial, dummy deployment. The last article in this series will explain how to [shard](https://docs.mongodb.com/manual/sharding/) a secured mongoDB cluster. It is assumed that you already have an up and running K8s environment, such as [minikube](https://minikube.sigs.k8s.io/docs/start/). 

All the examples have been developed using minikube on macOS Catalina with VirtualBox. 

For part 2 we will be using the `sec-datastores` K8s namespace. The same *headless* Service and ConfigMap that we used on Part 1 need to be created under this namespace. 

## Security Requirements

* The communication between replicas should happen through a secure and trusted channel (TLS).
* The DB shall force clients to authenticate. A user/pass scheme is acceptable.
* The DB clients require to connect to the DB through a secure and trusted channel (TLS). 

## Securing mongoDB Replication

### Generating a key for the Replica Set

The first step to ensure trust between replicas is to define a secret key that will allow replicas to trust each other when receiving replication requests. A new random key (of 756 bits) can be generated and encoded in base64 as follows: 

{% highlight shell %}
openssl rand 756 | base64 > mongo-replica.key
{% endhighlight %}

### Generating a password for the mongoDB root user

We can generate a cryptographically secure password of 16 chars for the root user as follows:

{% highlight shell %}
export LC_CTYPE=C
openssl rand 4096 | tr -cd '[:alnum:];@$#' | head -c 16; echo
{% endhighlight %}

### Creating mongoDB Secret

The root password and the replica key can be stored on a K8s **Secret**. 

{% highlight yaml %}
{% include mongo/k8s/examples/mongo-secret.yaml %}
{% endhighlight %}

{% include remember.markdown content="The Secret data properties will be made available to the mongoDB containers through a mounted **Volume**." %}  

### Securing StatefulSet of Part 1

Our extended StatefulSet manifest would be as follows:

{% highlight yaml %}
{% include mongo/k8s/examples/secured-mongo.yaml %}
{% endhighlight %}

### Fixing the key file permissions problem

However if you apply the manifest above you will find out that unfortunately the Pods will not be running. We can debug what is happening by running

{% highlight shell %}
kubectl logs mongo-db-statefulset-0 -n sec-datastores
{% endhighlight %}

{% highlight shell %}
2020-11-07T18:30:38.656+0000 I  ACCESS   [main] permissions on /var/secrets/replica.key are too open{% endhighlight %}

{% highlight yaml %}
{% include mongo/k8s/examples/secured-mongo.yaml %}
{% endhighlight %}

Although, initially you could think that the problem can be fixed by using the `defaultMode` field of the Secret Volume declaration, it cannot (as of K8s 1.18 and mongoDB 4.2.6). There is another solution which implies running an initialization container that just copies the required files with the proper permissions to a new Volume. 

{% highlight yaml %}
{% include mongo/k8s/examples/secured-mongo-2.yaml %}
{% endhighlight %}

## Setting up the TLS layer


### Create a CSR to be signed by the K8s CA


### Extending StatefulSet to support TLS


## 🖊️ Conclusions

Kubernetes provides powerful primitives to deploy a clustered mongoDB datastore service. Furthermore, we can deploy a secured and sharded mongoDB so that we can give production-grade support to IoT and Big Data Applications which demand higher scalability. 

{% include feedback.markdown %}
