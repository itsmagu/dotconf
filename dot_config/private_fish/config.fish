if status is-interactive
    # Commands to run in interactive sessions can go here
end
set fish_greeting

setxkbmap se -option 'caps:escape'

set PNPM_HOME "/home/$(whoami)/.local/share/pnpm"
set PATH "$PATH:$PNPM_HOME"