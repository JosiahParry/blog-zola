# Default recipe - list all available recipes
default:
    @just --list

# Render a single post using quarto
render post:
    #!/usr/bin/env bash
    if [ -f "content/posts/{{post}}/index.qmd" ]; then
        cd content/posts/{{post}} && quarto render index.qmd --to commonmark+yaml_metadata_block
    elif [ -f "content/posts/{{post}}.qmd" ]; then
        mkdir -p content/posts/{{post}}
        quarto render content/posts/{{post}}.qmd --to commonmark+yaml_metadata_block --output-dir content/posts/{{post}} --output index.md
    else
        echo "Error: Could not find content/posts/{{post}}/index.qmd or content/posts/{{post}}.qmd"
        exit 1
    fi

# Run Tailwind and Zola in parallel
dev:
    npm run dev & zola serve
