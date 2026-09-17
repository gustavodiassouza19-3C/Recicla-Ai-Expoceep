@echo off
:: Inicia WSL2 com tmux e opencode
:: Use: clique duplo ou rode no prompt
echo Iniciando WSL2 + tmux + OpenCode...
wsl -d Ubuntu -- bash -c "tmux new -s opencode 'opencode'"
