---
layout: page
title: Home
---

# Jose Manuel Cantera Fonseca

I am a senior ICT professional focused on open standards, platforms and software architecture. I am well versed on key technologies such as digital identity, the semantic web and knowledge graphs, mobile and ubiquitous computing, IoT and decentralized systems (DLT, blockchain, dataspaces). Over the years, I have contributed to different standards initiatives in W3C, ETSI, GS1, and UN/CEFACT.

[More Details about me](/about/)

## Expertise

My work has been centered on applying emerging technologies to devise new architectures and solutions across multiple domains: context awareness in mobile computing, consumer devices based on the open web, portable IoT applications for smart cities and supply chain traceability and circularity.

[Professional Portfolio (2026)](/blobs/JoseManuelCantera_2026_Professional_Portfolio.docx.pdf)

## Recent Posts

{% assign recent_posts = site.posts | where_exp: "post", "post.archived != true" %}
{% if recent_posts.size > 0 %}
<ul>
  {% for post in recent_posts %}
  <li><span>{{ post.date | date: "%B %-d, %Y" }}</span> — <a href="{{ post.url | relative_url }}">{{ post.title | escape }}</a></li>
  {% endfor %}
</ul>
{% else %}
New posts are coming soon.
{% endif %}

## Archived Posts

{% assign archived_posts = site.posts | where_exp: "post", "post.archived == true" %}
<ul>
  {% for post in archived_posts %}
  <li><span>{{ post.date | date: "%B %-d, %Y" }}</span> — <a href="{{ post.url | relative_url }}">{{ post.title | escape }}</a></li>
  {% endfor %}
</ul>
