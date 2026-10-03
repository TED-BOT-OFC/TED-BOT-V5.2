'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const rpg = require('../../arquivos/rpg/rpgSystem');
const data = require('../../arquivos/rpg/rpgData');

const projectRoot = path.resolve(__dirname, '../..');
const targetIndex = fs.readFileSync(path.join(projectRoot, 'index.js'), 'utf8');
const targetCore = fs.readFileSync(path.join(projectRoot, 'arquivos/rpg/rpgSystem.js'), 'utf8');

const requiredCommands = [
  'modorpg', 'rpg', 'menurpg', 'menubrinks', 'menubrincadeira',
  'comprarescova', 'escovar', 'registrorpg', 'meupix', 'fazerpix',
  'trabalhar', 'ajudarpg', 'historicoxp', 'abrirbanco', 'minhaconta',
  'perfilrpg', 'statusrpg', 'avatar', 'sacarrpg', 'rendimentorpg',
  'saldorpg', 'depositarrpg', 'sairrpg', 'lojadeluxorpg', 'lojacasasrpg',
  'minhascasasrpg', 'comprarrpgcasa', 'garagemrpg', 'escolhervida',
  'modosvida', 'pagarfianca', 'assaltarrpg', 'apostarrpg', 'pagarpva',
  'comprarrpgdeluxo', 'meuscarros', 'transferirrpg', 'bancorpg', 'rankbancos'
];

for (const command of requiredCommands) {
  assert(rpg.RPG_COMMANDS.has(command), `Comando RPG ausente: ${command}`);
}

assert(targetIndex.includes('rpgSystem.handleCommand'), 'O index.js não encaminha comandos ao núcleo RPG.');
assert(targetIndex.includes('rpgManager.estaAtivo'), 'O controle de modo RPG por grupo não está conectado.');
assert(Array.isArray(data.HOUSES) && data.HOUSES.length === 15, 'O catálogo de casas deve ter 15 itens.');
assert(Array.isArray(data.LUXURY_CARS) && data.LUXURY_CARS.length === 15, 'O catálogo de carros deve ter 15 itens.');
assert(Array.isArray(data.BANKS) && data.BANKS.length === 5, 'O catálogo deve preservar 5 bancos.');
assert(Array.isArray(data.LIFE_MODES) && data.LIFE_MODES.length === 5, 'O RPG deve preservar 5 modos de vida.');

for (const fragment of [
  'Math.random() < 0.3',
  'Math.random() < 0.40',
  '15 * 60 * 1000',
  '24 * 60 * 60 * 1000',
  '5 * 1000',
  'value * 0.05',
  'interactiveButtons',
  'new Blob'
]) {
  assert(targetCore.includes(fragment), `Regra RPG ausente: ${fragment}`);
}

console.log(`COBERTURA RPG: PASSOU — ${requiredCommands.length} comandos, 30 itens de patrimônio e regras-chave verificadas.`);
