---
title: 'Feeling rusty: counting characters'
date: 2023-04-13T00:00:00.000Z
taxonomies:
  categories:
    - rust
    - r
---


I’m working on a new video for you all on GeoHashes. As I keep working
on my slides and script I keep finding new things I want to explore or
that I need to write. Recently, that was to compare multiple geohashes
to a known geohash. The goal of that is to count how many of the first
characters matched a reference. If there are matching leading characters
between a geohashes that means that they are in the same geohash at some
level of precision. Knowing that number of shared characters tells us at
what level of precision they coexist. The challenge is that there isn’t
any easy way to do that in base R or packages I could find. So, what do
we do when we can’t find something to do a task for us? We make it.

For these small tasks that require a lot of iteration and counting, I’ve
been leaning on Rust a lot more. I find it actually *easier* for the
more computer sciency type tasks.

Here’s how I solved it.

Define two geohashes to compare:

``` rust
let x = "drt2yyy1cxwy";
let y = "drt2yywg71qc";
```

Next we want to iterate over each of these string slices (represented as
`&str`). Typically we’d use the `.iter()` or `.into_iter()` methods to
iterate over objects but these are slices and not a vector or array.

<div class="aside">

`.into_iter()` consumes the object you’re iterating over whereas
`.iter()` iterates over it without consuming. The former provides
“owned” objects at each iteration while the latter provides references”

</div>

We iterate through the characters of a slice using `.chars()`. We’ll
want to iterate through both of them at the same time. Then, for each
iteration, we check to see if they’re the same.

This will instantiate an iterator over each of the strings where each
element is a `char`

``` rust
  x.chars()
  y.chars()
```

<div>

> **Important**
>
> This will not compile, it’s for illustration

</div>

These iterators will only be able to be iterated over one at a time
using `.map()` and the like. We can combine them into one iterator using
the `.zip()` method which *zips* them together into one iterator.

``` rust
x.chars().zip(y.chars())
```

This is good! Now we have a single iterator to work through. Each
element in the resultant iterator will be a tuple with the first element
`.0` being the first character of `x` and `.1` being the first character
of `y`.

<div class="aside">

Tuple’s look like `let z = (x, y);` and are accessed by position like
`z.0` and `z.1`.

</div>

The approach I took here is to use the `.take_while()` method which
takes a closure that returns a `bool` (`true` or `false`). It’ll return
another iterator that contains only the elements where that statement
was true.

``` rust
x.chars().zip(y.chars())
    .take_while(|a| a.0 == a.1);
```

<div class="aside">

A closure is like an anonymous function. It’s arguments are defined
between `| |` and the evaluated expression is to the right of it.

</div>

Here, the closure has the argument `|a|` which is the tuple from `x` and
`y`. It checks to see if the characters are equal. The resultant
iterator now only has elements for matching characters. We don’t really
need to iterate over it, but rather we just need to count how many items
are in the iterator.

We can use the `.count()` method for that. Shouts out to the Rust
discord for helping me with this one.

<div class="aside">

Previously I used a `fold()` method that looked like
`.fold(0, |acc, _| acc + 1)` which worked but was less “elegant”

</div>

``` rust
let res = x.chars().zip(y.chars())
    .take_while(|a| a.0 == a.1)
    .count();
```

Let’s wrap this into a function:

``` rust
fn count_seq_chars(x: &str, y: &str) -> usize {
  x.chars().zip(y.chars())
      .take_while(|a| a.0 == a.1)
      .count()
}
```

