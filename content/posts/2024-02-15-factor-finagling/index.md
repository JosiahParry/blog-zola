---
title: Why do we sleep on factors?
subtitle: And how I wish things may behave?
date: '2024-02-15'
taxonomies:
  categories:
    - r
---


Factors are R’s version of an enum(eration) ([related
post](../posts/2023-11-10-enums-in-r/index.qmd)). They’re quite handy
and I think we can probably rely on them a bit more for enumations like
`c("a", "b", "c")`. Today I’ve been helping test a new possible feature
of [`extendr`](https://extendr.github.io/) involving factors and it has
me thinking a bit about some behaviors. Here are my extemporaneous
thoughts:

When we have a factor, how can we get new values and associate it with
an existing factor?

For example, we can create a factor of the alphabet.

``` r
f <- as.factor(letters)
f
```

     [1] a b c d e f g h i j k l m n o p q r s t u v w x y z
    Levels: a b c d e f g h i j k l m n o p q r s t u v w x y z

Say we have new values that match the level names and want to extend the
vector or create a new one based on the levels.

It would be *nice* if we could subset a factor based on the levels name

``` r
f["a"]
```

    [1] <NA>
    Levels: a b c d e f g h i j k l m n o p q r s t u v w x y z

but this gives us an `NA` because there is no named element `"a"`. If we
gave them names we could access it accordingly

``` r
setNames(f, letters)["a"]
```

    a 
    a 
    Levels: a b c d e f g h i j k l m n o p q r s t u v w x y z

but this would be antithetical to the efficiency of a factor.

<div class="aside">

They key selling point of a factor is that we define the levels only
once and associate them based on integer positions. This is far far far
faster and more memory efficient than repeating a value a sh!t ton of
times.

</div>

To create a new factor we have to pass in the levels accordingly:

``` r
factor("d", levels(f))
```

    [1] d
    Levels: a b c d e f g h i j k l m n o p q r s t u v w x y z

This is actually pretty nice! But I feel like there could be an even
better experience, though I don’t know what it would be…

If we wanted to extend the vector by combining the existing factor with
levels names we coerce to a character vector but instead of the levels
we get the integer values.

``` r
c(f, "a")
```

     [1] "1"  "2"  "3"  "4"  "5"  "6"  "7"  "8"  "9"  "10" "11" "12" "13" "14" "15"
    [16] "16" "17" "18" "19" "20" "21" "22" "23" "24" "25" "26" "a" 

To combine them we would need to ensure that they are both factors.

``` r
c(f, factor("d", levels(f)))
```

     [1] a b c d e f g h i j k l m n o p q r s t u v w x y z d
    Levels: a b c d e f g h i j k l m n o p q r s t u v w x y z

## Using `vctrs`

Upon further thinking, [`vctrs`](https://vctrs.r-lib.org/) tends to have
the type-safe behavior that I wish from R (and aspects of it should
probably be adapted into base R).

I think vctrs gets to the behavior that I want actually. If I have a
value and I use `vctrs::vec_cast()` and provide the existing factor
vector `f` to the `to` argument, it will use the levels.

``` r
vctrs::vec_cast("z", f)
```

    [1] z
    Levels: a b c d e f g h i j k l m n o p q r s t u v w x y z

But this *will not* succeed if we pass it a value that is unknown. The
error message is a bit cryptic and frankly feels a little pythonic in
the verbosity of the traceback! But this is type safe! And I LIKE IT!

``` r
vctrs::vec_cast("123", f)
```

    Error:
    ! Can't convert from `"123"` <character> to <factor<754f0>> due to loss of generality.
    • Locations: 1
