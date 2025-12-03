---
title: S7 & Options objects
subtitle: reimagining `readr::read_csv()`
author: Josiah Parry
date: 2024-11-21T00:00:00.000Z
taxonomies:
  categories:
    - pkg-dev
    - r
    - s7
---


One scenario I have encountered is the case case of
`readr::read_delim()`. The argument `col_names = TRUE` by default, can
be `FALSE`, or it can be a character vector of the names to provide to
the columns it is reading.

This is a bit stinky 😷. But it actually makes a lot of sense.

- `col_names = TRUE` (default): the file provides you with headers and
  you should use them
- `col_names = FALSE`: there are no column names we should make some
  placeholders for the data frame (because column names are necessary)
- `col_names = character()`: we want to provide column names directly
  (makes the most sense when there are no headers in the file)

This is a little confusing when we think deeply about the character
vector option.

There are two scenarios here:

1.  the file has column headers but we want to give it different ones
2.  the file has no column headers but we want to give it different ones

Lets explore how this works in practice a bit. Here we write `iris` to a
temporary file.

``` r
tmp <- tempfile(fileext = ".csv")
readr::write_csv(iris, tmp)
```

### Scenario 1: has headers give it different once

In the first scenario we can provide a character vector to `col_names`.

``` r
readr::read_csv(tmp, col_names = c("a", "b", "c", "d", "e"))
```

    # A tibble: 151 × 5
       a            b           c            d           e      
       <chr>        <chr>       <chr>        <chr>       <chr>  
     1 Sepal.Length Sepal.Width Petal.Length Petal.Width Species
     2 5.1          3.5         1.4          0.2         setosa 
     3 4.9          3           1.4          0.2         setosa 
     4 4.7          3.2         1.3          0.2         setosa 
     5 4.6          3.1         1.5          0.2         setosa 
     6 5            3.6         1.4          0.2         setosa 
     7 5.4          3.9         1.7          0.4         setosa 
     8 4.6          3.4         1.4          0.3         setosa 
     9 5            3.4         1.5          0.2         setosa 
    10 4.4          2.9         1.4          0.2         setosa 
    # ℹ 141 more rows

Here we can see that `col_names = character()` assumes that there isn’t
any header. To accomplish this we need to set `skip = 1` to not read the
first line where the header actually is.

``` r
readr::read_csv(
    tmp,
    col_names = c("a", "b", "c", "d", "e"),
    skip = 1
)
```

    # A tibble: 150 × 5
           a     b     c     d e     
       <dbl> <dbl> <dbl> <dbl> <chr> 
     1   5.1   3.5   1.4   0.2 setosa
     2   4.9   3     1.4   0.2 setosa
     3   4.7   3.2   1.3   0.2 setosa
     4   4.6   3.1   1.5   0.2 setosa
     5   5     3.6   1.4   0.2 setosa
     6   5.4   3.9   1.7   0.4 setosa
     7   4.6   3.4   1.4   0.3 setosa
     8   5     3.4   1.5   0.2 setosa
     9   4.4   2.9   1.4   0.2 setosa
    10   4.9   3.1   1.5   0.1 setosa
    # ℹ 140 more rows

### Scenario 2: has no headers give it names

Create a csv without the headers:

``` r
tmp <- tempfile(fileext = ".csv")
readr::write_csv(iris, tmp, col_names = FALSE)
```

<div class="aside">

In the case of `write_csv()` the argument `col_names` is *always* a
logical scalar

</div>

In this case, the `col_names = character()` works well!

``` r
readr::read_csv(
    tmp,
    col_names = c("a", "b", "c", "d", "e")
)
```

    # A tibble: 150 × 5
           a     b     c     d e     
       <dbl> <dbl> <dbl> <dbl> <chr> 
     1   5.1   3.5   1.4   0.2 setosa
     2   4.9   3     1.4   0.2 setosa
     3   4.7   3.2   1.3   0.2 setosa
     4   4.6   3.1   1.5   0.2 setosa
     5   5     3.6   1.4   0.2 setosa
     6   5.4   3.9   1.7   0.4 setosa
     7   4.6   3.4   1.4   0.3 setosa
     8   5     3.4   1.5   0.2 setosa
     9   4.4   2.9   1.4   0.2 setosa
    10   4.9   3.1   1.5   0.1 setosa
    # ℹ 140 more rows

