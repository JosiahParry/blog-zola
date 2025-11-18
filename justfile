# Render a single post using rmarkdown
render post:
    cd content/posts/{{post}} && R -q --vanilla -e 'knitr::opts_chunk$set(comment=""); rmarkdown::render("index.qmd", rmarkdown::md_document("commonmark", preserve_yaml = TRUE))'

# Render all posts
render-all:
    for dir in content/posts/*/; do \
        if [ -f "$dir/index.qmd" ]; then \
            (cd "$dir" && R -q --vanilla -e 'knitr::opts_chunk$set(comment=""); rmarkdown::render("index.qmd", rmarkdown::md_document("commonmark", preserve_yaml = TRUE))'); \
        fi \
    done
