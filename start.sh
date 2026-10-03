#!/bin/bash
export TZ="America/Sao_Paulo"
# ================================
# 🚀 BOT ZERO - Auto Restart
# ================================

GREEN='\033[1;32m'
BLUE='\033[0;34m'
NC='\033[0m' # Reset de cor

echo -e "${GREEN}Sistema de reinício automático ligado! Iniciando bot...${NC}"

while true
do
  if [ "$1" = "sim" ]; then
    node temux.js sim
  elif [ "$1" = "não" ]; then
    node temux.js não
  else
    node temux.js
  fi
  
  echo -e "${BLUE}Bot finalizou ou caiu. Reiniciando em 1s...${NC}"
  sleep 1
done
