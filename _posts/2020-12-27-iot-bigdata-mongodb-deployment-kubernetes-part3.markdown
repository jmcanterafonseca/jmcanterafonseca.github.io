---
layout: post-with-toc
title:  "Deploying datastores for IoT & Big Data: mongoDB on K8s. Part 3"
description: "This blog post describes how an authenticated mongoDB shard can be deployed on Kubernetes"
date:   2020-12-27 08:00:00 +0200
categories: K8s Kubernetes statefulset mongoDB replica set security IoT Big Data TLS cloud native computing sharding x509 authentication client member
comments: true 
---
 

## 🎬 Introduction

This blog post series is intended to give an overview of how datastores capable of supporting high volumes of data from IoT devices and Big Data services can be deployed on Kubernetes. In the [first part of this series]({% post_url 2020-11-05-iot-bigdata-mongodb-deployment-kubernetes-part1 %}), the [StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) primitive has been used to set up and deploy a [mongoDB Replica Set](https://docs.mongodb.com/manual/replication/) (cluster). In the [second part]({% post_url 2020-11-08-iot-bigdata-mongodb-deployment-kubernetes-part2 %}) it has been demonstrated how other Kubernetes primitives such as [Secret](https://kubernetes.io/docs/concepts/configuration/secret/) can be applied to secure our initial, dummy deployment. This article of the series explains how to further secure (by enabling client and member mutual TLS authentication based on x509 certificates) and to [shard](https://docs.mongodb.com/manual/sharding/) our mongoDB Cluster. 

### Prerequisites

It is assumed that you already have an up and running K8s environment, such as [minikube](https://minikube.sigs.k8s.io/docs/start/). 
All the examples have been developed using minikube on macOS Catalina with VirtualBox. 

First of all, a new, clean namespace named `shard` has to be created to develop this part. 

{% highlight shell %}
kubectl create namespace shard
{% endhighlight %}

## 📖 Enabling client and member authentication based on x509 certificates

Our objective at this stage is to deploy a mongoDB Replica Set with client and member authentication based on x509 certificates. This Replica Set will be later part of our final mongoDB shard. 

After completing successfully these steps, it will only be possible to get access to the mongoDB cluster by presenting the proper client certificates and associated secret keys (i.e. no insecure user/pass anymore) packaged as "keycert" files. 

### Certificate Generation

First of all the following certificates have to be generated:

* One certificate for cluster server TLS. [Already generated]({% post_url 2020-11-08-iot-bigdata-mongodb-deployment-kubernetes-part2 %}#-setting-up-the-tls-layer) in part 2 of this series. 
* For each member of the Replica Set, one certificate for internal member authentication.
* One certificate for client authentication. It will be needed as much certificates as clients our database is going to have. 

For generating our certificates the steps already explained [here]({% post_url 2020-11-08-iot-bigdata-mongodb-deployment-kubernetes-part2 %}#-setting-up-the-tls-layer) have to be followed:

* Generate a private key
* Generate a certificate signing request. At this step the most important point is the x509 DN (Distinguished Name) that will be the certificate's subject. For instance, the DNs that have been used for my deployment are:

  * `CN=mongo-db-statefulset-sh1-0.mongo-db-replica-sh1.sharding,OU=Software,O=CanteraFonseca,C=ES` for the first member of the Replica Set. 
  * `CN=mongo-db-statefulset-sh1-1.mongo-db-replica-sh1.sharding,OU=Software,O=CanteraFonseca,C=ES` for the second member of the Replica Set. 
  * `CN=mongo-db-statefulset-sh1-2.mongo-db-replica-sh1.sharding,OU=Software,O=CanteraFonseca,C=ES` for the third member of the Replica Set. 

  * `CN=App1,OU=Applications,O=CanteraFonseca,C=ES` for the database client to be used for testing.

* As the Kubernetes cluster CA is being used to sign our certificates, for each certificate a new certificate signing request K8s manifest has to be generated and approved as explained [here]({% post_url 2020-11-08-iot-bigdata-mongodb-deployment-kubernetes-part2 %}#-setting-up-the-tls-layer). Each certificate has to be retrieved, saved (in PEM format) and finally concatenated with its corresponding private key to create a "keycert" file. 

Thus, in the end we will have:

* 3 "keycert" files (one for each Replica Set member):

  * `mongo.cluster.0.keycert`
  * `mongo.cluster.1.keycert`
  * `mongo.cluster.2.keycert`

* 1 "keycert" file corresponding to our database testing client:

  * `client.keycert`

* the "keycert" file we already generated in part 2 corresponding to the server TLS certificate of the whole cluster:

  * `mongo.ext.keycert`

### Bootstrapping the mongoDB statefulset

Unfortunately when it comes to certificate-based authentication mongoDB does not provide a deployment mechanism in one step. Thus, it is needed to perform a two step process. In the first step, bootstrapping step, a mongoDB cluster with no authentication will be run (as we explained in [part 1]({% post_url 2020-11-05-iot-bigdata-mongodb-deployment-kubernetes-part1 %})). After configuring the cluster, in the second step, our K8s manifest will be reapplied  to set up the final configuration with certificate-based authentication enabled. 

For bootstrapping the following steps have to be taken as explained in [part 1]({% post_url 2020-11-05-iot-bigdata-mongodb-deployment-kubernetes-part1 %}#%EF%B8%8F-basic-deployment-of-a-mongodb-replica-set):

* Apply the [Service](https://github.com/jmcanterafonseca/jmcanterafonseca.github.io/blob/master/_includes/mongo/k8s/examples/sharding/mongo-service-sh1.yaml) and [ConfigMap](https://github.com/jmcanterafonseca/jmcanterafonseca.github.io/blob/master/_includes/mongo/k8s/examples/sharding/mongo-config-sh1.yaml)
* Apply the manifest below

{% highlight yaml %}
{% include mongo/k8s/examples/sharding/bootstrap-mongo.yaml %}
{% endhighlight %}

After the successful deployment of the statefulset above, the next step is to [set up the replica set]({% post_url 2020-11-05-iot-bigdata-mongodb-deployment-kubernetes-part1 %}#configuring-the-mongodb-replica-set) using this [script](https://github.com/jmcanterafonseca/jmcanterafonseca.github.io/blob/master/_includes/mongo/k8s/examples/sharding/configure-replicaset.js). Once the Replica Set has been set up, the cluster users as per the DNs already defined when certificates were generated have to be created (from the mongo client console) as follows:

{% highlight javascript %}
{% include mongo/k8s/examples/sharding/add-users.js %}
{% endhighlight %}

{% include remember.markdown content="The command above has to issued against the mongoDB Replica Set member marked as `PRIMARY`." %}

In this case we are creating 4 users under the `$external` database: 

* The user corresponding to our initial testing client which is assigned some admin roles and it is granted explicitly permissions over the `test` database.
* One user for each of the Replica Set members. These users are granted a system role. 

Now everything is ready to switch our initial bootstrap to a fully authenticated cluster. 

### Running our final statefulset

After performing the initial bootstrapping we can switch to an authenticated set up as follows:

First of all, we need to create a new K8s `Secret` that will contain the member certificates ("keycert" files) for authentication:

{% highlight yaml %}
{% include mongo/k8s/examples/sharding/mongo-secret-tls-sh1.yaml %}
{% endhighlight %}

{% include remember.markdown content="The content of the secrets under the `data` block have to be encoded in base64 format." %}

Now, everything is ready to apply our final K8s statefulset that will mutate our cluster into an authenticated cluster. With respect to part 2 of this series, the manifest has been tweaked a bit to copy to each member of the Replica Set its corresponding "keycert" file. It can be observed that new parameters have been added to convey the options related to the member authentication based on x509. In addition the parameter `--tlsAllowConnectionsWithoutCertificates` no longer appears, as connections without certificates are not allowed. 

{% highlight yaml %}
{% include mongo/k8s/examples/sharding/secured-mongo-sh1.yaml %}
{% endhighlight %}

If everything is fine, after applying the manifest above, the Pods associated to the statefulset should restart and finally be up and running waiting for new connections. 

### Testing our mongoDB Cluster

At this point in time, our mongoDB cluster can only be accessed by presenting a proper "keycert" file. In order to test, our initial `client.keycert` is going to be used (corresponding to the user's DN `CN=App1,OU=Applications,O=CanteraFonseca,C=ES`). For convenience reasons, a new K8s secret is created as follows:


{% highlight yaml %}
{% include mongo/k8s/examples/sharding/mongo-secret-client.yaml %}
{% endhighlight %}

It contains the keycert to be presented when connecting to our mongoDB cluster.

As we would like to continue using kubectl and all the K8s facilities, we need to define a K8s Pod manifest fragment as follows:

{% highlight json %}
{% include mongo/k8s/examples/sharding/mongo-client.json %}
{% endhighlight %}

It can be observed that a volume with our keycert file secret has been properly mapped to be used when connecting to our cluster by executing:

{% highlight shell %}
kubectl run tm-mongo-pod --image=mongo:4.2.6 --rm=true -it --restart=Never --namespace=sharding --overrides="$(cat mongo-client.json)"
{% endhighlight %}

After executing the command above, we will be under the mongo shell console prompt but not authenticated yet. In order to authenticate the following Javascript sentence has to be executed (at this time, against the `PRIMARY` Replica Set member):

{% highlight javascript %}
{% include mongo/k8s/examples/sharding/authenticate.js %}
{% endhighlight %}

{% include remember.markdown content="We can authenticate as we are presenting a keycert file as a proof of our identity (`CN=App1,OU=Applications,O=CanteraFonseca,C=ES`)." %}

Once we are authenticated we can create a new database, named `test`, and insert a document into a collection `testCollection` as follows:

{% highlight javascript %}
{% include mongo/k8s/examples/sharding/db-operations-sh1.js %}
{% endhighlight %}

Later, we can check that the data has been propagated to all members of our Replica Set by connecting to a `SECONDARY` cluster member, authenticating against it (using the procedure describe above), and querying the data on the `test` database (at this step don't forget to issue `rs.slaveOk()` before querying). 

## 📖 Sharded mongoDB

To be developed. 

## 🖊️ Conclusions

Kubernetes provides powerful primitives to deploy a clustered mongoDB datastore service. Furthermore, we can deploy a secured and sharded mongoDB so that we can give production-grade support to IoT and Big Data Applications which demand higher scalability. 

{% include feedback.markdown %}
