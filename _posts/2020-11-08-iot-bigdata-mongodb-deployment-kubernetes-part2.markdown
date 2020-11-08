---
layout: post-with-toc
title:  "Deploying datastores for IoT & Big Data: mongoDB on K8s. Part 2"
description: "This blog post describes how a secured mongoDB replica set can be deployed on Kubernetes"
date:   2020-11-08 08:00:00 +0200
categories: K8s Kubernetes statefulset mongoDB replica set security IoT Big Data TLS cloud native computing
comments: true 
---

## 🎬 Introduction

This blog post series is intended to give an overview of how datastores capable of supporting high volumes of data from IoT devices and Big Data services can be deployed on Kubernetes. In the [first part of this series]({% post_url 2020-11-05-iot-bigdata-mongodb-deployment-kubernetes-part1 %}), the [StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) primitive has been used to set up and deploy a [mongoDB Replica Set](https://docs.mongodb.com/manual/replication/) (cluster). This part, part 2, demonstrates how other Kubernetes primitives such as [Secret](https://kubernetes.io/docs/concepts/configuration/secret/) can be applied to secure our initial, dummy deployment. Upcoming articles in this series will explain how to [shard](https://docs.mongodb.com/manual/sharding/) and further secure our mongoDB cluster. 

### Prerequisites

It is assumed that you already have an up and running K8s environment, such as [minikube](https://minikube.sigs.k8s.io/docs/start/). All the examples have been developed using minikube on macOS Catalina with VirtualBox. 

For part 2 we will be using the `sec-datastores` K8s namespace. The same *headless* [Service](https://github.com/jmcanterafonseca/jmcanterafonseca.github.io/blob/master/_includes/mongo/k8s/examples/mongo-service.yaml) and [ConfigMap](https://github.com/jmcanterafonseca/jmcanterafonseca.github.io/blob/master/_includes/mongo/k8s/examples/mongo-config.yaml) that we used on Part 1 need to be created under this namespace. 

## Security Requirements

The following requirements are under the scope of this series part:

* The communication between replicas must be authenticated.
* DB clients must be authenticated. A user/pass scheme is acceptable.
* DB clients must connect to the DB through a secure and trusted channel (TLS). 

The following requirements are not under scope but might be developed in future parts of this series:

* The communication between replicas must take place through an authenticated channel based on TLS.
* The communication between the DB and DB clients must be through mutual-TLS.

## 🏰 Securing mongoDB Replication

### Generating a key for the Replica Set

The first step to ensure authentication of the replicas is to define a **secret replica key** to be presented to each other when submitting replication deltas. A new random key (of `1024` characters) can be generated and encoded in base64 as follows: 

{% highlight shell %}
openssl rand 756 | base64
{% endhighlight %}

{% highlight shell %}
T3VTeVZHL1EJwllZVaCjhSqtqapViaFGK5vifxWyshnBXdDBP8SqHFz/ .... 
{% endhighlight %}

### Generating a password for the mongoDB root user

We can generate a cryptographically secure password of `16` chars for the root user as follows:

{% highlight shell %}
export LC_CTYPE=C
openssl rand 4096 | tr -cd '[:alnum:];@$#' | head -c 16; echo
{% endhighlight %}

{% highlight shell %}
Lqyr8CvuWsuoSFCN
{% endhighlight %}

### Creating K8s Secret for mongoDB

The password of the root user (`jmcf`) and the replica key shall be stored on a K8s **Secret**. 

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

However if you apply the K8s manifest above you will find out that unfortunately the Pods will not be running. We can debug what is happening by running:

{% highlight shell %}
kubectl logs mongo-db-statefulset-0 -n sec-datastores
{% endhighlight %}

{% highlight shell %}
2020-11-07T18:30:38.656+0000 I  ACCESS   [main] permissions on /var/secrets/replica.key are too open 
{% endhighlight %}

Although, initially you could think that the permissions problem can be fixed by using the `defaultMode` field of the Secret Volume declaration, it cannot (as of K8s `1.18` and mongoDB `4.2.6`). There is another solution which implies running a Pod's initialization container that just copies the required files with the proper permissions to a new Volume that will be the one actually consumed by the mongoDB container. 

{% highlight yaml %}
{% include mongo/k8s/examples/secured-mongo-2.yaml %}
{% endhighlight %}

{% include remember.markdown content="The Volumes are shared by all containers pertaining to the Pod: the init container (based on `busybox`), named `set-file-permissions` and the mongoDB container, named `mongo-db`." %}

{% include remember.markdown content="The lifetime of the final volume containing secrets, `secret-volume`,  will be the Pod's lifetime." %}

{% include remember.markdown content="Once the initialization command completes, the init container will die. In case of failure, the logs of the init container can be obtained using the `-container` option of `kubectl logs`." %}

### Configuring the mongoDB Replica Set

The next step is connecting to our cluster through the mongoDB shell and configure the Replica Set. Now we need to make use of the root user (`jmcf`) and pass previously configured as env vars. 

{% highlight shell %}
kubectl run tm-mongo-pod --namespace=sec-datastores -it --image=mongo:4.2.6 --restart=Never --rm=true -- mongo -u jmcf -p Lqyr8CvuWsuoSFCN mongo-db-statefulset-0.mongo-db-replica/admin
{% endhighlight %}

{% include remember.markdown content="So far we have not configured TLS so our DB connection will be through an insecure channel." %}

After checking that we can make an authenticated connection we can execute the [Replica Set configuration script](https://github.com/jmcanterafonseca/jmcanterafonseca.github.io/blob/master/_includes/mongo/k8s/examples/configure-replicaset.js) and check that our [replication is working properly](https://github.com/jmcanterafonseca/jmcanterafonseca.github.io/blob/master/_includes/mongo/k8s/examples/db-operations.js) using the replica key provided. Now we are ensuring that the members of our Replica Set can only receive data from parties that know their shared secret (the replica key). 

## 🔒 Setting up the TLS layer

In order to meet our initial requirements, a TLS layer has to be set up. In this part DB only clients must connect through TLS to the DB. In future parts we will show how replicas of the mongoDB cluster could also use mutual TLS to authenticate. 

### Create a CSR to be signed by the K8s CA

The first step is to generate a new RSA private key (`2048` bits) as follows:

{% highlight shell %}
openssl genrsa -out mongo.key.pem 2048
{% endhighlight %}

Once we have our private key we need to generate a new Certificate. An interesting approach is to generate a Certificate signed by the Kubernetes CA itself, as that is a CA known by all Pods through their default Service Account. 

First of all we need to generate a new Certificate Signing Request (CSR) for the private key generated above:

{% highlight shell %}
openssl req -new -out mongo.csr -key mongo.key.pem -config ./openssl.conf
{% endhighlight %}

The [openssl.conf]() file is needed as the CSR need to be generated using an extended feature named [SAN](http://apetec.com/support/GenerateSAN-CSR.htm) (Subject Alternative Names) that allows one certificate to be associated to more than one DNS name, which is what we just need for our three different mongoDB replicas. 

We can inspect the content of our CSR as follows:

{% highlight shell %}
openssl req -in mongo.csr -noout -text
{% endhighlight %}

Afterwards we can generate our certificate signed by the minikube CA (you can find the CA's certificate at `$HOME/.minikube/ca.crt`). However we can sign it through a standard K8s manifest for Certificate Signing Requests:

{% highlight yaml %}
{% include mongo/k8s/examples/csr.yaml %}
{% endhighlight %}

{% highlight shell %}
kubectl apply -f csr.yaml
{% endhighlight %}

{% highlight shell %}
kubectl get csr
{% endhighlight %}

{% highlight shell %}
NAME        AGE   SIGNERNAME                     REQUESTOR       CONDITION
mongo-csr   16s   kubernetes.io/legacy-unknown   minikube-user   Pending
{% endhighlight %}

We can approve the CSR as follows:

{% highlight shell %}
kubectl certificate approve mongo-csr
{% endhighlight %}

After the certificate has been approved we need to download it as follows: 

{% highlight shell %}
kubectl get csr/mongo-csr -o jsonpath='{.status.certificate}{"\n"}' | base64 -d > mongo.crt
{% endhighlight %}

We can inspect the contents of our brand new certificate as follows:

{% highlight shell %}
openssl x509 -in mongo.crt -noout -text
{% endhighlight %}

Now we have all we need to set up TLS for our mongoDB cluster! 

### Extending StatefulSet to support TLS

First of all we need to extend our Secret to include the private key and the certificate. mongoDB requires both to be concatenated on the same file: 

{% highlight shell %}
cat mongo.key.pem mongo.crt >> mongo.keycert
cat mongo.keycert | base64
{% endhighlight %}

We add the keycert file content as a base64-encoded Secret property: 

{% highlight yaml %}
{% include mongo/k8s/examples/mongo-secret-tls.yaml %}
{% endhighlight %}

We can double-check that our keycert has been properly stored as a K8s secret:

{% highlight shell %}
kubectl get secret mongo-secret -o jsonpath="{.data['tls\.keycert']}" -n sec-datastores | base64 -d
{% endhighlight %}

Assuming that Secrets are stored in Base64 format in the Secret store which should not happen in a production environment!!. 

And now we need to extend our StatefulSet definition to provide the different TLS parameters: 

{% highlight yaml %}
{% include mongo/k8s/examples/secured-mongo-tls.yaml %}
{% endhighlight %}

### Connecting to the Cluster through TLS

We can connect to the cluster through TLS as follows: 

{% highlight shell %}
 kubectl run tm-mongo-pod --namespace=sec-datastores -it --image=mongo:4.2.6 --restart=Never --rm=true -- mongo --verbose --tls --tlsCAFile /var/run/secrets/kubernetes.io/serviceaccount/ca.crt  -u jmcf -p Lqyr8CvuWsuoSFCN mongo-db-statefulset-0.mongo-db-replica.sec-datastores.svc.cluster.local/admin
{% endhighlight %}

## 🖊️ Conclusions

Kubernetes provides powerful primitives to deploy a clustered mongoDB datastore service. Furthermore, we can deploy a secured and sharded mongoDB so that we can give production-grade support to IoT and Big Data Applications which demand higher scalability. 

{% include feedback.markdown %}
