---
layout: post-with-toc
title:  "Deploying datastores for IoT & Big Data: mongoDB on K8s. Part 1"
description: "This blog post describes how a mongoDB replica set can be deployed on Kubernetes"
date:   2020-11-05 08:00:00 +0200
categories: K8s Kubernetes statefulset mongoDB replica set security IoT Big Data TLS cloud native computing
comments: true 
---

## 🎬 Introduction

This blog post series is intended to give an overview of how datastores capable of supporting high volumes of data from IoT devices and Big Data services can be deployed on Kubernetes. To start with, the [StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) primitive will be used to set up and deploy a [mongoDB Replica Set](https://docs.mongodb.com/manual/replication/) (cluster). Then, it will demonstrated how other Kubernetes primitives such as [Secret](https://kubernetes.io/docs/concepts/configuration/secret/) can be applied to secure our initial, dummy deployment. The last article in this series will explain how to [shard](https://docs.mongodb.com/manual/sharding/) a mongoDB cluster. It is assumed that you already have an up and running K8s environment, such as [minikube](https://minikube.sigs.k8s.io/docs/start/). 

All the examples have been developed using minikube on macOS Catalina with VirtualBox. 

## 📖 StatefulSet Primitive

A **StatefulSet** is a K8s [Controller](https://kubernetes.io/docs/concepts/architecture/controller/) that manages the deployment and scaling of a set of Pods based on an identical container spec. However, conversely to what happens with [Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) Controllers, these Pods are not interchangeable: each has a persistent identifier that it maintains across any rescheduling.

A StatefulSet shall be associated to a [Service](https://kubernetes.io/docs/concepts/services-networking/service/), to expose its Pods, and to a [PersistentVolumeClaim](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) (PVC) template to gain persistent storage for Pods.  

## 🖥️ Basic Deployment of a mongoDB Replica Set

First of all, a new, clean namespace named `datastores` is created. 

{% highlight shell %}
kubectl create namespace datastores
{% endhighlight %}

Then, we need to create a K8s *headless* Service intended to expose our StatefulSet, as follows: 

{% highlight yaml %}
{% include mongo/k8s/examples/mongo-service.yaml %}
{% endhighlight %}

{% include remember.markdown content="Our Service will be bound to Pods labelled as `app: mongoDB-replica`." %}

Also it would be convenient to set up a [ConfigMap](https://kubernetes.io/docs/concepts/configuration/configmap/) to capture any configuration option needed. 

{% highlight yaml %}
{% include mongo/k8s/examples/mongo-config.yaml %}
{% endhighlight %}

{% include remember.markdown content="The name given to our replica set is: `replica-blog-1`." %}

Afterwards, we can declare our StatefulSet as follows:

{% highlight yaml %}
{% include mongo/k8s/examples/basic-mongo.yaml %}
{% endhighlight %}

{% include remember.markdown content="We need to bind (through the `serviceName`) the StatefulSet with the Service that was created initially: `mongo-db-replica`." %}

{% include remember.markdown content="Our StatefulSet is composed by **3 replicas** that will be incarnated by 3 differentiated Pods." %}

{% include remember.markdown content="We run Pods labelled as `app: mongoDB-replica` in mongoDB's replica set mode (`--replSet`)." %}

{% include remember.markdown content="We mount a volume `mongo-volume-for-replica` that will be made available through a PVC." %}

{% include remember.markdown content="With `volumeClaimTemplates` we define the template of the PVCs that will  be automatically created for each Pod." %}

After applying the manifest shown above, the status of our K8s cluster will be similar to: 

{% highlight shell %}
kubectl get statefulset --namespace=datastores
{% endhighlight %}

{% highlight shell %}
NAME                   READY
mongo-db-statefulset   3/3
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

We can ping our Pods by name (as they are already bound to the Service named `mongo-db-replica`) as follows:

{% highlight shell %}
kubectl run tm-pod --namespace=datastores -it --image=busybox --restart=Never --rm=true \ 
-- ping mongo-db-statefulset-0.mongo-db-replica
{% endhighlight %}

{% highlight shell %}
64 bytes from 172.17.0.14: seq=1 ttl=64 time=0.126 ms
64 bytes from 172.17.0.14: seq=2 ttl=64 time=0.069 ms
{% endhighlight %}

{% include remember.markdown content="Pods pertaining to a StatefulSet are **distinguishable** and keep their own identity. That's why we can address them by `<pod_id>.<service_name>`." %}

{% include remember.markdown content="The identifier of a Pod pertaining to a StatefulSet is formed by concatenating the name of the StatefulSet (`mongo-db-statefulset`) with a dash (`-`) and order number (`0`, `1`, `2`, etc.)." %}

We can observe that 3 different PVCs have been created to satisfy the storage demands of the 3 Pods that compose our mongoDB cluster: 

{% highlight shell %}
kubectl get pvc --namespace=datastores
{% endhighlight %}

{% highlight shell %}
NAME                                              STATUS   VOLUME                                    
mongo-volume-for-replica-mongo-db-statefulset-0   Bound    pvc-179b1538-0cf6-4440-812e-64dc6de8b1a3
mongo-volume-for-replica-mongo-db-statefulset-1   Bound    pvc-c5c4aeb9-ed79-46a7-a7de-effc244090b6
mongo-volume-for-replica-mongo-db-statefulset-2   Bound    pvc-a7d8196b-ae94-43fd-8b31-2550b36b2997
{% endhighlight %}

{% include remember.markdown content="The name of each Pod's PVC is formed by concatenating the name given to the volume claim template (`mongo-volume-for-replica`) with a dash (`-`) and the id of the Pod writing to the volume." %}

### Configuring the mongoDB Replica Set

The next step would be to use our datastore, for instance, using the mongoDB shell client:  

{% highlight shell %}
kubectl run tm-mongo-pod --namespace=datastores -it --image=mongo:4.2.6 --restart=Never --rm=true -- mongo mongo-db-statefulset-0.mongo-db-replica
{% endhighlight %}

At this stage we realize that there is a missing step which is the configuration of the mongoDB replica set itself, so that the leader (Primary Pod in the mongoDB cluster) election can proceed. Executing the following piece of Javascript code on the mongoDB shell will make it happen:

{% highlight javascript %}
{% include mongo/k8s/examples/configure-replicaset.js %}
{% endhighlight %}

Afterwards it can be observed that one of our Pods will become the Primary while the rest will be just Secondary. In my deployment, the Pod `1` of the Statefulset (`mongo-db-statefulset-1`) was elected as leader. Thus, we can connect to such Pod through the mongoDB shell and create a new DB, a collection and a document as follows: 

{% highlight javascript %}
{% include mongo/k8s/examples/db-operations.js %}
{% endhighlight %}

If we want to check that the data is also available to be read on the Secondary replicas, we can do the following (Pod `0` and Pod `2` are my Secondary replicas):

{% highlight shell %}
kubectl run tm-mongo-pod --namespace=datastores -it --image=mongo:4.2.6 --restart=Never --rm=true -- mongo \
mongo-db-statefulset-0.mongo-db-replica --eval="rs.slaveOk();" --shell
{% endhighlight %}

In this case at shell start up it is executed a sentence (`--eval` param) that allows us to query data from a Secondary replica. Afterwards we can execute the following piece of Javascript code that allows to verify that the data just inserted was properly propagated to our replica(s):

{% highlight javascript %}
{% include mongo/k8s/examples/db-operations-replica.js %}
{% endhighlight %}

### Stopping the Datastore cluster

We can stop our mongoDB datastore cluster by scaling it to `0`, as follows: 

{% highlight shell %}
kubectl scale statefulsets/mongo-db-statefulset --replicas=0 --namespace=datastores
{% endhighlight %}

Now we can check the status in our namespace `datastores`:

{% highlight shell %}
kubectl get pods --namespace=datastores
{% endhighlight %}

{% highlight shell %}
No resources found in datastores namespace.
{% endhighlight %}

{% highlight shell %}
kubectl get pvc --namespace=datastores
{% endhighlight %}

{% highlight shell %}
NAME                                              STATUS   VOLUME                                    
mongo-volume-for-replica-mongo-db-statefulset-0   Bound    pvc-179b1538-0cf6-4440-812e-64dc6de8b1a3
mongo-volume-for-replica-mongo-db-statefulset-1   Bound    pvc-c5c4aeb9-ed79-46a7-a7de-effc244090b6
mongo-volume-for-replica-mongo-db-statefulset-2   Bound    pvc-a7d8196b-ae94-43fd-8b31-2550b36b2997
{% endhighlight %}

The PVCs are still there so that our data has not been lost. 

We can restart our mongoDB replica set by scaling out to `3` again. 

{% highlight shell %}
kubectl scale statefulsets/mongo-db-statefulset --replicas=3 --namespace=datastores
{% endhighlight %}

{% highlight shell %}
kubectl get pods --namespace=datastores
{% endhighlight %}

{% highlight shell %}
NAME                     READY   STATUS    RESTARTS   AGE
mongo-db-statefulset-0   1/1     Running   0          8s
mongo-db-statefulset-1   1/1     Running   0          6s
mongo-db-statefulset-2   1/1     Running   0          4s
{% endhighlight %}

Our Pods have come back to life. In my deployment the new leader election after scaling back resulted in Pod `2` now being the Primary and Pods `1` and `0` being Secondary. 

### Killing one Pod and forcing a new leader election

We can manually delete a Pod, for instance the Primary, and check that a new leader election happen and that the controller automatically restores the Pod instance of our StatefulSet. 

## 🖊️ Conclusions

Kubernetes provides powerful primitives to deploy a clustered mongoDB datastore service. Furthermore, we can deploy a secured and sharded mongoDB so that we can give production-grade support to IoT and Big Data Applications which demand higher scalability. 

{% include feedback.markdown %}
