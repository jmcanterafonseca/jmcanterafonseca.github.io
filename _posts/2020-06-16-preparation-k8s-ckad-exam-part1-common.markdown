---
layout: post-with-toc
title:  "CKAD Exam Preparation 1/4 - Cross Cutting Aspects"
date:   2020-06-16 08:00:00 +0200
categories: Kubernetes Certification Application Developer CNCF K8s Cloud Native Computing CKAD Linux Foundation
feedback: "https://github.com/jmcanterafonseca/jmcanterafonseca.github.io/issues/1"
---

## ▶️ Introduction

This part covers cross-cutting aspects to be known in order to pass the CKAD Certification Exam. To learn more about the CKAD exam  please read this [overview]({% post_url 2020-06-25-preparation-k8s-ckad-exam-overview %}).

{% include K8s/series.markdown %}

## 🧭 Environment Setup

{% include see-also.markdown content="https://kubernetes.io/docs/concepts/overview/components/" %}

### Documentation 

During the exam you will be allowed to open **only one browser tab** pointing to the K8s documentation Web site. 
The main links to remember are below, namely the concepts one, as it will allow you to copy and paste certain
object manifests easily, for instance `PersistentVolume` or `PersistentVolumeClaim`. 

* 📖 Documentation home page: [https://kubernetes.io/docs/home/](https://kubernetes.io/docs/home/)
* 📖 K8s concepts: [https://kubernetes.io/docs/concepts/](https://kubernetes.io/docs/concepts/)
* 📖 K8s reference: [https://kubernetes.io/docs/reference/](https://kubernetes.io/docs/reference/)
* 📓 `kubectl` cheat sheet [https://kubernetes.io/docs/reference/kubectl/cheatsheet/](https://kubernetes.io/docs/reference/)

`kubectl` is ready to **enable autocomplete** and that can save you precious time. I found kubectl autocomplete enabled during my exam but in any case you can find how to enable it in the cheat sheet. 

To remember the **syntax and structure** of YAML object manifests `kubectl explain` will be your best ally. 
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

You may also need (actually I did not use it) to use a **term multiplexing** solution such as `tmux`.

{% highlight shell %}
apt-get install tmux
{% endhighlight %}

With `tmux` you can 

* Ctrl + b + “ → Split horizontally and create a new horizontal pane
* Ctrl + b + cursor up / cursor down → Move between panes
* Ctrl + b + x → Kill pane

More information on how to use `tmux` can be found at:

* 📓 [http://www.sromero.org/wiki/linux/aplicaciones/tmux](http://www.sromero.org/wiki/linux/aplicaciones/tmux)
* 📓 [https://medium.com/@jeongwhanchoi/install-tmux-on-osx-and-basics-commands-for-beginners-be22520fd95e](https://medium.com/@jeongwhanchoi/install-tmux-on-osx-and-basics-commands-for-beginners-be22520fd95e)

### Configuration and Namespaces

{% include see-also.markdown content="https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/" %}

Your exam is going to be conducted (from a base node) in different K8s Clusters and Namespaces. 
`kubectl` allows you to work against different Clusters provided you have set the proper Configuration Context. 

To **view your Configuration**: 

{% highlight shell %}
kubectl config view
{% endhighlight %}

{% highlight yaml %}
{% include examples/config.yaml %}
{% endhighlight %}

{% include remember.markdown content="Remember the structure of Configurations and Contexts:" %} 

{% highlight shell %}
Config = { Users, Clusters, Contexts, Current-Context }
Context = ( Cluster, User, Namespace )
Cluster = ( K8s-API-Server-endpoint )
User = ( Private-Key, Certificate )
{% endhighlight %}

If you want to **set up a new Context** with a particular User, Cluster and Namespace:

{% highlight shell %}
kubectl config set-context <CONTEXT_NAME> --namespace=<NAMESPACE_NAME> 
--user <USER_NAME> --cluster <CLUSTER_NAME>
{% endhighlight %}

{% highlight shell %}
kubectl config use-context <CONTEXT_NAME> 
{% endhighlight %}

If your Context is not pointing to the **Namespace** you want to work with you can **specify** it:

{% highlight shell %}
kubectl -n  <NAMESPACE>
kubectl --namespace=<NAMESPACE>
{% endhighlight %}

To refer to **all Cluster Namespaces**: 

{% highlight shell %}
kubectl -A
kubectl --all-namespaces
{% endhighlight %}

{% include remember.markdown content="A Namespace can also be referenced at the `metadata` level of an object manifest." %}

### Resource Quotas

Create a new **Namespace**:

{% highlight shell %}
kubectl create namespace ex-ns
{% endhighlight %}

{% include see-also.markdown content="https://kubernetes.io/docs/concepts/policy/resource-quotas/" %}

Defining a **Resource Quota** for a Namespace:

{% highlight yaml %}
{% include examples/resource-quota.yaml %}
{% endhighlight %}

{% highlight shell %}
kubectl get ResourceQuota -n ex-ns
{% endhighlight %}

{% highlight shell %}
NAME                AGE     REQUEST                                                LIMIT
ex-resource-quota   2m40s   pods: 0/5, requests.cpu: 0/2, requests.memory: 0/1Gi   limits.cpu: 0/4, limits.memory: 0/2Gi
{% endhighlight %}

{% include remember.markdown content="Once a **Namespace** defines **Resource Quotas**, an object must  `request` its **minimum resource requirements**. If there are not sufficient available resources in the Namespace based on the `request` **an object may not run** or may be killed." %}

## ✂️ Generic Operations

**Create** an object:

{% highlight shell %}
kubectl create -f <manifest.yaml>
{% endhighlight %}

**Apply** an object manifest:

{% highlight shell %}
kubectl apply -f <manifest.yaml>
{% endhighlight %}

{% include remember.markdown content="Some objects do not admit overriding certain fields." %}

**Delete** an object:

{% highlight shell %}
kubectl delete -f <manifest.yaml>
kubectl delete pods/mypod --grace-period=1
{% endhighlight %}

**Edit** an object: 

{% highlight shell %}
kubectl edit -f <manifest.yaml>
kubectl edit deployments my-deployment
{% endhighlight %}

**Patch** (update) an object using JSON/YAML Patch:

{% include see-also.markdown content="https://kubernetes.io/docs/tasks/manage-kubernetes-objects/update-api-object-kubectl-patch/" %}

{% highlight shell %}
kubectl patch -f <manifest.yaml> --patch='<JSON_PATCH>'
kubectl patch -f <manifest.yaml> --patch=$'<YAML_PATCH>'
{% endhighlight %}

**Patch example**: Changing a Pod's image:

{% highlight shell %}
kubectl run --image=busybox my-pod -- sh -c 'sleep 3600'
{% endhighlight %}

{% highlight shell %}
kubectl patch pod my-pod --patch='{"spec":{"containers":[{"name":"my-pod","image":"alpine"}]}}'
{% endhighlight %}

{% include remember.markdown content="You need to provide a **merge key**. In the example above is `container.name`." %}

{% include remember.markdown content="There are three types of patches in K8s: `json` ([RFC 6902](https://tools.ietf.org/html/rfc6902)), `merge` ([RFC 7386](https://tools.ietf.org/html/rfc7386)) and `strategic` (K8s specified). `strategic`is the default." %}

{% include remember.markdown content="With a **strategic merge patch**, a list is either replaced or merged depending on its patch strategy defined by the K8s API." %}

{% include remember.markdown content="With a **JSON merge patch**, if you want to update a list, you have to specify the entire new list. And the new list completely replaces the existing list." %}

Get **detailed information** about an object. `describe` provides long descriptions:

{% highlight shell %}
kubectl get -f <manifest.yaml> -o=wide
kubectl get pods/mypod -o=yaml
kubectl describe -f <manifest.yaml>
{% endhighlight %}

{% include remember.markdown content="A `get` command does not display labels by default. `--show-labels` will do the trick." %}

{% include remember.markdown content="The  `-w` option allows to watch what is happening with a certain object." %}

Use JSON Path to **filter fields** of an object descriptor (manifest):

{% highlight shell %}
kubectl get pod nginx -o jsonpath='{.metadata.annotations}{"\n"}'
{% endhighlight %}

To **re-label** an object (`--overwrite` has to be used if we are updating an existing label):

{% highlight shell %}
kubectl label pods foo 'status=unhealthy' --overwrite
{% endhighlight %}

**Remove labels** from a set of objects (Appending a dash to the label name i.e. `<label>-`):

{% highlight shell %}
kubectl label pods --selector='app=v1' app-
{% endhighlight %}

{% include remember.markdown content="`--selector` or `-l` is intended to select the concerned objects by matching labels." %}

Reference **several objects**, for instance **annotate** a set of Pods:

{% highlight shell %}
kubectl annotate pods nginx1 nginx2 nginx3 'description=a description'
{% endhighlight %}

## 📟 Monitoring

{% include see-also.markdown content="https://kubernetes.io/docs/tasks/debug-application-cluster/resource-usage-monitoring/" %}

Display **resource consumption** of Pods:

{% highlight shell %}
kubectl top pods -n <NAMESPACE>
{% endhighlight %}

{% highlight shell %}
NAME                     CPU(cores)   MEMORY(bytes)
depl1-77f99c5854-mcvpf   0m           3Mi
depl1-77f99c5854-pbdhl   0m           4Mi
depl1-77f99c5854-swc4g   0m           3Mi
ex1-79c777cf98-hs4q9     0m           2Mi
ex1-79c777cf98-r9w77     0m           2Mi
ex1-79c777cf98-vrrb6     0m           2Mi
pod-with-pvc             0m           1Mi
{% endhighlight %}

{% include remember.markdown content="Application monitoring does not depend on a single monitoring solution.`metrics-server` is a lightweight monitoring solution that can be easily enabled on minikube." %}

Display **resource usage** of each K8s **Node**:

{% highlight shell %}
kubectl top nodes
{% endhighlight %}

{% highlight shell %}
NAME       CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
minikube   346m         17%    2737Mi          71%
{% endhighlight %}

More **detailed information** about a **Node** can be obtained by:

{% highlight shell %}
kubectl describe nodes
{% endhighlight %}


## ⏭️ Next in this series

[Pods and Jobs]({% post_url 2020-06-19-preparation-k8s-ckad-exam-part2-pods %})

{% include feedback.markdown %}
