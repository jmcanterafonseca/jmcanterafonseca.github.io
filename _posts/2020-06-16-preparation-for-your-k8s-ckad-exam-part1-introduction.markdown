---
layout: post-with-toc
title:  "CKAD Exam Preparation 1/4 - Cross Cutting Aspects"
date:   2020-06-16 08:00:00 +0200
categories: Kubernetes Certification Application Developer CNCF K8s Cloud Native Computing CKAD Linux Foundation
feedback: "https://github.com/jmcanterafonseca/jmcanterafonseca.github.io/issues/1"
---

{% include K8s/series.markdown %}

## 🧭 Environment Setup

{% include see-also.markdown content="https://kubernetes.io/docs/concepts/overview/components/" %}

### Documentation 

During the exam you will be allowed to open **only one browser tab** pointing to the K8s documentation Web site. 
The main links to remember are below, namely the concepts one, as it will allow you to copy and paste certain
object manifests easily, for instance `PersistentVolume` or `PersistentVolumeClaim`. 

* Documentation home page: [https://kubernetes.io/docs/home/](https://kubernetes.io/docs/home/)
* K8s concepts: [https://kubernetes.io/docs/concepts/](https://kubernetes.io/docs/concepts/)
* K8s reference: [https://kubernetes.io/docs/reference/](https://kubernetes.io/docs/reference/)
* `kubectl` cheat sheet [https://kubernetes.io/docs/reference/kubectl/cheatsheet/](https://kubernetes.io/docs/reference/)

`kubectl` is ready to enable autocomplete and that can save you precious time. I found kubectl autocomplete enabled during my exam but in any case you can find how to enable it in the cheat sheet. 

To remember the syntax and structure of YAML object manifests `kubectl explain` will be your best ally. 
Just using the syntax `<object_name>.<property>` you can get the corresponding documentation without going
to documentation web pages. Remember that any K8s object has four main fields: `apiVersion`, `kind`, `metadata` and `spec` and the meaty part is at `spec`. 

{% highlight shell %}
kubectl explain pod.spec.containers --recursive
kubectl explain deployment.spec
{% endhighlight %}

At any time you can get detailed kubectl command syntax. The nice thing about `--help` is
that it is available at any nesting level, for instance:

{% highlight shell %}
kubectl --help
kubectl create --help
kubectl create deployment --help
{% endhighlight %}

### Complementary Tools
If you are going to use `nano` as editor you must configure it properly in order to deal with YAML edition. Edit a file named `$HOME/.nanorc`

{% highlight shell %}
set tabsize 4
set tabstospaces
{% endhighlight %}

You may also need (actually I did not use it) to use a term multiplexing solution such as `tmux`.

{% highlight shell %}
apt-get install tmux
{% endhighlight %}

With `tmux` you can 

* Ctrl + b + “ → Split horizontally and create a new horizontal pane
* Ctrl + b + cursor up / cursor down → Move between panes
* Ctrl + b + x → Kill pane

More information on how to use `tmux` can be found at:

* [http://www.sromero.org/wiki/linux/aplicaciones/tmux](http://www.sromero.org/wiki/linux/aplicaciones/tmux)
* [https://medium.com/@jeongwhanchoi/install-tmux-on-osx-and-basics-commands-for-beginners-be22520fd95e](https://medium.com/@jeongwhanchoi/install-tmux-on-osx-and-basics-commands-for-beginners-be22520fd95e)

### Configuration and Namespaces
Your exam is going to be conducted (from a base node) in different K8s clusters and namespaces. 
`kubectl` allows you to work against different clusters provided you have set the proper configuration context. 

To view your configuration: 

{% highlight shell %}
kubectl config view
{% endhighlight %}

{% highlight yaml %}
{% include examples/config.yaml %}
{% endhighlight %}

{% include remember.markdown content="the structure of configurations and contexts" %} 

{% highlight shell %}
Config = { Users, Clusters, Contexts, Current-Context }
Context = ( Cluster, User, Namespace )
Cluster = ( K8s-API-Server-endpoint )
User = ( Private Key, Certificate )
{% endhighlight %}

If you want to set up a new context with a particular user, cluster and namespace:

{% highlight shell %}
kubectl config set-context <CONTEXT_NAME> --namespace=<NAMESPACE_NAME> 
--user <USER_NAME> --cluster <CLUSTER_NAME>
{% endhighlight %}

{% highlight shell %}
kubectl config use-context <CONTEXT_NAME> 
{% endhighlight %}

If your context is not pointing to the namespace you want to work with you can specify it:

{% highlight shell %}
kubectl -n  <NAMESPACE>
kubectl --namespace=<NAMESPACE>
{% endhighlight %}

To refer to all namespaces: 

{% highlight shell %}
kubectl -A
kubectl --all-namespaces
{% endhighlight %}

{% include remember.markdown content="A namespace can also be defined at the `metadata` level of an object manifest." %}

## ✂️ Generic Operations

Create an object

{% highlight shell %}
kubectl create -f <manifest.yaml>
{% endhighlight %}

Apply an object manifest

{% highlight shell %}
kubectl apply -f <manifest.yaml>
{% endhighlight %}

{% include remember.markdown content="Some objects do not admit overriding certain fields." %}

Delete an object

{% highlight shell %}
kubectl delete -f <manifest.yaml>
kubectl delete pods/mypod --grace-period=1
{% endhighlight %}

Get information about an object. `describe` provides long descriptions. 

{% highlight shell %}
kubectl get -f <manifest.yaml> -o=wide
kubectl get pods/mypod -o=yaml
kubectl describe -f <manifest.yaml>
{% endhighlight %}

{% include remember.markdown content="A `get` command does not display labels by default. `--show-labels` will do the trick." %}

{% include remember.markdown content="The  `-w` option allows to watch what is happening with a certain object." %}

Use JSON Path to filter fields of an object descriptor (manifest)

{% highlight shell %}
kubectl get pod nginx -o jsonpath='{.metadata.annotations}{"\n"}'
{% endhighlight %}

To re-label an object (`--overwrite` has to be used if we are updating an existing label)

{% highlight shell %}
kubectl label pods foo 'status=unhealthy' --overwrite
{% endhighlight %}

Remove labels from a set of objects (Appending a dash to the label name i.e. `<label>-`)

{% highlight shell %}
kubectl label pods --selector='app=v1' app-
{% endhighlight %}

{% include remember.markdown content="`--selector` or `-l` is intended to select the concerned objects by matching labels." %}

Several objects can be referenced in any operation, for instance

{% highlight shell %}
kubectl annotate pods nginx1 nginx2 nginx3 'description=a description'
{% endhighlight %}

## ⏭️ Next in this series

[Pods and Jobs]({% post_url 2020-06-19-preparation-for-your-k8s-ckad-exam-part2-pods %})

{% include feedback.markdown %}
