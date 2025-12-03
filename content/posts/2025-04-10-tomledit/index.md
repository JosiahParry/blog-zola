---
title: Create and edit TOML in R with {tomledit}
date: 2025-04-10T00:00:00.000Z
author: Josiah Parry
taxonomies:
  categories:
    - r
    - toml
    - rust
    - extendr
---


[`{tomledit}`](https://extendr.github.io/tomledit/) v0.1.1 has found its
way onto
[CRAN](https://cran.r-project.org/web/packages/tomledit/index.html).

`{tomledit}` is a package for *creating* and *editing* TOML files from R
with support for reading as well.

The most basic use of `tomledit` is via `toml()`. `toml()` creates a
`Toml` object from named arguments passed to `...`.

``` r
library(tomledit)

toml(person = list(age = 30L, name = "Wilma"))
```

    <Toml>
    [person]
    age = 30
    name = "Wilma"

## v0.1.1 Features

This newest release supports the use of arrays with inline tables. This
feature comes as a request from [@dpastoor](https://github.com/dpastoor)
to support the experimental `rproject.toml` file for
[`rv`](https://github.com/A2-ai/rv).

<div class="aside">

I’m bullish on `rv` as a new alternative to `{renv}`. I think it will be
a great addition to the R community.

</div>

This new feature allows us to have a list of unnamed lists inside of our
TOML.

Below we create an item called `repositories` which is an array of
inline tables containing the alias and url to a CRAN-like repository.

Similarly, the `dependencies` item is an array of *both* inline-tables
and strings. This new feature adds more flexibility to the type of TOML
that we can create.

``` r
r_proj_toml <- list(
  name = "upgrade", 
  r_version = "4.4",
  repositories = list(
    list(alias = "gh-pkg-mirror", url = "https://a2-ai.github.io/gh-pkg-mirror/2024-02-22"),
    list(alias = "RSPM", url = "https://packagemanager.posit.co/cran/2024-02-22"),
    list(alias = "new-mirror", url = "https://a2-ai.github.io/gh-pkg-mirror/2024-12-04"),
    list(alias = "new-rspm", url = "https://packagemanager.posit.co/cran/2024-12-04")
  ),
  dependencies = list(
    list(name = "pmplots", repository = "new-mirror"),
    "pmtables",
    "bbr",
    list(name = "ggplot2", repository = "new-rspm")
  )
) 

as_toml(list(project = r_proj_toml))
```

    <Toml>
    [project]
    name = "upgrade"
    r_version = "4.4"
    repositories = [
        { alias = "gh-pkg-mirror", url = "https://a2-ai.github.io/gh-pkg-mirror/2024-02-22" },
        { alias = "RSPM", url = "https://packagemanager.posit.co/cran/2024-02-22" },
        { alias = "new-mirror", url = "https://a2-ai.github.io/gh-pkg-mirror/2024-12-04" },
        { alias = "new-rspm", url = "https://packagemanager.posit.co/cran/2024-12-04" }
    ]
    dependencies = [
        { name = "pmplots", repository = "new-mirror" },
        "pmtables",
        "bbr",
        { name = "ggplot2", repository = "new-rspm" }
    ]
