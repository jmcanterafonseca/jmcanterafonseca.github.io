---
layout: post-with-toc
title:  "Deploying datastores for IoT & Big Data: mongoDB on K8s. Part 2"
description: "This blog post describes how a secured mongoDB replica set can be deployed on Kubernetes"
date:   2020-11-08 08:00:00 +0200
categories: K8s Kubernetes statefulset mongoDB replica set security IoT Big Data TLS cloud native computing
comments: true 
---

## 🎬 Introduction

This blog post series is intended to give an overview of how datastores capable of supporting high volumes of data from IoT devices and Big Data services can be deployed on Kubernetes. In the [first part of this series]({% post_url 2020-11-05-iot-bigdata-mongodb-deployment-kubernetes-part1 %}), the [StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) primitive has been used to set up and deploy a [mongoDB Replica Set](https://docs.mongodb.com/manual/replication/) (cluster). This part, part 2, demonstrates how other Kubernetes primitives such as [Secret](https://kubernetes.io/docs/concepts/configuration/secret/) can be applied to secure our initial, dummy deployment. The last article in this series will explain how to [shard](https://docs.mongodb.com/manual/sharding/) a secured mongoDB cluster. It is assumed that you already have an up and running K8s environment, such as [minikube](https://minikube.sigs.k8s.io/docs/start/). 

All the examples have been developed using minikube on macOS Catalina with VirtualBox. 

For part 2 we will be using the `sec-datastores` K8s namespace. The same *headless* [Service](https://github.com/jmcanterafonseca/jmcanterafonseca.github.io/blob/master/_includes/mongo/k8s/examples/mongo-service.yaml) and [ConfigMap](https://github.com/jmcanterafonseca/jmcanterafonseca.github.io/blob/master/_includes/mongo/k8s/examples/mongo-config.yaml) that we used on Part 1 need to be created under this namespace. 

## Security Requirements

* The communication between replicas must happen through a secure and trusted channel (TLS).
* The DB must force clients to authenticate. A user/pass scheme is acceptable.
* The DB clients must connect to the DB through a secure and trusted channel (TLS). 

## Securing mongoDB Replication

### Generating a key for the Replica Set

The first step to ensure trust between replicas is to define a secret key that will allow to trust each other when receiving replication requests. A new random key (of 756 bits) can be generated and encoded in base64 as follows: 

{% highlight shell %}
openssl rand 756 | base64
{% endhighlight %}

{% highlight shell %}
T3VTeVZHL1EJwllZVaCjhSqtqapViaFGK5vifxWyshnBXdDBP8SqHFz/ .... 
{% endhighlight %}

### Generating a password for the mongoDB root user

We can generate a cryptographically secure password of 16 chars for the root user as follows:

{% highlight shell %}
export LC_CTYPE=C
openssl rand 4096 | tr -cd '[:alnum:];@$#' | head -c 16; echo
{% endhighlight %}

{% highlight shell %}
Lqyr8CvuWsuoSFCN
{% endhighlight %}

### Creating K8s Secret for mongoDB

The password of the root user and the replica key shall be stored on a K8s **Secret**. 

{% highlight yaml %}
{% include mongo/k8s/examples/mongo-secret.yaml %}
{% endhighlight %}

{% include remember.markdown content="The Secret data properties will be made available to the mongoDB containers through a mounted **Volume**." %}  

### Securing StatefulSet of Part 1

In part 1 we defined an [initial version](https://github.com/jmcanterafonseca/jmcanterafonseca.github.io/blob/master/_includes/mongo/k8s/examples/basic-mongo.yaml) of our StatefulSet that can be extended as follows:

{% highlight yaml %}
{% include mongo/k8s/examples/secured-mongo.yaml %}
{% endhighlight %}

### Fixing the key file permissions problem

However if you apply the manifest above you will find out that unfortunately the Pods will not be running. We can debug what is happening by running

{% highlight shell %}
kubectl logs mongo-db-statefulset-0 -n sec-datastores
{% endhighlight %}

{% highlight shell %}
2020-11-07T18:30:38.656+0000 I  ACCESS   [main] permissions on /var/secrets/replica.key are too open 
{% endhighlight %}

Although, initially you could think that the permissions problem can be fixed by using the `defaultMode` field of the Secret Volume declaration, it cannot (as of K8s 1.18 and mongoDB 4.2.6). There is another solution which implies running a Pod's initialization container that just copies the required files with the proper permissions to a new Volume that will be the one actually consumed by the mongoDB container. 

{% highlight yaml %}
{% include mongo/k8s/examples/secured-mongo-2.yaml %}
{% endhighlight %}

{% include remember.markdown content="The Volumes are shared by all containers pertaining to the Pod: the initContainer (`set-file-permissions`) and the mongoDB container (`mongo-db`)." %}

{% include remember.markdown content="The lifetime of the final volume containing secrets, `secret-volume`,  will be the Pod's lifetime." %}

{% include remember.markdown content="Once the initialization command completes, the init container will die. In case of failure, the logs of the init container can be obtained using the `-container` option of `kubectl logs`." %}

### Configuring the mongoDB Replica Set

The next step is connecting to our cluster through the mongoDB shell and configure the Replica Set. Now we need to make use of the root user and pass previously configured as env vars. 

{% highlight shell %}
kubectl run tm-mongo-pod --namespace=sec-datastores -it --image=mongo:4.2.6 --restart=Never --rm=true -- mongo -u jmcf -p Lqyr8CvuWsuoSFCN mongo-db-statefulset-0.mongo-db-replica/admin
{% endhighlight %}

{% include remember.markdown content="So far we have not configured TLS so our DB connection will be through an insecure channel." %}

After checking that we can make an authenticated connection we can execute the [Replica Set configuration script](https://github.com/jmcanterafonseca/jmcanterafonseca.github.io/blob/master/_includes/mongo/k8s/examples/configure-replicaset.js) and check that our [replication is working properly](https://github.com/jmcanterafonseca/jmcanterafonseca.github.io/blob/master/_includes/mongo/k8s/examples/db-operations.js) using the replica key provided. Now we are ensuring that the members of our Replica Set can only receive data from parties that know the shared secret (the replica key). 

## Setting up the TLS layer

### Create a CSR to be signed by the K8s CA


### Extending StatefulSet to support TLS


## 🖊️ Conclusions

Kubernetes provides powerful primitives to deploy a clustered mongoDB datastore service. Furthermore, we can deploy a secured and sharded mongoDB so that we can give production-grade support to IoT and Big Data Applications which demand higher scalability. 

{% include feedback.markdown %}