We can make it available in R using
[`rextendr::rust_function()`](https://extendr.github.io/rextendr/reference/rust_source.html).

``` r
rextendr::rust_function("
fn count_seq_chars(x: &str, y: &str) -> usize {
  x.chars().zip(y.chars())
      .take_while(|a| a.0 == a.1)
      .count()
}")

count_seq_chars("drt2yyy1cxwy", "drt2yywg71qc")
```

    [1] 6

But this isn’t vectorized yet. It only works on two scalars. We can
improve it by changing the `x` argument to take a vector of strings
`Vec<String>`.

<div class="aside">

We have to use `Vec<String>` instead of `Vec<&str>` because `rextendr`
does not know how to take a vector of string slices.

</div>

Essentially, what we do next is take this vector of strings, iterate
over it, convert the string to a `&str` then just do what we did before!

We use `.map()` to apply an expression over each element of `x`. The
closure takes a single argument `xi` which represents the ith element of
`x`. We convert it to a slice, then iterate over it’s characters and the
rest should be similar in there!

Lastly, we collect the resultant `usize` objects into a vector of them
`Vec<usize>`.

``` rust
  fn count_seq_chars_to_ref(x: Vec<String>, y: &str) -> Vec<usize> {
    x.into_iter()
        .map(|xi| 
            xi.as_str().chars().zip(y.chars())
            .take_while(|a| a.0 == a.1)
            .count()
        )
        .collect()
  }
```

<div class="aside">

Note that the function definition has `-> Vec<usize>` this defines what
the ouput object type will be. Something definitely unfamiliar for
Rusers!

</div>

Again, we can use `rextendr` to wrap this into a single R function that
we can use.

``` r
rextendr::rust_function("
  fn count_seq_chars_to_ref(x: Vec<String>, y: &str) -> Vec<usize> {
    x.into_iter()
        .map(|xi| 
            xi.as_str().chars().zip(y.chars())
            .take_while(|a| a.0 == a.1)
            .count()
        )
        .collect()
  }
")

count_seq_chars_to_ref("drt2yyy1cxwy", "drt2yywg71qc")
```

    [1] 6

Let’s test this and see how it works with a larger dataset of 100,000
strings. We create a bunch of sample strings that sample a-e and 1-5,
are sorted, then pasted together. We then can compare them to the
reference string `"abcd123"`.

``` r
sample_strings <- replicate(100000, paste0(
  paste0(sort(sample(letters[1:5], 4)), collapse = ""),
  paste0(sample(1:5, 3), collapse = ""),
  collapse = ""
))


head(sample_strings)
```

    [1] "acde254" "bcde324" "abce152" "abde231" "abde543" "abcd253"

``` r
count_seq_chars_to_ref(head(sample_strings), "abcd123")
```

    [1] 1 0 3 2 2 4

[Philippe Massicotte](https://www.pmassicotte.com/) was kind enough to
provide an R only example in a reply to a tweet of mine. We can compare
the speed of the two implementations. A pure Rust implementation and an
R native implementation.

{{< tweet philmassicotte 1646191363728240642 >}}

Here we wrap his implementation into a function `count_seq_lapply()`.
I’ve modified this implementation to handle the scenario where the first
element is not true so we don’t get a run length of `FALSE` elements.

``` r
count_seq_lapply <- function(x, ref) {
  res <- lapply(x, \(x) {
    a <- unlist(strsplit(x, ""))
    x <- unlist(strsplit(ref, ""))
    
    comparison <- a == x
    
    if (!comparison[1]) return(0)
    
    rle(comparison)$lengths[1]
  })
  
  unlist(res)
}

count_seq_lapply(head(sample_strings), "abcd123")
```

    [1] 1 0 3 2 2 4

As you can see his works just as well and frankly, better. That’s
because he inherits the NA handling of the base R functions he is using.
If any NA are introduced into a pure Rust implementation without using
[extendr](https://extendr.github.io/extendr/extendr_api/) types and
proper handling you’ll get a `panic!` which will cause the R function to
error.

``` r
bench::mark(
  lapply = count_seq_lapply(sample_strings, "abcd123"), 
  rust = count_seq_chars_to_ref(sample_strings, "abcd123")
  )
```

    Warning: Some expressions had a GC in every iteration; so filtering is
    disabled.

    # A tibble: 2 × 6
      expression      min   median `itr/sec` mem_alloc `gc/sec`
      <bch:expr> <bch:tm> <bch:tm>     <dbl> <bch:byt>    <dbl>
    1 lapply        1.17s    1.17s     0.853    1.57MB     47.8
    2 rust        53.72ms  53.92ms    18.5     781.3KB      0  

The R implementation is still super fast. It’s just that Rust is also
super super fast!

------------------------------------------------------------------------

## Addendum: ChatGPT rules apparently

So I asked Chat GPT to rewrite my above function but using C++ and the
results are absolutely startling!

``` cpp
std::vector<size_t> count_seq_chars_to_ref_cpp(std::vector<std::string> x, const std::string& y) {
  std::vector<size_t> result;
  for (const auto& xi : x) {
    size_t count = 0;
    auto it_x = xi.begin();
    auto it_y = y.begin();
    while (it_x != xi.end() && it_y != y.end() && *it_x == *it_y) {
      ++count;
      ++it_x;
      ++it_y;
    }
    result.push_back(count);
  }
  return result;
}
```

This is the code it wrote after only one prompt. I didn’t correct it. It
worked right off the rip. I did, however, provide ChatGPT with my above
rust code.

Let’s bench mark this.

``` r
Rcpp::cppFunction("std::vector<size_t> count_seq_chars_to_ref_cpp(std::vector<std::string> x, const std::string& y) {
  std::vector<size_t> result;
  for (const auto& xi : x) {
    size_t count = 0;
    auto it_x = xi.begin();
    auto it_y = y.begin();
    while (it_x != xi.end() && it_y != y.end() && *it_x == *it_y) {
      ++count;
      ++it_x;
      ++it_y;
    }
    result.push_back(count);
  }
  return result;
}")

bench::mark(
  GPT_cpp = count_seq_chars_to_ref_cpp(sample_strings, "abcd123"),
  rust = count_seq_chars_to_ref(sample_strings, "abcd123")
)
```

    # A tibble: 2 × 6
      expression      min   median `itr/sec` mem_alloc `gc/sec`
      <bch:expr> <bch:tm> <bch:tm>     <dbl> <bch:byt>    <dbl>
    1 GPT_cpp      2.48ms   2.66ms     375.      781KB     4.58
    2 rust        53.46ms  53.84ms      18.5     781KB     2.06

Absolutely friggin’ bonkers!! If I was better at concurrency and
threading I’d try to compare that but alas. I’m stopping here :)

## Double addendum….

Okay, after consulting the gods in the extendr discord they pointed to a
number of ways in which this can be improved and made faster.

First off, `rust_function()` compiled using the `dev` profile first.
This is used for debugging. If we set `profile = "release"` we compile
the function for release performance. H/t to
[@iliak](https://github.com/ilia).

``` r
rextendr::rust_function("
  fn count_seq_chars_to_ref(x: Vec<String>, y: &str) -> Vec<usize> {
    x.into_iter()
        .map(|xi| 
            xi.as_str().chars().zip(y.chars())
            .take_while(|a| a.0 == a.1)
            .count()
        )
        .collect()
  }
",
profile = "release"
)
```

    ℹ build directory: '/private/var/folders/wd/xq999jjj3bx2w8cpg7lkfxlm0000gn/T/RtmprOzrsM/file856732f6f8f'

    ✔ Writing '/private/var/folders/wd/xq999jjj3bx2w8cpg7lkfxlm0000gn/T/RtmprOzrsM/file856732f6f8f/target/extendr_wrappers.R'

``` r
bench::mark(
  GPT_cpp = count_seq_chars_to_ref_cpp(sample_strings, "abcd123"),
  rust = count_seq_chars_to_ref(sample_strings, "abcd123")
)
```

    # A tibble: 2 × 6
      expression      min   median `itr/sec` mem_alloc `gc/sec`
      <bch:expr> <bch:tm> <bch:tm>     <dbl> <bch:byt>    <dbl>
    1 GPT_cpp      2.49ms    2.7ms     363.      781KB     6.19
    2 rust         8.67ms   9.36ms      98.1     781KB     2.04

This brings the run time down a whole lot. The next enhancement pointed
out is that both `Vec<String>` and `Vec<usize>` use copies. Instead, I
should be using `extendr` objects `Strings` and `Integers`. Here I:

- change the `x` to `Strings`
- cast usize to i32 using `.count() as i32` (h/t
  [@multimeric](https://github.com/multimeric))
- use `collect_robj()` instead of `collect()` so that it turns into an
  `Robj` (R object)

``` r
rextendr::rust_function(
"    fn count_seq_chars_to_ref(x: Strings, y: &str) -> Robj {
     x.into_iter()
        .map(|xi| 
          xi.as_str().chars().zip(y.chars())
            .take_while(|a| a.0 == a.1)
            .count() as i32
        )
        .collect_robj()
        
  }",
profile = "release"
)
```

    ℹ build directory: '/private/var/folders/wd/xq999jjj3bx2w8cpg7lkfxlm0000gn/T/RtmprOzrsM/file856732f6f8f'

    ✔ Writing '/private/var/folders/wd/xq999jjj3bx2w8cpg7lkfxlm0000gn/T/RtmprOzrsM/file856732f6f8f/target/extendr_wrappers.R'

``` r
bench::mark(
  GPT_cpp = count_seq_chars_to_ref_cpp(sample_strings, "abcd123"),
  rust = count_seq_chars_to_ref(sample_strings, "abcd123")
)
```

    # A tibble: 2 × 6
      expression      min   median `itr/sec` mem_alloc `gc/sec`
      <bch:expr> <bch:tm> <bch:tm>     <dbl> <bch:byt>    <dbl>
    1 GPT_cpp      2.49ms   2.69ms      356.     781KB     6.18
    2 rust         1.72ms   1.76ms      563.     391KB     4.49

Now rust is faster.

Further, shout out to [@cgmossa](https://github.com/CGMossa) for this
last implementation that shaves off some more time by using `Integers`
specifically.

``` r
rextendr::rust_function("
  fn count_seq_chars_to_ref(x: Strings, y: &str) -> Integers {
      x.iter()
          .map(|xi| xi.chars().zip(y.chars()).take_while(|a| a.0 == a.1).count())
          .map(|x| Rint::from(x as i32))
          .collect()
  }
",
profile = "release")
```

    ℹ build directory: '/private/var/folders/wd/xq999jjj3bx2w8cpg7lkfxlm0000gn/T/RtmprOzrsM/file856732f6f8f'

    ✔ Writing '/private/var/folders/wd/xq999jjj3bx2w8cpg7lkfxlm0000gn/T/RtmprOzrsM/file856732f6f8f/target/extendr_wrappers.R'

``` r
bench::mark(
  GPT_cpp = count_seq_chars_to_ref_cpp(sample_strings, "abcd123"),
  rust = count_seq_chars_to_ref(sample_strings, "abcd123")
)
```

    # A tibble: 2 × 6
      expression      min   median `itr/sec` mem_alloc `gc/sec`
      <bch:expr> <bch:tm> <bch:tm>     <dbl> <bch:byt>    <dbl>
    1 GPT_cpp       2.5ms   2.68ms      368.     781KB     6.20
    2 rust         1.75ms   1.79ms      556.     391KB     6.18
