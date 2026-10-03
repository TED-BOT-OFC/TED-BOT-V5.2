'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const economy = require('../../arquivos/rpg/economySystem');
const source = fs.readFileSync(path.join(__dirname, '../../arquivos/rpg/rpgSystem.js'), 'utf8');
for (const command of economy.COMMANDS) {
  assert(source.includes('${prefix}' + command), `comando ausente no menu: ${command}`);
}
assert(source.includes('economySync.syncLegacyWrite'), 'salvamento legado não sincroniza');
assert(source.includes('economySync.syncLegacyRead'), 'leitura legada não sincroniza');
console.log(`TESTE MENU/SINCRONIA: PASSOU — ${economy.COMMANDS.size} comandos econômicos listados`);
