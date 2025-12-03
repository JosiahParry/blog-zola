---
title: Rust traits for R users
subtitle: and how they'll make your package better
taxonomies:
  categories:
    - rust
    - r
    - package-development
    - tutorial
date: 2023-03-02T00:00:00.000Z
image: feRris.svg
---


In the few months that I’ve been programming in Rust nothing has so
fundamentally shifted the way that I think about programming—and
specifically R packages—as Rust traits. I want to talk briefly about
Rust traits and why I think they can make R packages better.

<div class="aside">

<img src="feRris.svg" height="150" />

</div>

A trait defines a set of behaviors that can be used by objects of
different kinds. Each trait is a collection of methods (functions) whose
behavior is defined abstractly. The traits can then be `impl`emented
*for* different object types. Any object that implements the trait can
then use that method. It’s kind of confusing, isn’t it? Let’s work
through [the example in The
Book™](https://doc.rust-lang.org/book/ch10-02-traits.html) and how we
can implement it in R.

## Defining a Trait

We start by defining a trait called `Summary` which as a single method
that returns a `String`. Note how the definition is rather abstract. We
know what the function is and what it returns. What happens on the
inside doesn’t matter to use.

``` rust
trait Summary {
    fn summarize(&self) -> String;
}
```

Analogous in R is the definition of an [S3 function
generic](https://adv-r.hadley.nz/s3.html).

<div class="aside">

It’s only analogous if the trait implements only one method

</div>

``` r
Summary <- function(x) UseMethod("Summary")
```

The S3 function generic is essentially saying that there is a new
function called `Summary` and it will behave differently based on the
class of object passed to it.

<div class="aside">

Note that we can’t specify the output type so we may want to create a
validator function later

</div>

Now we want to define a struct called `NewsArticle` that contains 4
fields related to the news paper itself.

``` rust
pub struct NewsArticle {
    pub headline: String,
    pub location: String,
    pub author: String,
    pub content: String,
}
```

This is similar to creating a new record in
[`vctrs`](https://vctrs.r-lib.org/) which is rather similar to using
base R.

<div class="panel-tabset">

## Base R

``` r
structure(
  list(
    headline = character(),
    location = character(),
    author = character(),
    content = character()
    ), 
  class = "NewsArticle"
)
```

    $headline
    character(0)

    $location
    character(0)

    $author
    character(0)

    $content
    character(0)

    attr(,"class")
    [1] "NewsArticle"

## `vctrs`

``` r
vctrs::new_rcrd(
  list(
    headline = character(),
    location = character(),
    author = character(),
    content = character()
    ), 
  class = "NewsArticle"
)
```

    <NewsArticle[0]>

</div>

## `impl`ementing a trait

It’s important that we are able to summarise our newspaper article for
the socials ofc—so we need to `impl`ement the `Summary` trait for the
`NewsArticle` struct.

``` rust
impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}
```

<div class="aside">

Notice that the trait is called `Summary` whereas the method it provides
is called `summarize()`. For the sake of example I’m going to call the R
function `Summary()` throughout the rest of the example. It’s not
possible to have a perfect 1:1 relationship between Rust and R ;)

</div>

This block defines how the `summarize()` method will work for a
`NewsArticle` struct. It will create a string in the format of
`"{title}, by {author} ({location})"`. In R, we have to define the
`NewsArticle` method for the `Summary` function which is done by
creating a function object with the name signature
`{Generic}.{class} <- function(...) { . . . }`.

<div class="panel-tabset">

## Base R

``` r
Summary.NewsArticle <- function(x) {
  sprintf(
    "%s, by %s (%s)",
    x[["headline"]],
    x[["author"]],
    x[["location"]]
  )
}
```

## `vctrs`

``` r
Summary.NewsArticle <- function(x) {
  sprintf(
    "%s, by %s (%s)",
    vctrs::field(x, "headline"),
    vctrs::field(x, "author"),
    vctrs::field(x, "location")
  )
}
```

</div>

Since Musk’s takeover of twitter, tweets are getting out of hand
becoming ridiculously long so we need to be able to summarize them too!
So if we define a `Tweet` struct and a corresponding implementation of
`Summary` we’ll be able to easily summarize them exactly the same way as
news articles.

``` rust
// define the struct
pub struct Tweet {
    pub username: String,
    pub content: String,
    pub reply: bool,
    pub retweet: bool,
}

// implement the trait
impl Summary for Tweet {
    fn summarize(&self) -> String {
        format!("{}: {}", self.username, self.content)
    }
}
```

Correspondingly in R, we’re going to be working with both Tweets and
News Articles. So we need to define a tweet class to contain our tweets
and a `Summary()` method for the new class.

<div class="panel-tabset">

## Base R

``` r
structure(
  list(
    username = character(),
    content = character(),
    reply = logical(),
    retweet = logical()
  ),
  class = "Tweet"
)
```

    $username
    character(0)

    $content
    character(0)

    $reply
    logical(0)

    $retweet
    logical(0)

    attr(,"class")
    [1] "Tweet"

``` r
Summary.Tweet <- function(x) {
  sprintf("%s: %s", x[["username"]], x[["content"]])
}
```

## vctrs

``` r
vctrs::new_rcrd(
    list(
    username = character(),
    content = character(),
    reply = character(),
    retweet = logical()
  ),
  class = "Tweet"
)
```

    <Tweet[0]>

``` r
Summary.Tweet <- function(x) {
  sprintf(
    "%s: %s", 
    vctrs::field(x, "username"), 
    vctrs::field(x, "content")
    )
}
```

</div>

We can now define a function that utilizes this trait that will produce
consistent `String` output in the same format for both tweets and new
articles.

``` rust
pub fn notify(item: &impl Summary) {
    println!("Breaking news! {}", item.summarize());
}
```

This is huge from the R perspective because we can create a `notify()`
function that calls `Summary()` and as long as a method if defined for
the input class it will work!

``` r
notify <- function(item) {
  sprintf("Breaking news! %s", Summary(item))
}
```

To test this out lets create a `Tweet` and a `NewsArticle`. First we’ll
create constructor functions for each.

<div class="panel-tabset">

## Base R

``` r
new_article <- function(headline, location, author, content) {
  structure(
    list(
      headline = headline,
      location = location,
      author = author,
      content = content
      ), 
    class = "NewsArticle"
  )
}

new_tweet <- function(username, content, reply, retweet) {
  structure(
    list(
      username = username,
      content = content,
      reply = reply,
      retweet = retweet
    ),
    class = "Tweet"
  )
}
```

## `vctrs`

``` r
new_article <- function(headline, location, author, content) {
  vctrs::new_rcrd(
    list(
      headline = headline,
      location = location,
      author = author,
      content = content
      ), 
    class = "NewsArticle"
  )
}

new_tweet <- function(username, content, reply, retweet) {
  vctrs::new_rcrd(
    list(
      username = username,
      content = content,
      reply = reply,
      retweet = retweet
    ),
    class = "Tweet"
  )
}
```

</div>

Using the constructors we can create a tweet and a news article.

``` r
# https://www.theonion.com/new-absolut-ad-features-swaying-mom-with-one-eye-closed-1850138855
article <- new_article(
  "New Absolut Ad Features Swaying Mom With One Eye Closed Telling Camera She Used To Dance",
  "Stockholm",
  "The Onion", 
  "The ad concludes abruptly with the mother beginning to cry when, for no particular reason, she suddenly remembers the death of Princess Diana."
)

# https://twitter.com/TheOnion/status/1631104570041552896
tweet <- new_tweet(
  "@TheOnion",
  "Cat Internally Debates Whether Or Not To Rip Head Off Smaller Creature It Just Met https://bit.ly/3J1kNzV",
  FALSE,
  FALSE
)
```

We can see how notify works for both of these.

``` r
notify(tweet)
```

    [1] "Breaking news! @TheOnion: Cat Internally Debates Whether Or Not To Rip Head Off Smaller Creature It Just Met https://bit.ly/3J1kNzV"

``` r
notify(article)
```

    [1] "Breaking news! New Absolut Ad Features Swaying Mom With One Eye Closed Telling Camera She Used To Dance, by The Onion (Stockholm)"

### what this means

This is awesome. This means that any object that we create in the
future, as long as it implements the `Summary()` function for its class
we can utilize the `notify()` function. This comes with a caveat,
though—as all good things do.

The Rust compiler ensures that any object that implements the `Summary`
trait returns a single string. R is far more laissez faire than Rust
with classes and types. One could create a `Summary` method for an
object that returns a vector of strings. That would break notify. Either
`notify()` should have type checking or you should make sure that your
method always produces the correct type.

## Implications for R packages

This very simple concept can be transformative for the way that we build
R packages. R packages are, for the most part, bespoke. Each one serves
their own purpose and works only within its own types or types it’s
aware of. But what if an R package could work with *any* object type?
Using this idea we can get from Rust traits, we can do that.

Packages that want to be extensible can make it easy to do so by doing
two fairly simple things. Low-level and critical functions should be
exported as generic functions. High level functions that perform some
useful functionality should be built upon those generics.

An example is the [`sdf`](https://github.com/JosiahParry/sdf) package
I’ve prototyped based on this idea. In this case, I have a spatial data
frame class that can be implemented on any object that implements
methods for the following functions:

- `is_geometry()`
- `bounding_box()`
- `combine_geometry()`

### An example

The `sdf` class is a `tibble` with a geometry column and a bounding box
attribute. The function `as_sdf()` creates an `sdf` object that tells us
what type of geometry is used and the bounding box of it.

``` r
library(sf)
```

    Linking to GEOS 3.13.0, GDAL 3.8.5, PROJ 9.5.1; sf_use_s2() is TRUE

``` r
library(sdf)

# get some sample data 
g <- sfdep::guerry[, "region"]

as_sdf(g)
```

    # A tibble: 85 × 2
       region                                                               geometry
       <fct>                                                          <MULTIPOLYGON>
     1 E      (((801150 2092615, 800669 2093190, 800688 2095430, 800780 2095795, 80…
     2 N      (((729326 2521619, 729320 2521230, 729280 2518544, 728751 2517520, 72…
     3 C      (((710830 2137350, 711746 2136617, 712430 2135212, 712070 2134132, 71…
     4 E      (((882701 1920024, 882408 1920733, 881778 1921200, 881526 1922332, 87…
     5 E      (((886504 1922890, 885733 1922978, 885479 1923276, 883061 1925266, 88…
     6 S      (((747008 1925789, 746630 1925762, 745723 1925138, 744216 1925236, 74…
     7 N      (((818893 2514767, 818614 2514515, 817900 2514467, 817327 2514945, 81…
     8 S      (((509103 1747787, 508820 1747513, 508154 1747093, 505861 1746627, 50…
     9 E      (((775400 2345600, 775068 2345397, 773587 2345177, 772940 2344780, 77…
    10 S      (((626230 1810121, 626269 1810496, 627494 1811321, 627681 1812424, 62…
    # ℹ 75 more rows

This is super cool because we can group by and summarize the data just
because we have those above functions defined for `sfc` objects (the
geometry column).

``` r
library(dplyr)
as_sdf(g) |> 
  group_by(region) |> 
  summarise(n = n())
```

    # A tibble: 5 × 3
      region     n                                                          geometry
      <fct>  <int>                                                    <MULTIPOLYGON>
    1 C         17 (((710830 2137350, 711746 2136617, 712430 2135212, 712070 213413…
    2 E         17 (((801150 2092615, 800669 2093190, 800688 2095430, 800780 209579…
    3 N         17 (((729326 2521619, 729320 2521230, 729280 2518544, 728751 251752…
    4 S         17 (((747008 1925789, 746630 1925762, 745723 1925138, 744216 192523…
    5 W         17 (((456425 2120055, 456229 2120382, 455943 2121064, 456070 212219…

Say we want to create a custom `Point` class that we want to be usable
by an `sdf` object. We can do this rather simply by creating the proper
generics. A `Point` will be a list of length 2 numeric vectors where the
first element is the x coordinate and the second element is the y
coordinate.

``` r
# create some points
pnt_data <- lapply(1:5, \(x) runif(2, 0, 90))

# create new vector class
pnts <- vctrs::new_vctr(pnt_data, class = "Point")

pnts
```

    <Point[5]>
    [1] 33.37356, 24.34350  80.77240, 41.22992  43.02110, 35.40899 
    [4] 26.096064, 1.978444 24.61735, 14.82955 

Now we can start defining our methods. `is_geometry()` should always
return TRUE for our type. We can do this like so:

``` r
is_geometry.Point <- function(x) inherits(x, "Point")
```

<div class="aside">

This method will only be dispatched on `Point`s so it will always
inherit the `Point` class. One could just as well always return `TRUE`

</div>

Next we need to define a method for the bounding box. This is the the
maximum and minimum x and y coordinates. Our method should iterate over
each point and extract the x and y into their own vector and return the
minimum and maxes. These need to be structured in a particular order.

``` r
bounding_box.Point <- function(.x) {
  x <- vapply(.x, `[`, numeric(1), 1)
  y <- vapply(.x, `[`, numeric(1), 2)
  
  c(xmin = min(x), ymin = min(y), xmax = max(x), ymax = max(y))
}
```

Lastly, we need a way to combine the points together. In this case, we
can just “combine” the points by finding the average point. This is not
geometrically sound but for the sake of example it suffices. Note that
the type it returns always has to be the same! There is not a compiler
forcing us, so we must force ourselves!

``` r
combine_geometry.Point <- function(.x) {
  x <- vapply(.x, `[`, numeric(1), 1)
  y <- vapply(.x, `[`, numeric(1), 2)
  
  vctrs::new_vctr(
    list(c(mean(x), mean(y))), 
    class = "Point"
    )
}
```

With only those 3 functions we’ve defined enough to create an `sdf`
object where the geometry column is a `Point` vector. To illustrate this
we can use the ggplot2 diamonds data set for example since it has nice x
and y coordinates.

First we create a data frame with a `Point` column.

``` r
data(diamonds, package = "ggplot2")

diamond_pnts <- diamonds |> 
  mutate(
    pnts = vctrs::new_vctr(
      purrr::map2(x, y, `c`),
      class = "Point"
    )
  ) |> 
  select(cut, pnts)

head(diamond_pnts)
```

    # A tibble: 6 × 2
      cut             pnts
      <ord>        <Point>
    1 Ideal     3.95, 3.98
    2 Premium   3.89, 3.84
    3 Good      4.05, 4.07
    4 Premium   4.20, 4.23
    5 Good      4.34, 4.35
    6 Very Good 3.94, 3.96

Next we cast it to an `sdf` object by using `as_sdf()`.

``` r
diamond_sdf <- as_sdf(diamond_pnts) 
diamond_sdf
```

    # A tibble: 53,940 × 2
       cut             pnts
       <ord>        <Point>
     1 Ideal     3.95, 3.98
     2 Premium   3.89, 3.84
     3 Good      4.05, 4.07
     4 Premium   4.20, 4.23
     5 Good      4.34, 4.35
     6 Very Good 3.94, 3.96
     7 Very Good 3.95, 3.98
     8 Very Good 4.07, 4.11
     9 Fair      3.87, 3.78
    10 Very Good 4.00, 4.05
    # ℹ 53,930 more rows

Notice that the printing method shows `Geometry Type: Point` and also
has a `Bounding box:`. That means we have effectively extended the `sdf`
class by implementing our own methods for the exported generic functions
from `sdf`. From that alone the `sdf` methods for dplyr can be used.

``` r
diamond_sdf |> 
  group_by(cut) |> 
  summarise(n = n())
```

    # A tibble: 5 × 3
      cut           n               pnts
      <ord>     <int>            <Point>
    1 Fair       1610 6.246894, 6.182652
    2 Good       4906 5.838785, 5.850744
    3 Very Good 12082 5.740696, 5.770026
    4 Premium   13791 5.973887, 5.944879
    5 Ideal     21551 5.507451, 5.520080

### Why this works

The dplyr `sdf` methods work like a charm because they use generic
functions. Take the `summarise()` method for example.

``` r
sdf:::summarise.sdf
```

    function (.data, ...) 
    {
        geom_col_name <- attr(.data, "geom_column")
        geom_col <- .data[[geom_col_name]]
        gd <- group_data(.data)
        summarized_geoms <- lapply(gd$.rows, function(ids) combine_geometry(geom_col[ids]))
        res <- NextMethod()
        res[[geom_col_name]] <- rlang::inject(c(!!!summarized_geoms))
        as_sdf(res)
    }
    <bytecode: 0x113a2c470>
    <environment: namespace:sdf>

This method uses the `combine_geometry()` generic function.
`combine_geometry()` takes a vector of geometries (as determined by
`is_geometry()`) and returns a single element. The summarise method does
not care which method is used. It only cares that the output is
consistent—in this case that a scalar value is outputted and that
multiple of those scalars can be combined using `c()`.

### Another example

[For a more detailed example check out the section in the README that
implements an sdf class for geos
geometry](https://github.com/JosiahParry/sdf#implementing-geos-generics).
If you’re interested in the details I recommend looking at the source
code it is very simple.

First look at the [generic method
definitions](https://github.com/JosiahParry/sdf/blob/main/R/generics.R).
Then look at the [`sf` compatibility
methods](https://github.com/JosiahParry/sdf/blob/main/R/sf-compat.R).
