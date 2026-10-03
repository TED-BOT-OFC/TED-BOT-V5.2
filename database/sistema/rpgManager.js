'use strict';

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'rpgConfig.json');

function loadConfig() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return {};
    const data = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch (error) {
    console.error('[RPG] Não foi possível ler rpgConfig.json:', error.message);
    return {};
  }
}

function saveConfig(config) {
  const temporaryPath = `${CONFIG_PATH}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(config, null, 2), 'utf8');
  fs.renameSync(temporaryPath, CONFIG_PATH);
}

function estaAtivo(groupId) {
  const config = loadConfig();
  return config[groupId] === true;
}

function ativar(groupId) {
  const config = loadConfig();
  config[groupId] = true;
  saveConfig(config);
}

function desativar(groupId) {
  const config = loadConfig();
  config[groupId] = false;
  saveConfig(config);
}

module.exports = { estaAtivo, ativar, desativar, CONFIG_PATH };