Here are the other two scenarios:

``` r
readr::read_csv(tmp)
```

    # A tibble: 149 × 5
       `5.1` `3.5` `1.4` `0.2` setosa
       <dbl> <dbl> <dbl> <dbl> <chr> 
     1   4.9   3     1.4   0.2 setosa
     2   4.7   3.2   1.3   0.2 setosa
     3   4.6   3.1   1.5   0.2 setosa
     4   5     3.6   1.4   0.2 setosa
     5   5.4   3.9   1.7   0.4 setosa
     6   4.6   3.4   1.4   0.3 setosa
     7   5     3.4   1.5   0.2 setosa
     8   4.4   2.9   1.4   0.2 setosa
     9   4.9   3.1   1.5   0.1 setosa
    10   5.4   3.7   1.5   0.2 setosa
    # ℹ 139 more rows

``` r
readr::read_csv(tmp, col_names = FALSE)
```

    # A tibble: 150 × 5
          X1    X2    X3    X4 X5    
       <dbl> <dbl> <dbl> <dbl> <chr> 
     1   5.1   3.5   1.4   0.2 setosa
     2   4.9   3     1.4   0.2 setosa
     3   4.7   3.2   1.3   0.2 setosa
     4   4.6   3.1   1.5   0.2 setosa
     5   5     3.6   1.4   0.2 setosa
     6   5.4   3.9   1.7   0.4 setosa
     7   4.6   3.4   1.4   0.3 setosa
     8   5     3.4   1.5   0.2 setosa
     9   4.4   2.9   1.4   0.2 setosa
    10   4.9   3.1   1.5   0.1 setosa
    # ℹ 140 more rows

## Rethinking the arguments

