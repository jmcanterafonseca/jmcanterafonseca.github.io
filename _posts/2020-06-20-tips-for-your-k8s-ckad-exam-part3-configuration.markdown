---
layout: post-with-toc
title:  "CKAD Exam Tips Preparation 3/4 - Configuration and Volumes"
date:   2020-06-20 08:00:00 +0200
categories: Kubernetes Certification Application Developer CNCF K8s Cloud Native Computing CKAD Linux Foundation configuration volumes secrets
feedback: "https://github.com/jmcanterafonseca/jmcanterafonseca.github.io/issues/3"
---

{% include K8s/series.markdown %}

## Environment

For running a pod with a certain set of environment variables (env var) the easiest way is with `--env`:

{% highlight shell %}
kubectl run p1 --image=busybox --env='var1=val1' --env='var2=val2' -- sh -c 'sleep 3600'
{% endhighlight %}

{% include remember.markdown content="one `--env` parameter is needed per env var set" %} 

An environment can be also be populated with variables coming from ConfigMaps or Secrets. 

## Config Maps

The simplest way to create a Config Map is with the `--literal` command line option:

{% highlight shell %}
kubectl create configmap cm1 --from-literal='key1=value1' --from-literal='key2=value2'
{% endhighlight %}

{% include remember.markdown content="one `--literal` parameter is needed per name/value pair" %}

A Config Map can also be created from a properties or environment var file:

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

A Config Map can also be created to include all the contents of a file:

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

The above command will create a config map with just one name/value pair (named `myconfig.json`) which value will be the content 
of the `myconfig.json` file. 

{% include remember.markdown content="The difference between `--from-env-file` and `--from-file`." %}

## Secrets 

{% include remember.markdown content="Use secrets for sensitive configurations, TLS, private keys, certificates, etc." %} 

{% include remember.markdown content="Secrets are stored encrypted but finally exposed to trusted containers in plain mode." %} 

The simplest way to create a generic Secret is with the `--literal` command line option:

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

Assuming your K8s implementation encrypts secrets using base64 (please do not do that in production) you can obtain
a Secret's value in plain mode as follows:

{% highlight shell %}
kubectl get secret s1 -o jsonpath='{.data.username}{"\n"}' | base64 -d
{% endhighlight %}

{% include remember.markdown content="You can create Secrets from env files and with file or folder content." %}

{% include remember.markdown content="Service Account tokens are also stored as Secrets 
of type `kubernetes.io/service-account-token`." %}

## Using Config Maps and Secrets with Pods

### As env vars

How to use a Config Map with direct mapping to env variables:

{% highlight yaml %}
{% include examples/configmap-env.yaml %}
{% endhighlight %}

{% include remember.markdown content="An env var will be created for each ConfigMap's name/value pair." %}

{% include remember.markdown content="The same can be done with Secrets using `secretRef` instead of `configMapRef`." %}

{% include remember.markdown content="Use `optional: false` to ensure you are using an already 
existent/right Config Map or Secret." %}

ConfigMap's or Secret's name/value pairs can also be mapped to custom env vars. In the example below the 
env var `SECRET567` is mapped to the name/value pair `pwd` of the Secret `s1`. 

{% highlight yaml %}
{% include examples/secret-env-var.yaml %}
{% endhighlight %}

{% include remember.markdown content="The same can be done with Config Map using `configMapKeyRef` 
instead of `secretKeyRef`." %}

### As volumes

## Volumes


## ⏭️ Next in this series

[Configuration]({% post_url 2020-06-20-tips-for-your-k8s-ckad-exam-part3-configuration %})

{% include feedback.markdown %}
