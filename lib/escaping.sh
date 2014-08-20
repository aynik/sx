# -*- mode: sh -*-
#
# sx-escape-magic - zle tweak for sx command line arguments
#
# Usage:
#     autoload -Uz sx-escape-magic
#     sx-escape-magic
#

sx-escape-magic.self-insert() {
    emulate -L zsh
    setopt extendedglob
    local self_insert_function
    zstyle -s ':sx-escape-magic' self-insert-function self_insert_function

    if [[ "$KEYS" == [\[\]\(\){}~^\;\*]* ]] && {
        local qkey="${(q)KEYS}"
        [[ "$KEYS" != "$qkey" ]]
    } && {
        local lbuf="$LBUFFER$qkey"
        [[ "${(Q)LBUFFER}$KEYS" == "${(Q)lbuf}" ]]
    } && {
        local -a words
        words=("${(@Q)${(z)lbuf}}")
        [[ "$words[(i)(*/|)sx(|-[^/]##)]" -le $#words ]]
    }
    then
        local i
        i="$words[(I)([;(){\&]|\&[\&\!]|\|\||[=<>]\(*)]"
        if [[ $i -gt 0 ]]; then
            shift $((i-1)) words
            if [[ "$words[1]" == [\=\<\>]\(* ]]; then
                words[1]="${words[1]#[=<>]\(}"
            else
                shift words
            fi
        fi
        while [[ "$words[1]" == [A-Za-z_][A-Za-z0-9_]#=* ]]; do
            shift words
        done
        LBUFFER="$LBUFFER\\"
    fi
    zle "$self_insert_function"
}

sx-escape-magic.on() {
    emulate -L zsh
    local self_insert_function="${$(zle -lL | awk \
        '$1=="zle"&&$2=="-N"&&$3=="self-insert"{print $4;exit}'):-.self-insert}"

    [[ "$self_insert_function" == sx-escape-magic.self-insert ]] &&
        return 0

    # For url-quote-magic which does not zle -N itself
    zle -la "$self_insert_function" || zle -N "$self_insert_function"

    zstyle ':sx-escape-magic' self-insert-function "$self_insert_function"

    zle -A sx-escape-magic.self-insert self-insert
    return 0
}

sx-escape-magic.off() {
    emulate -L zsh
    local self_insert_function
    zstyle -s ':sx-escape-magic' self-insert-function self_insert_function

    [[ -n "$self_insert_function" ]] &&
        zle -A "$self_insert_function" self-insert
    return 0
}

zle -N sx-escape-magic.self-insert
zle -N sx-escape-magic.on
zle -N sx-escape-magic.off

sx-escape-magic() {
        sx-escape-magic.on
}

[[ -o kshautoload ]] || sx-escape-magic "$@"

