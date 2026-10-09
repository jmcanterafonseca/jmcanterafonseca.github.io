---
layout: post
title: "Enhanced software architectures and solutions for value chains"
description: "A scalable software architecture for value chain ecosystems enabling data sovereignty and discoverability, enabling new solutions."
date: 2026-10-09 08:00:00 +0200
categories: value-chains
comments: false
---

## Introduction

Value chain ecosystems are characterised by multiple actors intervening across the lifecycle of a product. We can imagine a battery mounted on your new electric car. Such a battery might be assembled in Europe using different battery modules made in China composed of hundreds of battery cells of Lithium mineral extracted in Africa. The car is under the EU regulations. Additionally your battery might be revised periodically and a maintainer may substitute battery modules no longer performing well. Retired battery modules need to be recycled or even given a second life. Along this discussion, multiple actors have already been identified: consumers, car manufacturers, battery module manufacturers, mineral extraction companies, the EU regulator, customs authorities, recycler or refurbishers. But also multiple jurisdictions, EU, China, Africa, … 

## Centralized Systems : A double-edged sword

From an IT point of view, value chain actors need to generate or get access to information about a product instance, leading to different challenges, such as data locality, data controlling, data representation, data authenticity and provenance, non-repudiation and discoverability. The traditional solution is to set up a central data platform with some KYB and permissions grants given among actors. Even though their implementation is feasible, centralized systems need well defined infrastructure owners and data controlling responsibilities, and given that value chain data originates in multiple jurisdictions, this can be problematic. Also a central platform needs to be commissioned to one single vendor that needs to be funded to maintain it “forever”. Additionally, a central system cannot be easily scaled on a global basis. For instance, imagine that a battery module is sold for refurbishment to a company in the USA, now there would be yet another actor from an initially unknown jurisdiction, that would need to be onboarded centrally, with all the hassles regarding KYB and mutual recognition.

## Towards decentralization

In a recent [paper published by the Frontiers in Blockchain journal](https://www.frontiersin.org/journals/blockchain/articles/10.3389/fbloc.2026.1872355/abstract), we have described an alternative software architecture for value chain ecosystems that sits in between federation and decentralization. In our proposal each actor captures and maintains their own data about products and has the sovereignty to decide to whom data is shared via data sharing policies. For instance, the manufacturer must define a policy to share all product’s data (the battery’s Digital Product Passport) with the regulator. Data is represented by common Linked Data Vocabularies enabling knowledge graph representations ready for AI. Authenticated actors get access to value chain data through the Web. Actors control their own decentralized identity which is linked to their business identity via a Digital Identity Anchor credential. Each value chain ecosystem can define trust issuers, i.e. the entities that are recognized as legit issuers of the key credentials. When it comes to data discoverability, each actor exposes a catalog endpoint of the data shared, ready to be aggregated. Catalogs and ecosystem-specific aggregation services can be very complementary to the DPP registry proposed by the EU regulator. Optionally, a distributed ledger can be used as a verifiable registry for decentralized identities, trusted issuers or timestamps.

## Conclusions

In further blog posts I will give more details about this architecture and the standards that underpin it, some of them I am actively contributing to. The advantages are clear both for businesses and consumers in the era of AI and data sovereignty. One can imagine his own AI agent discovering all information about products already owned or prospected and being given recommendations about purchase, maintenance or recycling aspects.
