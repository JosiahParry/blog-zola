---
title: GPL is holding R back
date: '2026-02-23'
author: Josiah Parry
taxonomies:
  categories:
    - r
    - gpl
---


Over the course of the 4 years and then some years I’ve worked at Esri,
I have been championing the support and integration of R here. I’d like
to think I’ve had some success doing so. However, one thing keeps coming
up—the **GPL** license.

## R & ArcGIS Pro

Our package `{arcgisbinding}` links to ArcGIS Pro. This alone was a feat
that took hours of legal consultation, individual championing, and
outreach to the R community. This all predates my time at Esri (and was
actually released when I was an undergraduate!).

Due to the GPL we cannot ship R or arcgisbinding in ArcGIS Pro—and then
a litany of internal reasonings too that are entirely unrelated!

Many tools in ArcGIS Pro were inspired by and verified against open
source R packages. But much of the use of R ends there.

## The Real Cost

I want to make the (fairly uncontroversial, I think) point that

> **GPL is holding R back.**

I am working to push through a new top secret 🕵️‍♂️product **idea** (note:
*idea* not product, even) that would enhance the way we support R.

This week alone, I count at least 11 people who have had to dedicate
multiple hours discussing, documenting, outlining, arguing about **if**
and **how** we can use R due to the GPL license.

<div class="alert-note">

This has cost the business **thousands** (maybe even a ten thousand or
more) of dollars.

</div>

In no way is this a “oh, no! poor company!”

## Who Actually Loses

What this means, is that supporting the scientists at NOAA, EPA, USDA,
the Forest Service, our homie [Eli
Pousson](https://github.com/elipousson) at the City of Baltimore, the
analysts of the Penobscot, Muscogee, Cherokee, Skokomish, and other
nations of the [tribal exchange
network](https://www.tribalexchangenetwork.org/) (shouts out [Angie
Reed](https://www.linkedin.com/in/angie-reed-a26b5635/), btw), and the
DoT, and, and, and… all of those who love and rely on R, gets stopped
before it starts!

But I’m pig-headed 🐷 and love the R community and I want to see R be
more available to spatial analysts everywhere. But in order to support
R, I have to *fight* R itself.

## The Path Forward

If this was an MIT, or BSD-3, or Apache-2, or other more permissive
licenses, this wouldn’t be as much of a problem.

While I know there are people out there who will say *“skill issue,”*
I’d like to recognize that it’s not that simple. Business have concerns
that, for better or worse, are legitimate.

There’s a balance to be struck that emphasizes the importance of the
**software protected by** the GPL license but also **enables
businesses** to use the software without having to give up their secret
sauce 🍔.

I don’t think the GPL is it.
