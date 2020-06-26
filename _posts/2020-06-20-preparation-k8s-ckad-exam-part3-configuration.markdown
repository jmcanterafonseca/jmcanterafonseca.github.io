---
layout: post-with-toc
title:  "CKAD Exam Preparation 3/4 - Configuration and Volumes"
date:   2020-06-20 08:00:00 +0200
categories: Kubernetes Certification Application Developer CNCF K8s Cloud Native Computing CKAD Linux Foundation configuration volumes secrets
feedback: "https://github.com/jmcanterafonseca/jmcanterafonseca.github.io/issues/3"
---

## ▶️ Introduction

This part summarizes Configuration and Volumes as key primitives of the CKAD Exam Curriculum. To learn more about the CKAD Exam please read this [overview]({% post_url 2020-06-25-preparation-k8s-ckad-exam-overview %}).

{% include K8s/series.markdown %}

## 🖇️ Configuration Primitives

{% include see-also.markdown content="https://kubernetes.io/docs/concepts/configuration/" %}

### Environment

For **running a Pod** with a certain set of **environment variables** (env var) the easiest way is with `--env`:

{% highlight shell %}
kubectl run p1 --image=busybox --env='var1=val1' --env='var2=val2' -- sh -c 'sleep 3600'
{% endhighlight %}

{% include remember.markdown content="one `--env` parameter is needed per env var set." %} 

An environment can be also be populated with variables coming from Config Maps or Secrets. 

### Config Maps

The simplest way to **create a Config Map** is with the `--literal` command line option:

{% highlight shell %}
kubectl create configmap cm1 --from-literal='key1=value1' --from-literal='key2=value2'
{% endhighlight %}

{% include remember.markdown content="one `--literal` parameter is needed per name/value pair." %}

A Config Map can also be created from a **properties or environment var file**:

{% highlight shell %}
cat file.env
var1=val1
var2=val2

kubectl create configmap cm2 --from-env-file=file.env
{% endhighlight %}

{% highlight shell %}
kubectl describe configmap cm2

Name:         cm2
Namespace:    default

Data
====
var1:
----
val1
var2:
----
val2
{% endhighlight %}

A Config Map can also be created to **include all the contents of a file**:

{% highlight shell %}
cat myconfig.json
{
    "id": "a456",
    "type": "Configuration"
}

kubectl create configmap cm3 --from-file=myconfig.json
{% endhighlight %}

{% highlight shell %}
Name:         cm3
Namespace:    default

Data
====
config.json:
----
{
  "id": "a3456",
  "type": "Configuration"
}
{% endhighlight %}

The above command will create a Config Map with just **one name/value pair** (named `myconfig.json`) which value will be **the content of the `myconfig.json` file**. 

{% include remember.markdown content="The difference between `--from-env-file` and `--from-file`." %}

### Secrets 

{% include remember.markdown content="Use Secrets for sensitive configurations, TLS, private keys, certificates, etc." %} 

{% include remember.markdown content="Secrets are stored encrypted but finally exposed to trusted containers in plain mode." %} 

The simplest way to create a **generic Secret** is with the `--literal` **command line** option:

{% highlight shell %}
kubectl create secret generic s1 --from-literal='username=jmcf' --from-literal='pwd=a123456'
{% endhighlight %}
{% include remember.markdown content="one `--literal` parameter is needed per Secret's name/value pair." %}

{% highlight shell %}
kubectl describe secrets s1

Name:         s1
Namespace:    default

Type:  Opaque

Data
====
pwd:       7 bytes
username:  4 bytes
{% endhighlight %}

Assuming your K8s implementation encrypts Secrets using base64 (please do not do that in production) you can **obtain a Secret's value in plain mode** as follows:

{% highlight shell %}
kubectl get secret s1 -o jsonpath='{.data.username}{"\n"}' | base64 -d
{% endhighlight %}

{% include remember.markdown content="You can create Secrets from env files and with file or folder content." %}

