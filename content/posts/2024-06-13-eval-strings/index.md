---
title: Evaluate strings as code
date: '2024-06-13'
taxonomies:
  categories:
    - r
---


Prompted by a post on Mastodon, I wanted to explore how to evaluate an R
string as code.

<iframe src="https://mastodon.cloud/@nxskok/112610810465402574/embed" width="400" allowfullscreen="allowfullscreen" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms">

</iframe>

This is generally a pretty common pattern that I have myself encountered
in the past and had to work through a solution for—many times.

## The Problem

How can I programatically create and execute valid R code?

## A solution

In this case, the problem space is quite simple:

1.  given a package name and
2.  a dataset name
3.  extract the dataset as an object

You can typically extract datasets from a package’s namespace. This
looks like `{pkgname}::{dataset}`.

We can create this string simply like so:

``` r
pkg <- "dplyr"
dataset <- "starwars"
dataset_str <- paste0(pkg, "::", dataset)
```

### Evaluating R code

Then, we need to be able to evaluate this code. I find
[`{rlang}`](https://rlang.r-lib.org/reference/) to be very handy.

To convert a string into an expression, use `rlang::parse_expr()`

``` r
library(rlang)
to_eval <- parse_expr(dataset_str)
to_eval
```

    dplyr::starwars

This creates a `language` type object.

We can now pass this into `rlang::eval_bare()` to evaluate the string
and run the R code and store the result into an R object.

``` r
result <- rlang::eval_bare(to_eval)
result
```

    # A tibble: 87 × 14
       name     height  mass hair_color skin_color eye_color birth_year sex   gender
       <chr>     <int> <dbl> <chr>      <chr>      <chr>          <dbl> <chr> <chr> 
     1 Luke Sk…    172    77 blond      fair       blue            19   male  mascu…
     2 C-3PO       167    75 <NA>       gold       yellow         112   none  mascu…
     3 R2-D2        96    32 <NA>       white, bl… red             33   none  mascu…
     4 Darth V…    202   136 none       white      yellow          41.9 male  mascu…
     5 Leia Or…    150    49 brown      light      brown           19   fema… femin…
     6 Owen La…    178   120 brown, gr… light      blue            52   male  mascu…
     7 Beru Wh…    165    75 brown      light      blue            47   fema… femin…
     8 R5-D4        97    32 <NA>       white, red red             NA   none  mascu…
     9 Biggs D…    183    84 black      light      brown           24   male  mascu…
    10 Obi-Wan…    182    77 auburn, w… fair       blue-gray       57   male  mascu…
    # ℹ 77 more rows
    # ℹ 5 more variables: homeworld <chr>, species <chr>, films <list>,
    #   vehicles <list>, starships <list>

## Alternative solution

Here is an alternative solution which uses the `data()` function. Then,
assuming the name of the dataset is created in the environment, fetches
it using `get()`.

``` r
englue("data({dataset}, package = '{pkg}')") |>
  parse_expr() |>
  eval_bare()

res <- get(dataset)
res
```

    # A tibble: 87 × 14
       name     height  mass hair_color skin_color eye_color birth_year sex   gender
       <chr>     <int> <dbl> <chr>      <chr>      <chr>          <dbl> <chr> <chr> 
     1 Luke Sk…    172    77 blond      fair       blue            19   male  mascu…
     2 C-3PO       167    75 <NA>       gold       yellow         112   none  mascu…
     3 R2-D2        96    32 <NA>       white, bl… red             33   none  mascu…
     4 Darth V…    202   136 none       white      yellow          41.9 male  mascu…
     5 Leia Or…    150    49 brown      light      brown           19   fema… femin…
     6 Owen La…    178   120 brown, gr… light      blue            52   male  mascu…
     7 Beru Wh…    165    75 brown      light      blue            47   fema… femin…
     8 R5-D4        97    32 <NA>       white, red red             NA   none  mascu…
     9 Biggs D…    183    84 black      light      brown           24   male  mascu…
    10 Obi-Wan…    182    77 auburn, w… fair       blue-gray       57   male  mascu…
    # ℹ 77 more rows
    # ℹ 5 more variables: homeworld <chr>, species <chr>, films <list>,
    #   vehicles <list>, starships <list>

There are issues with this in that you can also end up overwriting
things. We can create a new environment if we’d like as well.

``` r
# create a custom environment to store stuff
my_env <- rlang::env()

englue("data({dataset}, package = '{pkg}')") |>
  parse_expr() |>
  eval_bare(my_env)

# get it from the environment
res <- get(dataset, envir = my_env)
res
```

    # A tibble: 87 × 14
       name     height  mass hair_color skin_color eye_color birth_year sex   gender
       <chr>     <int> <dbl> <chr>      <chr>      <chr>          <dbl> <chr> <chr> 
     1 Luke Sk…    172    77 blond      fair       blue            19   male  mascu…
     2 C-3PO       167    75 <NA>       gold       yellow         112   none  mascu…
     3 R2-D2        96    32 <NA>       white, bl… red             33   none  mascu…
     4 Darth V…    202   136 none       white      yellow          41.9 male  mascu…
     5 Leia Or…    150    49 brown      light      brown           19   fema… femin…
     6 Owen La…    178   120 brown, gr… light      blue            52   male  mascu…
     7 Beru Wh…    165    75 brown      light      blue            47   fema… femin…
     8 R5-D4        97    32 <NA>       white, red red             NA   none  mascu…
     9 Biggs D…    183    84 black      light      brown           24   male  mascu…
    10 Obi-Wan…    182    77 auburn, w… fair       blue-gray       57   male  mascu…
    # ℹ 77 more rows
    # ℹ 5 more variables: homeworld <chr>, species <chr>, films <list>,
    #   vehicles <list>, starships <list>
