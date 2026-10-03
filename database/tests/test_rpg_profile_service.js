'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const profile = require('../../arquivos/rpg/rpgProfileService');

const files = [
  profile.STATE_PATH,
  path.join(__dirname, '../../database/economy_transactions.json'),
  path.join(__dirname, '../../database/economy_audit.json'),
  profile.LEGACY_RPG_PATH
];
const backups = files.map((file) => [file, fs.existsSync(file) ? fs.readFileSync(file) : null]);

function restore() {
  for (const [file, backup] of backups) {
    if (backup === null) fs.rmSync(file, { force: true });
    else fs.writeFileSync(file, backup);
  }
}

function run() {
  try {
    for (const file of files) fs.rmSync(file, { force: true });

    assert.deepStrictEqual(profile.levelInfo(0), {
      xp: 0,
      level: 1,
      nextLevel: 2,
      currentLevelXp: 0,
      nextLevelXp: 100,
      progressXp: 0,
      remainingXp: 100,
      progressPercent: 0,
      xpPerLevel: 100
    });

    const first = profile.addXP('xp-user', 250, 'Missão #123', 'missao', 'mission:123');
    assert.strictEqual(first.xpBefore, 0);
    assert.strictEqual(first.xpAfter, 250);
    assert.strictEqual(first.levelAfter, 3);
    assert.strictEqual(first.levelUp, true);

    const duplicate = profile.addXP('xp-user', 250, 'Missão #123', 'missao', 'mission:123');
    assert.strictEqual(duplicate.duplicate, true);
    assert.strictEqual(profile.getProfile('xp-user').xp, 250, 'recompensa idempotente alterou XP');

    const work = profile.completeWork('xp-user', { operationId: 'work:123', earnedXp: 15, reason: 'Trabalho — Vendedor' });
    assert.strictEqual(work.earnedXp, 15);
    assert.strictEqual(work.afterXp, 265);
    assert(work.earnedMoney > 0);
    assert.strictEqual(profile.completeWork('xp-user', { operationId: 'work:123', earnedXp: 15 }).duplicate, true);
    assert.strictEqual(profile.getProfile('xp-user').xp, 265);

    const transfer = profile.transferCash('xp-user', 'recipient', 100, { operationId: 'transfer:1' });
    assert.strictEqual(transfer.amount, 100);
    assert.strictEqual(profile.getProfile('xp-user').cash, 900 + work.earnedMoney);
    assert.strictEqual(profile.getProfile('recipient').cash, 1100);

    const bank = profile.transferCashBank('xp-user', 'deposit', 50);
    assert.strictEqual(bank.cash, 850 + work.earnedMoney);
    assert.strictEqual(bank.bank, 50);

    const state = profile.readState();
    state.players['xp-user'].liabilities = [{ id: 'loan-1', balance: 125.5, status: 'ativo', installmentsRemaining: 2 }];
    fs.writeFileSync(profile.STATE_PATH, JSON.stringify(state, null, 2));
    const financial = profile.getFinancialSummary('xp-user');
    assert.strictEqual(financial.available, financial.cash + financial.bank);
    assert.strictEqual(financial.debt, 125.5);
    assert.strictEqual(financial.netWorth, financial.grossAssets - financial.debt);

    assert(profile.xpHistory('xp-user').some((entry) => entry.operationId === 'mission:123'));
    assert(profile.xpHistory('xp-user').some((entry) => entry.operationId === 'work:123'));
    console.log('TESTE PERFIL RPG: PASSOU');
  } finally {
    restore();
  }
}

try {
  run();
} catch (error) {
  console.error('TESTE PERFIL RPG: FALHOU');
  console.error(error.stack || error);
  process.exitCode = 1;
}
