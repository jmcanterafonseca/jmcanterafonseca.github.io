---
layout: page
title: Home
---

# Jose Manuel Cantera Fonseca

I am a senior applied research engineer focused on open standards, software architecture, semantic web, mobile systems, the Internet of Things, and blockchain. My work has centered on turning emerging technologies into practical, scalable solutions for society, from the early mobile web and FirefoxOS to connected smart-city platforms and decentralized digital ecosystems.

Over the years, I have contributed to initiatives and standards in W3C, ETSI, GS1, and UN/CEFACT, helping shape technologies for interoperable data, context-aware systems, and value-chain innovation. I have led technical work across IoT platforms, identity, supply-chain traceability, and circular-economy applications, combining research, architecture, and implementation to build systems that can be adopted in the real world.

[About me](/about/)

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
