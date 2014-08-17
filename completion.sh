###-begin-sx-completion-###
if type complete &>/dev/null; then
    local si="$IFS"
    _sx_complete() {
        COMPREPLY=()
        local word="${COMP_WORDS[COMP_CWORD]}"
        local completions="$(sx --complete "$word")"
        IFS=$'\n' COMPREPLY=($(compgen -W "$completions" -- "$word"))
        IFS="$si"
    }
    complete -f -F _sx_complete sx
elif type compctl &>/dev/null; then
    si="$IFS"
   _sx_complete() {
        local word completions
        word="$1"
        completions="$(sx --complete "${word}")"
        IFS=$'\n' reply=( "${(ps:\n:)completions}" )
        IFS="$si"
    }
    compctl -f -K _sx_complete sx 
fi
###-end-sx-completion-###
