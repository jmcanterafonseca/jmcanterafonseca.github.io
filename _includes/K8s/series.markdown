## ▶️ Introduction

This blog post series summarizes the study notes I have been taking during the preparation of 
the [Certified Kubernetes Application Developer](https://training.linuxfoundation.org/certification/certified-kubernetes-application-developer-ckad) (CKAD) exam. 

The CKAD is a certification offered by the [Cloud Native Computing Foundation](https://www.cncf.io/), a project hosted by the [Linux Foundation](https://www.linuxfoundation.org/).
It is intended to assess your skills as an application developer able *to define application resources and use core primitives to build, monitor, and troubleshoot scalable applications and tools in Kubernetes (K8s)*. If you want to start learning K8s I would recommend this training course of the Linux Foundation: [Introduction to Kubernetes](https://www.edx.org/es/course/introduction-to-kubernetes). 
Mathew Palmer has developed a [course and a book](https://matthewpalmer.net/kubernetes-app-developer/) specifically targeted to preparing the CKAD.

In order to pass the exam it is fundamental not only to have a solid understanding of the main K8s primitives 
but also to **be pretty fluent with the `kubectl` command line**. Therefore, it is very important to remember the more frequently used command line options and the main structure and elements of the K8s object manifests (preferably in **YAML** format, as it is terser). You can find mock tasks somewhat similar to those found on the exam thanks to the work of
[Dimitris-Ilias Gkanatsios](https://github.com/dgkanatsios/CKAD-exercises).

### About this Series

During this blog series I summarize the main "study hooks" in order to be successful with your exam, as I was. The series is
composed by the following articles:

* Part 1. [Cross-Cutting Aspects]({% post_url 2020-06-16-preparation-for-your-k8s-ckad-exam-part1-introduction %})
* Part 2. [Pods and Jobs]({% post_url 2020-06-19-preparation-for-your-k8s-ckad-exam-part2-pods %}).
* Part 3. [Configuration and Volumes]({% post_url 2020-06-20-preparation-for-your-k8s-ckad-exam-part3-configuration %}).
* Part 4. [Deployments, Services and Networking]({% post_url 2020-06-24-preparation-for-your-k8s-ckad-exam-part4-services %}).
