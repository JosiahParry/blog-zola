---
title: What's so special about `array`s?
date: 2023-06-11T00:00:00.000Z
taxonomies:
  categories:
    - r
---


I’m working on a new video about S3 objects in R and class inheritance /
hierarchy. One of my favorite functions for exploring objecs and their
structure is `unclass()`.

The documentation states

> `unclass` returns (a copy of) its argument with its class attribute
> removed. (It is not allowed for objects which cannot be copied, namely
> environments and external pointers.)

<div class="aside">

see `?unclass` and review `Details`

</div>

So, `unclass()` *should* remove the class of any and all objects. For
the sake clarity of this post I’m going to make a helper function.

``` r
class_unclass <- function(x) class(unclass(x))
```

This works for `factor`s which are just integer vectors which have the
attribute `levels`

``` r
class_unclass(factor())
```

    [1] "integer"

and `data.frame`s are lists (also technically a vector just not atomic
but instead recursive) with attributes `row.names`, and `names`.

``` r
class_unclass(data.frame())
```

    [1] "list"

But when we get down to `matrix` another poser type (just like
data.frame and factor pretending to be something they’re not actually),
we get something different.

``` r
class_unclass(matrix())
```

    [1] "matrix" "array" 

Well, why the heck is that? What about it makes it so special? Let’s
explore this a bit more.

The two things that make a matrix are the classes `c("matrix", "array")`
and the `dim` attribute which specifies the dimensions. Matrixes are two
dimensional arrays, by the way!

``` r
attributes(matrix())
```

    $dim
    [1] 1 1

What is weird is that you can make a matrix just by adding the `dim`
attribute to a vector.

``` r
m <- structure(integer(1), dim = c(1, 1))
class_unclass(m)
```

    [1] "matrix" "array" 

We didn’t even specify the class. Why does this happen?

And when we remove the dim attribute….

``` r
attr(m, "dim") <- NULL
class_unclass(m)
```

    [1] "integer"

we get an integer vector. This differs from the behavior of other
similar types. Recall that factors are `integer` vectors with an
attribute of `levels` that is a character vector.

So let’s try something here. Let’s create a factor from scratch.

``` r
structure(integer(), levels = character(), class = "factor")
```

    factor()
    Levels: 

Now, if the behavior is similar to `matrix` or `array` we would expect
that by omitting the `class` attribute R should reconstruct it.

``` r
structure(integer(), levels = character())
```

    integer(0)
    attr(,"levels")
    character(0)

Nope! Would you look at that!

[**@yjunechoe**](https://github.com/yjunechoe) pointed me to some
excerpts from [Deep R Programming](https://deepr.gagolewski.com/), a
book I wish I had read yesterday. It refers to these attributes as
“*special attributes*”. The author, [Marek
Gagolewski](https://www.gagolewski.com/) (author of
[`stringi`](https://stringi.gagolewski.com/), by the way), makes note of
this special behavior of matrix but leaves it at that.

To me, this is a fundamental inconsistency in the language. Either all
poser types (data.frame, matrix, factor, etc) should be automatically
created if their special attributes are set on the appropriate type or
not at all. What justification is there for *only* `matrix` having a
special behavior in `unclass()`?

To me, this warrants a bug report for `unclass()`. Based on the
documentation, `unclass()` should *always* remove the class attribute
from an object but it fails to do so for `arrays` and `matrix`es.

## Looking deeper!

With some further exploratory help of June we can see the internal
representation of these objects.

Let’s create an object with a `dim` attribute and a custom class.
Suprisingly, the custom class is respected and `matrix` and `array`
aren’t slapped on it.

``` r
x <- structure(integer(1), dim = c(1, 1), class = "meep")
class(x)
```

    [1] "meep"

If we look at the internal representation using `.Internal(inspect(x))`
we get to see some of the C goodies.

``` r
.Internal(inspect(x))
```

    @1310a0d28 13 INTSXP g0c1 [OBJ,REF(2),ATT] (len=1, tl=0) 0
    ATTRIB:
      @131097930 02 LISTSXP g0c0 [REF(1)] 
        TAG: @156014080 01 SYMSXP g1c0 [MARK,REF(2750),LCK,gp=0x4000] "dim" (has value)
        @1310a0cf0 13 INTSXP g0c1 [REF(65535)] (len=2, tl=0) 1,1
        TAG: @1560141d0 01 SYMSXP g1c0 [MARK,REF(33684),LCK,gp=0x6000] "class" (has value)
        @131092e08 16 STRSXP g0c1 [REF(65535)] (len=1, tl=0)
          @1462b34a8 09 CHARSXP g0c1 [REF(2),gp=0x60] [ASCII] [cached] "meep"

Just look to the right hand side of these gibberish. See that the `dim`
has a value of `1,1` and `class` has a value of `meep`. There is no
matrix or array or nothing.

Now we remove the `meep` class and check again.

``` r
class_unclass(x)
```

    [1] "matrix" "array" 

Boom matrix and array. But if we look at the internals…

``` r
.Internal(inspect(unclass(x)))
```

    @130620d60 13 INTSXP g0c1 [ATT] (len=1, tl=0) 0
    ATTRIB:
      @1305255b0 02 LISTSXP g0c0 [REF(1)] 
        TAG: @156014080 01 SYMSXP g1c0 [MARK,REF(2754),LCK,gp=0x4000] "dim" (has value)
        @1310a0cf0 13 INTSXP g0c1 [REF(65535)] (len=2, tl=0) 1,1

THEY AREN’T THERE!!!!!!