{% include remember.markdown content="Service Account tokens are also stored as Secrets 
of type `kubernetes.io/service-account-token`." %}

### Pod Configuration through env vars

How to use a Config Map with **direct mapping to env variables**:

{% highlight yaml %}
{% include K8s/examples/configmap-env.yaml %}
{% endhighlight %}

{% include remember.markdown content="An env var will be created for each ConfigMap's name/value pair." %}

{% include remember.markdown content="The same can be done with Secrets using `secretRef` instead of `configMapRef`." %}

{% include remember.markdown content="Use `optional: false` to ensure you are using an already 
existent/right Config Map or Secret." %}

ConfigMap's or Secret's **name/value pairs** can also be mapped to **custom env vars**. In the example below the 
env var `SECRET567` is mapped to the name/value pair `pwd` of the Secret `s1`. 

{% highlight yaml %}
{% include K8s/examples/secret-env-var.yaml %}
{% endhighlight %}

{% include remember.markdown content="The same can be done with Config Map using `configMapKeyRef` 
instead of `secretKeyRef`." %}

### Pod configuration through Volumes

A **Volume** can be easily declared to **reference a Config Map or a Secret**. 
Then, such volume can be **mounted** to a folder by containers. Such folder will contain **a file per name/value pair**. 
The **name** of the file will correspond to the **key name** and the **content** of the file will be the **key value**. 

{% highlight yaml %}
{% include K8s/examples/configmap-volume.yaml %}
{% endhighlight %}

{% include remember.markdown content="The same can be done with Secret using `secret` 
instead of `configMap`." %}

It is also possible to **map** specific name/value pairs of a Secret or Config Map to a **path**. See below

{% highlight yaml %}
{% include K8s/examples/secret-volume-item.yaml %}
{% endhighlight %}

{% highlight shell %}
kubectl exec my-pod-4 -it -n jmcf -- cat /etc/foo/credentials/username.conf
{% endhighlight %}

## 💽 Volumes

{% include see-also.markdown content="https://kubernetes.io/docs/concepts/storage/" %}

### Transient Volumes

`emptyDir` allows to create a **transient Volume** for a Pod.

{% highlight yaml %}
{% include K8s/examples/emptydir-volume.yaml %}
{% endhighlight %}

{% highlight shell %}
kubectl exec -it -f emptydir-volume.yaml -- cat /var/log/app.txt
{% endhighlight %}

{% include remember.markdown content="Transient Volumes share a Pod's lifetime." %}

### Persistent Volumes 

How to create a **Persistent Volume** (PV)

{% highlight yaml %}
{% include K8s/examples/pv.yaml %}
{% endhighlight %}

{% highlight shell %}
kubectl get pv mypv-tutorial
{% endhighlight %}

{% highlight shell %}
NAME            CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM   STORAGECLASS     REASON   AGE
mypv-tutorial   20Mi       RWO,RWX        Retain           Available           canterafonseca            25s
{% endhighlight %}

{% include remember.markdown content="PVs are **cluster resources** and have a lifecycle independent of any individual Pod that uses the PV." %}

{% include remember.markdown content="The reclaim policy for a PV tells the cluster what to do with the Volume after it has been released of its claim: `Retain`, `Recycle`, or `Delete`." %}

### Persistent Volume Claims

A Persistent Volume Claim (PVC) is a **request for storage** by a user. **PVCs consume PV resources**. Claims can request specific size and access modes.

{% highlight yaml %}
{% include K8s/examples/pvc.yaml %}
{% endhighlight %}

{% highlight shell %}
kubectl get pvc -n jmcf pvclaim-t1
{% endhighlight %} 

{% highlight shell %}
NAME         STATUS   VOLUME          CAPACITY   ACCESS MODES   STORAGECLASS     AGE
pvclaim-t1   Bound    mypv-tutorial   20Mi       RWO,RWX        canterafonseca   20s
{% endhighlight %}

We can observe that our initial PV `mypv-tutorial` it is now **bound** to our PVC `jmcf/pvclaim-t1`. 

{% highlight shell %}
kubectl get pv mypv-tutorial
{% endhighlight %} 

{% highlight shell %}
NAME            CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM             STORAGECLASS     REASON   AGE
mypv-tutorial   20Mi       RWO,RWX        Retain           Bound    jmcf/pvclaim-t1   canterafonseca            17m
{% endhighlight %}

{% include remember.markdown content="The binding between a PV and a PVC happens provided there is a **match** with capacity, storage class and selector." %}

{% include remember.markdown content="There are storage classes marked as **dynamically provisioned**. In those cases
PVs can be created dynamically to meet the demands of a PVC." %}

### Mounting Persistent Volume Claims

{% highlight yaml %}
{% include K8s/examples/pod-pvc.yaml %}
{% endhighlight %}

{% highlight shell %}
kubectl exec -it -f pod-pvc.yaml -- cat /var/log/app.txt
{% endhighlight %}

## ⏭️ Next in this series

[Deployments, Services and Networking]({% post_url 2020-06-24-preparation-k8s-ckad-exam-part4-services %})

{% include feedback.markdown %}
