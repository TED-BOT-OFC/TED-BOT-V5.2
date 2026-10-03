'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const economy = require('../../arquivos/rpg/economySystem');

const db = path.join(__dirname, '../../database');
const files = [economy.STATE_PATH, economy.TX_PATH, path.join(db, 'economy_audit.json'), path.join(db, 'economy.lock')];
const backups = files.map((file) => [file, fs.existsSync(file) ? fs.readFileSync(file) : null]);

async function run() {
  try {
    for (const file of files) fs.rmSync(file, { force: true });
    const state = economy.defaultState();
    assert(state.players && state.companies && state.prices, 'estado econômico incompleto');
    const before = state.prices.petroleo.price;
    economy.tick(state, 30);
    assert(state.clock.day >= 31, 'calendário não avançou');
    assert(state.prices.petroleo.price > 0, 'preço inválido após tick');
    assert(before > 0, 'preço inicial inválido');
    assert(economy.isEconomyCommand('comprar_acao'), 'comando de ações ausente');
    assert(!economy.isEconomyCommand('comando_inexistente'), 'comando desconhecido aceito');
    console.log('TESTE ECONOMIA: PASSOU');
  } finally {
    for (const [file, backup] of backups) {
      if (backup === null) fs.rmSync(file, { force: true });
      else fs.writeFileSync(file, backup);
    }
  }
}
run().catch((error) => { console.error('TESTE ECONOMIA: FALHOU'); console.error(error.stack || error); process.exitCode = 1; });