To me, I think these arguments can be made less
[complected](https://www.infoq.com/presentations/Simple-Made-Easy/).

To me, there are two arguments burried in `col_names`:

1.  `header = TRUE`
2.  `col_names = NULL`

The imaginary `header` argument should be used to determine if there is
a header line to be used.

The `col_names`, which defaults to `NULL` can be used to provide an
alternative set of column names.

This approach would reduce the cognitive overload of `col_names`
argument.

However, there are

``` r
length(formals(readr::read_csv))
```

    [1] 20

arguments already….so… additional ones? That could be quite a bit.

## Options objects with S7

One alternative to having every option as a function argument is to
create an options object.

This is very common in the Rust ecosystem. There is a struct that is
used to define common settings. That object is then passed into methods
and functions.

We could consider doing something similar for the `readr::read_csv()`
function.

Lets take a look at the arguments for `readr::read_csv()`

``` r
rlang::fn_fmls_names(readr::read_csv)
```

     [1] "file"            "col_names"       "col_types"       "col_select"     
     [5] "id"              "locale"          "na"              "quoted_na"      
     [9] "quote"           "comment"         "trim_ws"         "skip"           
    [13] "n_max"           "guess_max"       "name_repair"     "num_threads"    
    [17] "progress"        "show_col_types"  "skip_empty_rows" "lazy"           

Many of these are booleans or scalars. I think we can improve this by
using S7 to store our options as a standalone object.

Looking at the arguments for `read_csv()` I think our options object can
be used for the following options:

- `locale`
- `na`
- `quote`
- `comment`
- `trim_ws`
- `skip`
- `n_max`
- `guess_max`
- `name_repair`
- `num_threads`
- `progress`
- `show_col_types`
- `skip_empty_rows`
- `lazy`

This will take 14 of the less commonly used arguments out of the
function!

The first thing we will do is define properties for each of these
values. It looks like a lot of code, but it is not so bad! This
boilerplate is going to give us a strongly typed object that will catch
errors early!

## S7 object properties

For each of the arguments we want to ensure that we:

- have a good default
- validate any input

First we’re looking at the `locale`. This one is quite a lot of
checking.

### Property validation

Ideally, the `locale` would be an S7 object so we could provide a
`class_locale` as our propery but we don’t have that luxury. So here, we
validate each of the components of the locale object.

``` r
library(S7)

.locale <- new_property(
  class_list,
  default = readr::default_locale(),
  validator = function(value) {
    dnames <- value$date_names
    invalid <- !rlang::is_character(dnames$mon, n = 12) ||
      !rlang::is_character(dnames$mon_ab, n = 12) ||
      !rlang::is_character(dnames$day, n = 7) ||
      !rlang::is_character(dnames$day_ab, n = 7) ||
      !rlang::is_character(dnames$am_pm, n = 2) || !rlang::is_scalar_character(value$date_format) || !rlang::is_scalar_character(value$time_format) || !rlang::is_scalar_character(value$decimal_mark) || !rlang::is_scalar_character(value$grouping_mark) || !rlang::is_scalar_character(value$tz) || !rlang::is_scalar_character(value$encoding)

    if (invalid) {
      "expected `locale` object"
    }
  }
)
```

Similarly, the argument for `name_repair` is not at all straight
forward. It can be one of any known strategy *or* it can be a function
that is applied to the names via `vctrs::vec_as_names()`.

``` r
.name_repair <- new_property(
  class_any,
  default = "unique",
  validator = function(value) {
    known_strategies <- c("minimal", "unique", "check_unique", "unique_quiet", "universal", "universal_quiet")

    if (rlang::is_function(value)) {
      fmls <- rlang::fn_fmls(value)
      if (sum(vapply(fmls,inherits, logical(1),  "name")) > 1) {
        "name repair function must only have one required argument"
      }
      return(NULL)
    }

    if (!rlang::is_scalar_character(value)) {
      "`name_repair` must be one of minimal, unique, check_unique, unique_quiet, universal, universal_quiet or a function"
    }

    if (!value %in% known_strategies) {
      sprintf("%s is not a valid `name_repair` value")
    }
  }
)
```

Here we define the validators for the rest of the options. These are all
quite straight forward and are mostly scalars.

<details open class="code-fold">
<summary>Code</summary>

``` r
.na <- new_property(
  class_character,
  default = c("", "NA")
)

.quote <- new_property(
  class_logical, 
  default = TRUE,
  validator = function(value) {
      if (!rlang::is_scalar_logical(value)) {
          "`quote` must be a scalar character"
      }
  }
)


.comment <- new_property(
  class_character,
  default = "\"",
  validator = function(value) {
    if (!rlang::is_scalar_character(value)) {
      "`comment` must be a scalar character"
    }
  }
)


.trim_ws <- new_property(
  class_logical, 
  default = TRUE,
  validator = function(value) {
      if (!rlang::is_scalar_logical(value)) {
          "`trim_ws` must be a scalar character"
      }
  }
)

.skip <- new_property(
  class_numeric,
  default = 0L,
  validator = function(value) {
      if (!rlang::is_scalar_integerish(value)) {
          "`skip` must be a scalar numeric"
      }
  }
)

.n_max <- new_property(
  class_numeric,
  default = Inf,
  validator = function(value) {
      if (!rlang::is_scalar_integerish(value)) {
          "`n_max` must be a scalar numeric"
      }
  }
)

.guess_max <- new_property(
  class_numeric,
  default = 1000L,
  validator = function(value) {
      if (!rlang::is_scalar_integerish(value)) {
          "`guess_max` must be a scalar numeric"
      }

  }
)

.n_max <- new_property(
  class_numeric,
  default = Inf,
  validator = function(value) {
      if (!rlang::is_scalar_integerish(value)) {
          "`n_max` must be a scalar numeric"
      }
  }
)

.num_threads <- new_property(
  class_numeric,
  default = readr::readr_threads(),
  validator = function(value) {
      if (!rlang::is_scalar_integerish(value)) {
          "`num_threads` must be a scalar numeric"
      }
  }
)

.progress <- new_property(
    class_logical, 
    default = readr::show_progress(),
    validator = function(value) {
         if (!rlang::is_scalar_logical(value)) {
          "`progress` must be a scalar logical"
      }
    }
)

.show_col_types <- new_property(
    class_logical, 
    default = readr::should_show_types() %||% TRUE,
    validator = function(value) {
         if (!rlang::is_scalar_logical(value)) {
          "`show_col_types` must be a scalar logical"
      }
    }
)

.skip_empty_rows <- new_property(
    class_logical, 
    default = TRUE,
    validator = function(value) {
         if (!rlang::is_scalar_logical(value)) {
          "`skip_empty_rows` must be a scalar logical"
      }
    }
)


.lazy <- new_property(
    class_logical, 
    default = readr::should_read_lazy(),
    validator = function(value) {
         if (!rlang::is_scalar_logical(value)) {
          "`lazy` must be a scalar logical"
      }
    }
)
```

</details>

## S7 `readr_opts` class

Now can actually define the S7 object class by passing in all of our new
property objects to the `properties` argument. Because we defined
defaults for every property we can construct a default option object.

``` r
class_readr_opts <- new_class(
  "readr_opts",
  properties = list(
    locale = .locale,
    na = .na,
    quote = .quote,
    # comment = .comment,
    trim_ws = .trim_ws,
    skip = .skip,
    n_max = .n_max,
    guess_max = .guess_max,
    name_repair = .name_repair,
    num_threads = .num_threads,
    progress = .progress,
    show_col_types = .show_col_types,
    skip_empty_rows = .skip_empty_rows,
    lazy = .lazy
  )
)

opts <- class_readr_opts()
opts
```

    <readr_opts>
     @ locale         :List of 7
     .. $ date_names   :List of 5
     ..  ..$ mon   : chr [1:12] "January" "February" "March" "April" ...
     ..  ..$ mon_ab: chr [1:12] "Jan" "Feb" "Mar" "Apr" ...
     ..  ..$ day   : chr [1:7] "Sunday" "Monday" "Tuesday" "Wednesday" ...
     ..  ..$ day_ab: chr [1:7] "Sun" "Mon" "Tue" "Wed" ...
     ..  ..$ am_pm : chr [1:2] "AM" "PM"
     ..  ..- attr(*, "class")= chr "date_names"
     .. $ date_format  : chr "%AD"
     .. $ time_format  : chr "%AT"
     .. $ decimal_mark : chr "."
     .. $ grouping_mark: chr ","
     .. $ tz           : chr "UTC"
     .. $ encoding     : chr "UTF-8"
     .. - attr(*, "class")= chr "locale"
     @ na             : chr [1:2] "" "NA"
     @ quote          : logi TRUE
     @ trim_ws        : logi TRUE
     @ skip           : int 0
     @ n_max          : num Inf
     @ guess_max      : int 1000
     @ name_repair    : chr "unique"
     @ num_threads    : int 8
     @ progress       : logi FALSE
     @ show_col_types : logi FALSE
     @ skip_empty_rows: logi TRUE
     @ lazy           : logi FALSE

<div class="aside">

## Update 2025-12-03

Due to a change in {S7}, “comment” is considered a “forbidden”
(reserved) word and cannot be used. See [issue
579](https://github.com/RConsortium/S7/issues/579).

</div>

We can access each of these properties using the `@` accessor. For
example, if we want the `locale`:

``` r
opts@locale
```

    <locale>
    Numbers:  123,456.78
    Formats:  %AD / %AT
    Timezone: UTC
    Encoding: UTF-8
    <date_names>
    Days:   Sunday (Sun), Monday (Mon), Tuesday (Tue), Wednesday (Wed), Thursday
            (Thu), Friday (Fri), Saturday (Sat)
    Months: January (Jan), February (Feb), March (Mar), April (Apr), May (May),
            June (Jun), July (Jul), August (Aug), September (Sep), October
            (Oct), November (Nov), December (Dec)
    AM/PM:  AM/PM

## Simplifying `readr::read_csv()`

Now, imagine if we can use this as a way to simplify the
`readr::read_csv()` function. The function definition can now look like:

``` r
read_csv <- function(
  file,
  col_names = TRUE,
  col_types = NULL,
  col_select = NULL,
  id = NULL,
  options = class_readr_opts()
) {
    # function logic
}
```

This greatly reduces the cognitive load for end users and it consolides
options specification into a single object.
