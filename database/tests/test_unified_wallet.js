'use strict';
const assert = require('assert');
const fs = require('fs');
const economy = require('../../arquivos/rpg/economySystem');
const files = [economy.STATE_PATH, economy.TX_PATH, require('path').join(__dirname, '../../database/economy_audit.json')];
const backups = files.map((file) => [file, fs.existsSync(file) ? fs.readFileSync(file) : null]);
function ctx(command, sender, args) { return { command, sender, args, prefix: '.', pushName: sender, reply: async (message) => message }; }
async function run() {
  try {
    for (const file of files) fs.rmSync(file, { force: true });
    await economy.handleCommand(ctx('saldo', 'wallet-a@s.whatsapp.net', []));
    await economy.handleCommand(ctx('saldo', 'wallet-b@s.whatsapp.net', []));
    await economy.handleCommand(ctx('selecionar_banco', 'wallet-a@s.whatsapp.net', ['nubank']));
    await economy.handleCommand(ctx('depositar_banco', 'wallet-a@s.whatsapp.net', ['500']));
    const before = JSON.parse(fs.readFileSync(economy.STATE_PATH)).players['wallet-a@s.whatsapp.net'];
    assert.strictEqual(before.cash, 500);
    assert.strictEqual(before.bank, 500);
    await economy.handleCommand(ctx('transferir_banco', 'wallet-a@s.whatsapp.net', ['wallet-b@s.whatsapp.net', '100']));
    const after = JSON.parse(fs.readFileSync(economy.STATE_PATH)).players;
    assert.strictEqual(after['wallet-a@s.whatsapp.net'].bank, 399);
    assert.strictEqual(after['wallet-b@s.whatsapp.net'].bank, 100);
    console.log('TESTE CARTEIRA ÚNICA: PASSOU');
  } finally {
    for (const [file, backup] of backups) { if (backup === null) fs.rmSync(file, { force: true }); else fs.writeFileSync(file, backup); }
  }
}
run().catch((error) => { console.error('TESTE CARTEIRA ÚNICA: FALHOU'); console.error(error.stack || error); process.exitCode = 1; });
