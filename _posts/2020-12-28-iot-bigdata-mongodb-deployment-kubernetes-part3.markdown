---
layout: post-with-toc
title:  "Deploying datastores for IoT & Big Data: mongoDB on K8s. Part 3"
description: "This blog post describes how a mongoDB shard can be deployed on Kubernetes"
date:   2020-12-28 08:00:00 +0200
categories: K8s Kubernetes statefulset mongoDB replica set security IoT Big Data TLS cloud native computing sharding
comments: true 
---
 

## 🎬 Introduction

This blog post series is intended to give an overview of how datastores capable of supporting high volumes of data from IoT devices and Big Data services can be deployed on Kubernetes. In the [first part of this series]({% post_url 2020-11-05-iot-bigdata-mongodb-deployment-kubernetes-part1 %}), the [StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) primitive has been used to set up and deploy a [mongoDB Replica Set](https://docs.mongodb.com/manual/replication/) (cluster). In the [second part]({% post_url 2020-11-05-iot-bigdata-mongodb-deployment-kubernetes-part2 %}) it has been demonstrated how other Kubernetes primitives such as [Secret](https://kubernetes.io/docs/concepts/configuration/secret/) can be applied to secure our initial, dummy deployment. This article of the series explains how to further secure (enabling client and member mutual TLS authentication based on x509 Certificates) and to [shard](https://docs.mongodb.com/manual/sharding/) our mongoDB Cluster. 

### Prerequisites

It is assumed that you already have an up and running K8s environment, such as [minikube](https://minikube.sigs.k8s.io/docs/start/). 
All the examples have been developed using minikube on macOS Catalina with VirtualBox. 

First of all, a new, clean namespace named `shard` has to be created to develop this part. 

{% highlight shell %}
kubectl create namespace shard
{% endhighlight %}

## 📖 Enabling client and member authentication based on x509 certificates

Our objective at thi stage is to deploy a mongoDB Replica Set with client and member authentication based on x509 certificates. This Replica Set will be later part of our final sharded mongoDB. 

After completing successfully these steps you will only be able to get access to the mongoDB cluster by presenting the proper client certificates and associated secret keys (i.e. no insecure user/pass anymore) packaged as "keycert" files. 

### Certificate Generation

First of all we need to generate the following certificates:

* One certificate for cluster server TLS. [Already generated]() in part 2 of this series. 
* For each member of the Replica Set, one certificate for internal member authentication.
* One certificate for client authentication. We will need as much certificates as clients our database is going to have. 

For generating our certificates the steps already explained [here]() have to be followed:

* Generate a private key
* Generate a certificate signing request. At this step the most important detail is the x509 DN (Distinguished Name) that will be the certificate's subject. The DNs that I have used for my deployment are:

* `CN=mongo-db-statefulset-sh1-0.mongo-db-replica-sh1.sharding,OU=Software,O=CanteraFonseca,C=ES` for the first member of the Replica Set. 
* `CN=mongo-db-statefulset-sh1-1.mongo-db-replica-sh1.sharding,OU=Software,O=CanteraFonseca,C=ES` for the second member of the Replica Set. 
* `CN=mongo-db-statefulset-sh1-1.mongo-db-replica-sh1.sharding,OU=Software,O=CanteraFonseca,C=ES` for the third member of the Replica Set. 
* `CN=App1,OU=Applications,O=CanteraFonseca,C=ES` for the database client to be used for testing.

* As we are going to use the Kubernetes cluster CA to sign our certificates, for each certificate a new certificate signing request K8s manifest has to be generated and approved as explained [here](). Each certificate has to be retrieved, saved (in PEM format) and finally concatenated with its corresponding private key to create a "certkey" file. So in the end we will have 3 certkey files (one for each Replica Set member), 1 certkey file corresponding to our database testing client and the certkey file we generated in part 2 corresponding to the server TLS certificate of the whole cluster:

* `mongo.cluster.0.keycert`
* `mongo.cluster.1.keycert`
* `mongo.cluster.2.keycert`
* `client.keycert`
* `mongo.ext.keycert`

### Bootstrapping the mongoDB statefulset

Unfortunately when it comes to certificate-based authentication mongoDB does not provide a deployment mechanism in one step. Thus, we need to perform a two step process. In the first step, bootstrapping step, we will run a mongoDB cluster which does not have authentication enabled (as we explained in [part 1]()). After configuring the cluster we will reapply our K8s manifest to set up the final configuration with certificate-based authentication enabled. 

For bootstrapping purposes we can use the following K8s manifest as explained in [part 1](). 

{% highlight yaml %}
{% include mongo/k8s/examples/sharding/bootstrap-mongo.yaml %}
{% endhighlight %}

You will need to create the corresponding K8s [Service]() and [ConfigMap]() as explained in [part 1](). 

After the successful deployment of the statefulset you will need to [set up the replica set](). 

### Running our final statefulset

{% highlight yaml %}
{% include mongo/k8s/examples/sharding/secured-mongo-sh1.yaml %}
{% endhighlight %}


{% highlight yaml %}
{% include mongo/k8s/examples/sharding/secured-mongo-sh1.yaml %}
{% endhighlight %}


### Testing our statefulset

kubectl run tm-mongo-pod --image=mongo:4.2.6 --rm=true -it --restart=Never --namespace=sharding --overrides="$(cat mongo-client.json)"

## 📖 Sharded mongoDB



## 🖊️ Conclusions

Kubernetes provides powerful primitives to deploy a clustered mongoDB datastore service. Furthermore, we can deploy a secured and sharded mongoDB so that we can give production-grade support to IoT and Big Data Applications which demand higher scalability. 

{% include feedback.markdown %}
