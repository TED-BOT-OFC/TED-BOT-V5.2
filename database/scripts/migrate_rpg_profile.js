'use strict';

const fs = require('fs');
const path = require('path');
const profile = require('../../arquivos/rpg/rpgProfileService');

function atomicWrite(file, value) {
  const temporaryPath = `${file}.${process.pid}.migration.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(value, null, 2), 'utf8');
  fs.renameSync(temporaryPath, file);
}

const result = profile.withLock(() => {
  const state = profile.readState();
  const rows = profile.readLegacyRows();
  let created = 0;
  let xpMigrated = 0;
  let financialMigrated = 0;

  for (const row of rows) {
    const existed = Boolean(state.players[row.id]);
    const player = profile.ensurePlayer(state, row.id, row.nome);
    if (!existed) created += 1;
    if (!player.rpgXpInitialized) {
      player.xp = profile.legacyXp(row);
      player.rpgXpInitialized = true;
      xpMigrated += 1;
    }
    if (!player.legacySnapshot) {
      player.cash = profile.money(row.dinheiro);
      player.bank = profile.money(row.carteiraBanco);
      player.legacySnapshot = { cash: player.cash, bank: player.bank };
      financialMigrated += 1;
    }
    player.nome = row.nome || player.nome;
    player.stats ||= {};
    player.stats.workCompleted = Number.isInteger(Number(player.stats.workCompleted))
      ? Number(player.stats.workCompleted)
      : Number(row.empregos || 0);
    player.xp = profile.levelInfo(player.xp).xp;
  }

  atomicWrite(profile.STATE_PATH, state);
  return { players: rows.length, created, xpMigrated, financialMigrated, statePath: profile.STATE_PATH };
});

console.log(JSON.stringify(result, null, 2));
