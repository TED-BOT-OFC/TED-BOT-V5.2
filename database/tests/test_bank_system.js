'use strict';
const assert = require('assert');
const fs = require('fs');
const bank = require('../../arquivos/rpg/bankSystem');

const stateFile = bank.STATE_PATH;
const configFile = bank.BANK_CONFIG_PATH;
const backup = (file) => fs.existsSync(file) ? fs.readFileSync(file) : null;
const stateBackup = backup(stateFile);
const configBackup = backup(configFile);
function ctx(command, sender, args, replies, extra = {}) { return { command, sender, pushName: sender, args, prefix: '/', idempotencyKey: extra.idempotencyKey, reply: async (text) => { replies.push(String(text)); } }; }
async function run() {
  const replies = [];
  try {
    fs.rmSync(stateFile, { force: true });
    fs.rmSync(configFile, { force: true });
    const a = { id: 'a', nome: 'Alice', cash: 1000, bank: 0, assets: [], liabilities: [], history: [] };
    const b = { id: 'b', nome: 'Bob', cash: 0, bank: 0, assets: [], liabilities: [], history: [] };
    const initial = { players: { a, b }, banks: {}, bankTransactions: [], bankAudit: [], loans: {}, installments: {} };
    fs.writeFileSync(stateFile, JSON.stringify(initial));
    await bank.handleCommand(ctx('selecionar_banco', 'a', ['nubank'], replies));
    await bank.handleCommand(ctx('selecionar_banco', 'b', ['nubank'], replies));
    await bank.handleCommand(ctx('depositar_banco', 'a', ['500'], replies));
    await bank.handleCommand(ctx('pix', 'a', ['Bob', '100'], replies, { idempotencyKey: 'pix-test-1' }));
    const afterPix = JSON.parse(fs.readFileSync(stateFile));
    const feeCents = afterPix.bankTransactions.find((t) => t.type === 'PIX').feeCents;
    assert.strictEqual(Math.round(afterPix.players.a.bank * 100), 50000 - 10000 - feeCents);
    assert.strictEqual(Math.round(afterPix.players.b.bank * 100), 10000);
    await bank.handleCommand(ctx('pix', 'a', ['Bob', '100'], replies, { idempotencyKey: 'pix-test-1' }));
    const duplicate = JSON.parse(fs.readFileSync(stateFile));
    assert.strictEqual(Math.round(duplicate.players.b.bank * 100), 10000, 'PIX duplicado alterou saldo');
    const rate = bank.rate(1000);
    assert(rate <= 0.10, 'taxa acima do limite');
    await bank.handleCommand(ctx('emprestimo', 'a', ['100', '2'], replies));
    const loanState = JSON.parse(fs.readFileSync(stateFile));
    assert.strictEqual(Object.keys(loanState.loans).length, 1);
    assert.strictEqual(Object.values(loanState.installments).length, 2);
    assert(Object.values(loanState.installments).every((i) => i.amountCents > 0));
    console.log('TESTE BANCO: PASSOU');
  } finally {
    if (stateBackup === null) fs.rmSync(stateFile, { force: true }); else fs.writeFileSync(stateFile, stateBackup);
    if (configBackup === null) fs.rmSync(configFile, { force: true }); else fs.writeFileSync(configFile, configBackup);
  }
}
run().catch((e) => { console.error('TESTE BANCO: FALHOU'); console.error(e.stack || e); process.exitCode = 1; });
