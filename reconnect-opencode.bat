@echo off
:: Reconecta à sessão tmux do OpenCode
wsl -d Ubuntu -- bash -c "tmux attach -t opencode"
