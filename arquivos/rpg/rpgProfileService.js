'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_DIR = path.resolve(__dirname, '../../database');
const STATE_PATH = path.join(DB_DIR, 'economy.json');
const LEGACY_RPG_PATH = path.join(DB_DIR, 'rpg.json');
const LOCK_PATH = path.join(DB_DIR, 'economy.lock');
const PROGRESSION_PATH = path.join(DB_DIR, 'sistema', 'rpgProgression.json');
const JOBS_PATH = path.join(DB_DIR, 'sistema', 'rpgJobs.json');
const DEFAULT_PROGRESSION = { version: 1, xpPerLevel: 100, startingLevel: 1 };

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureDb() {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

function atomicWrite(file, value) {
  ensureDb();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporaryPath = `${file}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(value, null, 2), 'utf8');
  fs.renameSync(temporaryPath, file);
}

function readJson(file, fallback) {
  ensureDb();
  if (!fs.existsSync(file)) {
    atomicWrite(file, fallback);
    return clone(fallback);
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.error(`[RPG PROFILE] JSON inválido em ${file}:`, error.message);
    return clone(fallback);
  }
}

function readProgression() {
  const saved = readJson(PROGRESSION_PATH, DEFAULT_PROGRESSION);
  return { ...DEFAULT_PROGRESSION, ...(saved && typeof saved === 'object' ? saved : {}) };
}

function getJobs() {
  const saved = readJson(JOBS_PATH, { version: 1, jobs: [] });
  return Array.isArray(saved.jobs) ? saved.jobs.map((job) => ({ ...job })) : [];
}

function getJob(jobId) {
  const normalized = String(jobId || '').trim().toLowerCase();
  return getJobs().find((job) => job.id === normalized || String(job.nome || '').toLowerCase() === normalized) || null;
}

function integer(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function cents(value) {
  let raw = value;
  if (typeof raw === 'string') {
    raw = raw.replace(/R\$\s?/gi, '').replace(/\s/g, '');
    raw = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

function fromCents(value) {
  return Math.round(Number(value || 0)) / 100;
}

function money(value) {
  return fromCents(cents(value));
}

function formatMoney(value) {
  return money(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function xpValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0;
}

function levelInfo(xp) {
  const progression = readProgression();
  const perLevel = Math.max(1, integer(progression.xpPerLevel, DEFAULT_PROGRESSION.xpPerLevel));
  const startingLevel = Math.max(1, integer(progression.startingLevel, DEFAULT_PROGRESSION.startingLevel));
  const totalXp = xpValue(xp);
  const level = startingLevel + Math.floor(totalXp / perLevel);
  const currentLevelXp = Math.max(0, (level - startingLevel) * perLevel);
  const nextLevelXp = currentLevelXp + perLevel;
  const progressXp = Math.max(0, totalXp - currentLevelXp);
  const remainingXp = Math.max(0, nextLevelXp - totalXp);
  return {
    xp: totalXp,
    level,
    nextLevel: level + 1,
    currentLevelXp,
    nextLevelXp,
    progressXp,
    remainingXp,
    progressPercent: Math.min(100, Math.floor((progressXp / perLevel) * 100)),
    xpPerLevel: perLevel
  };
}

function legacyXp(row) {
  if (!row) return 0;
  if (Number.isFinite(Number(row.xpTotal))) return xpValue(row.xpTotal);
  const oldLevel = Math.max(1, integer(row.nivel, 1));
  return ((oldLevel - 1) * readProgression().xpPerLevel) + xpValue(row.xp);
}

function acquireLock() {
  ensureDb();
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      return fs.openSync(LOCK_PATH, 'wx');
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      try {
        const stat = fs.statSync(LOCK_PATH);
        if (Date.now() - stat.mtimeMs > 120000) fs.rmSync(LOCK_PATH, { force: true });
      } catch {}
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5);
    }
  }
  throw new Error('Perfil RPG ocupado; tente novamente.');
}

function releaseLock(fd) {
  if (fd === null || fd === undefined) return;
  try { fs.closeSync(fd); } catch {}
  try { fs.rmSync(LOCK_PATH, { force: true }); } catch {}
}

function withLock(fn) {
  const fd = acquireLock();
  try { return fn(); } finally { releaseLock(fd); }
}

function readState() {
  const state = readJson(STATE_PATH, { version: 1, players: {}, loans: {}, installments: {}, bankTransactions: [], bankAudit: [] });
  state.players ||= {};
  state.loans ||= {};
  state.installments ||= {};
  state.bankTransactions ||= [];
  state.bankAudit ||= [];
  state.rpgXpHistory ||= [];
  state.rpgXpOperations ||= {};
  state.rpgLedger ||= [];
  return state;
}

function readLegacyRows() {
  const rows = readJson(LEGACY_RPG_PATH, []);
  return Array.isArray(rows) ? rows : [];
}

function normalizePlayer(p, fallback = {}) {
  p.id ||= fallback.id;
  p.nome ||= fallback.nome || p.id;
  p.cash = money(p.cash);
  p.bank = money(p.bank);
  p.xp = xpValue(p.xp);
  p.assets = Array.isArray(p.assets) ? p.assets : [];
  p.liabilities = Array.isArray(p.liabilities) ? p.liabilities : [];
  p.history = Array.isArray(p.history) ? p.history : [];
  p.stats = p.stats && typeof p.stats === 'object' ? p.stats : {};
  p.stats.workCompleted = integer(p.stats.workCompleted, 0);
  p.stats.xpGained = xpValue(p.stats.xpGained);
  return p;
}

function ensurePlayer(state, playerId, pushName = '') {
  const key = String(playerId || '');
  const legacy = readLegacyRows().find((row) => row.id === key);
  if (!state.players[key]) {
    state.players[key] = normalizePlayer({
      id: key,
      nome: legacy?.nome || pushName || key.split('@')[0],
      cash: legacy?.dinheiro ?? 1000,
      bank: legacy?.carteiraBanco ?? 0,
      assets: [],
      liabilities: [],
      stocks: {},
      funds: {},
      job: null,
      xp: legacyXp(legacy),
      reputation: 50,
      creditScore: 600,
      expenses: 900,
      history: [],
      stats: {},
      legacyImportedAt: new Date().toISOString()
    });
  } else {
    normalizePlayer(state.players[key], { id: key, nome: legacy?.nome || pushName || key.split('@')[0] });
  }
  return state.players[key];
}

function activeLoans(state, p) {
  const result = [];
  const seen = new Set();
  for (const loan of p.liabilities || []) {
    if (!loan || seen.has(loan.id)) continue;
    seen.add(loan.id);
    result.push({ ...loan, balance: money(loan.balance), installmentsRemaining: integer(loan.installmentsRemaining, 0) });
  }
  for (const loan of Object.values(state.loans || {})) {
    if (!loan || loan.userId !== p.id || seen.has(loan.id)) continue;
    seen.add(loan.id);
    const installments = Object.values(state.installments || {}).filter((item) => item.loanId === loan.id);
    const pending = installments.filter((item) => item.status === 'PENDING' || item.status === 'OVERDUE');
    const balanceCents = pending.reduce((sum, item) => sum + integer(item.amountCents, 0), 0);
    result.push({
      id: loan.id,
      status: loan.status,
      balance: fromCents(balanceCents || loan.totalDueCents || 0),
      installmentsRemaining: pending.length
    });
  }
  return result;
}

function assetValue(asset, state) {
  if (!asset) return 0;
  if (asset.kind === 'stock') return money(Number(asset.quantity || 0) * Number(state.stocks?.[asset.ticker]?.price || 0));
  if (asset.kind === 'fund') return money(Number(asset.quantity || 0) * Number(state.funds?.[asset.id]?.cota || 0));
  return money(asset.value || 0);
}

function profileFromState(state, playerId, options = {}) {
  const legacy = readLegacyRows().find((row) => row.id === playerId) || null;
  const persisted = state.players[playerId] || null;
  const p = persisted ? normalizePlayer(persisted, { id: playerId, nome: legacy?.nome || options.pushName }) : normalizePlayer({
    id: playerId,
    nome: legacy?.nome || options.pushName || String(playerId).split('@')[0],
    cash: legacy?.dinheiro ?? 0,
    bank: legacy?.carteiraBanco ?? 0,
    xp: legacyXp(legacy),
    assets: [], liabilities: [], history: [], stats: {}
  });
  const info = levelInfo(p.xp);
  const loans = activeLoans(state, p);
  const otherAssets = (p.assets || []).reduce((sum, asset) => sum + assetValue(asset, state), 0);
  const grossAssets = money(p.cash + p.bank + otherAssets);
  const debts = money(loans.reduce((sum, loan) => sum + Math.max(0, money(loan.balance)), 0));
  return {
    id: p.id,
    name: p.nome || legacy?.nome || options.pushName || 'Não disponível',
    age: legacy?.idade,
    xp: info.xp,
    level: info.level,
    levelInfo: info,
    cash: money(p.cash),
    bank: money(p.bank),
    bankId: p.selectedBank || legacy?.banco || null,
    bankName: p.selectedBank || legacy?.banco || null,
    pix: legacy?.pix || p.pix || null,
    profession: p.job?.nome || legacy?.profissao || legacy?.trabalho || null,
    job: p.job || null,
    workCount: Number.isFinite(Number(legacy?.empregos)) ? Number(legacy.empregos) : integer(p.stats.workCompleted, 0),
    professionalProgress: Number.isFinite(Number(legacy?.progressoProfissional)) ? Number(legacy.progressoProfissional) : null,
    loans,
    debt: debts,
    installmentsRemaining: loans.reduce((sum, loan) => sum + integer(loan.installmentsRemaining, 0), 0),
    assets: clone(p.assets || []),
    grossAssets,
    netWorth: money(grossAssets - debts),
    stats: clone(p.stats || {}),
    history: clone(p.history || []),
    source: p
  };
}

function getProfile(playerId, options = {}) {
  return profileFromState(readState(), String(playerId || ''), options);
}

function getFinancialSummary(playerId, options = {}) {
  const profile = getProfile(playerId, options);
  const available = money(profile.cash + profile.bank);
  return {
    ...profile,
    available,
    feesAndDebts: profile.debt,
    grossAssets: profile.grossAssets,
    netWorth: profile.netWorth
  };
}

function appendLedger(state, entry) {
  state.rpgLedger.push({ id: `rpg_${Date.now()}_${crypto.randomBytes(5).toString('hex')}`, at: new Date().toISOString(), ...entry });
  if (state.rpgLedger.length > 50000) state.rpgLedger = state.rpgLedger.slice(-50000);
}

function adjustCash(playerId, delta, description, metadata = {}) {
  return withLock(() => {
    const state = readState();
    const p = ensurePlayer(state, playerId, metadata.pushName);
    const deltaCents = cents(delta);
    if (!deltaCents) throw new Error('A alteração financeira deve ser diferente de zero.');
    const beforeCents = cents(p.cash);
    const afterCents = beforeCents + deltaCents;
    if (afterCents < 0) throw new Error(`Dinheiro insuficiente. Disponível: R$ ${formatMoney(p.cash)}`);
    p.cash = fromCents(afterCents);
    appendLedger(state, { playerId: p.id, type: deltaCents > 0 ? 'CASH_CREDIT' : 'CASH_DEBIT', amountCents: Math.abs(deltaCents), description, ...metadata });
    atomicWrite(STATE_PATH, state);
    return { before: fromCents(beforeCents), after: p.cash, delta: fromCents(deltaCents) };
  });
}

function adjustBankBalance(playerId, delta, description, metadata = {}) {
  return withLock(() => {
    const state = readState();
    const p = ensurePlayer(state, playerId, metadata.pushName);
    const deltaCents = cents(delta);
    const beforeCents = cents(p.bank);
    const afterCents = beforeCents + deltaCents;
    if (!deltaCents || afterCents < 0) throw new Error('O ajuste bancário deve manter um saldo não negativo.');
    p.bank = fromCents(afterCents);
    appendLedger(state, { playerId: p.id, type: deltaCents > 0 ? 'BANK_CREDIT' : 'BANK_DEBIT', amountCents: Math.abs(deltaCents), description, ...metadata });
    atomicWrite(STATE_PATH, state);
    return { before: fromCents(beforeCents), after: p.bank, delta: fromCents(deltaCents) };
  });
}

function transferCashBank(playerId, direction, value, metadata = {}) {
  return withLock(() => {
    const state = readState();
    const p = ensurePlayer(state, playerId, metadata.pushName);
    const valueCents = cents(value);
    if (!Number.isInteger(valueCents) || valueCents <= 0) throw new Error('Valor inválido. Use um número maior que zero.');
    const cashCents = cents(p.cash);
    const bankCents = cents(p.bank);
    if (direction === 'deposit') {
      if (cashCents < valueCents) throw new Error(`Você não possui dinheiro suficiente. Tentou depositar R$ ${formatMoney(value)} e possui R$ ${formatMoney(p.cash)}.`);
      p.cash = fromCents(cashCents - valueCents);
      p.bank = fromCents(bankCents + valueCents);
    } else if (direction === 'withdraw') {
      if (bankCents < valueCents) throw new Error(`Saldo bancário insuficiente. Disponível: R$ ${formatMoney(p.bank)}.`);
      p.bank = fromCents(bankCents - valueCents);
      p.cash = fromCents(cashCents + valueCents);
    } else {
      throw new Error('Operação bancária desconhecida.');
    }
    appendLedger(state, { playerId: p.id, type: direction === 'deposit' ? 'BANK_DEPOSIT' : 'BANK_WITHDRAW', amountCents: valueCents, description: metadata.description || (direction === 'deposit' ? 'Depósito bancário' : 'Saque bancário'), ...metadata });
    atomicWrite(STATE_PATH, state);
    return { cash: p.cash, bank: p.bank, amount: fromCents(valueCents) };
  });
}

function transferCash(playerId, recipientId, value, metadata = {}) {
  return withLock(() => {
    const state = readState();
    const sender = ensurePlayer(state, playerId, metadata.pushName);
    const recipient = ensurePlayer(state, recipientId);
    const valueCents = cents(value);
    const recipientCents = metadata.recipientValue === undefined ? valueCents : cents(metadata.recipientValue);
    if (!Number.isInteger(valueCents) || valueCents <= 0 || !Number.isInteger(recipientCents) || recipientCents < 0 || recipientCents > valueCents) throw new Error('Valor inválido. Use um número maior que zero.');
    const operationId = metadata.operationId || `cash-transfer:${sender.id}:${recipient.id}:${Date.now()}`;
    const previous = state.rpgLedger.find((entry) => entry.operationId === operationId);
    if (previous) return { duplicate: true, amount: fromCents(valueCents), sender: sender.cash, recipient: recipient.cash };
    if (cents(sender.cash) < valueCents) throw new Error(`Saldo em espécie insuficiente. Disponível: R$ ${formatMoney(sender.cash)}.`);
    sender.cash = fromCents(cents(sender.cash) - valueCents);
    recipient.cash = fromCents(cents(recipient.cash) + recipientCents);
    appendLedger(state, { playerId: sender.id, recipientId: recipient.id, type: 'CASH_TRANSFER', amountCents: valueCents, recipientAmountCents: recipientCents, feeCents: valueCents - recipientCents, description: metadata.description || 'Transferência de carteira', operationId, source: metadata.source || 'pix_legacy' });
    atomicWrite(STATE_PATH, state);
    return { duplicate: false, amount: fromCents(valueCents), sender: sender.cash, recipient: recipient.cash };
  });
}

function setJob(playerId, jobId, metadata = {}) {
  return withLock(() => {
    const state = readState();
    const p = ensurePlayer(state, playerId, metadata.pushName);
    const job = typeof jobId === 'object' ? jobId : getJob(jobId);
    if (!job) throw new Error('Profissão não encontrada.');
    p.job = clone(job);
    atomicWrite(STATE_PATH, state);
    return clone(job);
  });
}

function addXP(playerId, amount, reason, source, operationId, metadata = {}) {
  return withLock(() => {
    const state = readState();
    const p = ensurePlayer(state, playerId, metadata.pushName);
    const delta = Number(amount);
    if (!Number.isInteger(delta) || delta === 0) throw new Error('XP deve ser um número inteiro diferente de zero.');
    if (operationId && state.rpgXpOperations[operationId]) {
      return { ...state.rpgXpOperations[operationId], duplicate: true };
    }
    const before = xpValue(p.xp);
    const after = before + delta;
    if (after < 0) throw new Error(`O XP não pode ficar negativo. XP atual: ${before}.`);
    const beforeLevel = levelInfo(before).level;
    const afterLevel = levelInfo(after).level;
    p.xp = after;
    p.stats.xpGained = xpValue(p.stats.xpGained + Math.max(0, delta));
    const entry = {
      operationId: operationId || `xp_${Date.now()}_${crypto.randomBytes(5).toString('hex')}`,
      playerId: p.id,
      xpBefore: before,
      xpDelta: delta,
      xpAfter: after,
      reason: reason || 'Sem motivo informado',
      source: source || 'rpg',
      levelBefore: beforeLevel,
      levelAfter: afterLevel,
      levelUp: afterLevel > beforeLevel,
      at: new Date().toISOString()
    };
    state.rpgXpHistory.push(entry);
    if (operationId) state.rpgXpOperations[operationId] = entry;
    if (state.rpgXpHistory.length > 50000) state.rpgXpHistory = state.rpgXpHistory.slice(-50000);
    atomicWrite(STATE_PATH, state);
    return entry;
  });
}

function completeWork(playerId, options = {}) {
  return withLock(() => {
    const state = readState();
    const p = ensurePlayer(state, playerId, options.pushName);
    const operationId = options.operationId || `work:${playerId}:${Date.now()}`;
    const duplicate = (state.rpgXpHistory || []).find((entry) => entry.operationId === operationId);
    if (duplicate) return { duplicate: true, xp: duplicate, money: null, workCount: p.stats.workCompleted || 0 };
    const currentLevel = levelInfo(p.xp).level;
    const workCount = integer(p.stats.workCompleted, 0) + 1;
    const jobsForMax = 50;
    const minSalary = 100;
    const maxSalary = 500000;
    const increment = (maxSalary - minSalary) / (jobsForMax - 1);
    const salaryBase = workCount <= jobsForMax
      ? Math.floor(minSalary + increment * (workCount - 1))
      : maxSalary;
    const multiplier = 1 + (currentLevel * 0.1);
    const earnedMoney = Math.floor(salaryBase * multiplier);
    const earnedXp = Number.isInteger(options.earnedXp) ? options.earnedXp : Math.floor(Math.random() * 10) + 5;
    if (earnedXp <= 0) throw new Error('A recompensa de XP deve ser positiva.');
    const beforeXp = xpValue(p.xp);
    const afterXp = beforeXp + earnedXp;
    const beforeLevel = levelInfo(beforeXp).level;
    const afterLevel = levelInfo(afterXp).level;
    p.cash = money(p.cash + earnedMoney);
    p.xp = afterXp;
    p.stats.workCompleted = workCount;
    p.stats.xpGained = xpValue(p.stats.xpGained + earnedXp);
    p.stats.lastWorkAt = new Date().toISOString();
    const xpEntry = {
      operationId,
      playerId: p.id,
      xpBefore: beforeXp,
      xpDelta: earnedXp,
      xpAfter: afterXp,
      reason: options.reason || 'Trabalho concluído',
      source: options.source || 'trabalho',
      levelBefore: beforeLevel,
      levelAfter: afterLevel,
      levelUp: afterLevel > beforeLevel,
      at: new Date().toISOString()
    };
    state.rpgXpHistory.push(xpEntry);
    state.rpgXpOperations[operationId] = xpEntry;
    appendLedger(state, { playerId: p.id, type: 'WORK_REWARD', amountCents: cents(earnedMoney), description: options.reason || 'Recompensa de trabalho', operationId });
    if (state.rpgXpHistory.length > 50000) state.rpgXpHistory = state.rpgXpHistory.slice(-50000);
    atomicWrite(STATE_PATH, state);
    return { duplicate: false, earnedMoney, earnedXp, salaryBase, multiplier, workCount, beforeXp, afterXp, beforeLevel, afterLevel, levelUp: afterLevel > beforeLevel, player: clone(p) };
  });
}

function xpHistory(playerId, limit = 20) {
  const state = readState();
  return (state.rpgXpHistory || []).filter((entry) => entry.playerId === playerId).slice(-Math.max(1, Math.min(100, Number(limit) || 20))).reverse();
}

function projectLegacyRows(rows, options = {}) {
  const state = readState();
  const list = Array.isArray(rows) ? rows : [];
  for (const row of list) {
    const p = state.players[row.id];
    if (!p) continue;
    const info = levelInfo(p.xp);
    row.dinheiro = money(p.cash);
    row.carteiraBanco = money(p.bank);
    row.xp = info.xp;
    row.nivel = info.level;
    if (p.selectedBank) row.banco = p.selectedBank;
    if (options.persist) atomicWrite(LEGACY_RPG_PATH, list);
  }
  return list;
}

module.exports = {
  STATE_PATH,
  LEGACY_RPG_PATH,
  LOCK_PATH,
  PROGRESSION_PATH,
  JOBS_PATH,
  DEFAULT_PROGRESSION,
  readState,
  readLegacyRows,
  getJobs,
  getJob,
  levelInfo,
  legacyXp,
  getProfile,
  getFinancialSummary,
  formatMoney,
  money,
  cents,
  fromCents,
  withLock,
  adjustCash,
  adjustBankBalance,
  transferCashBank,
  transferCash,
  setJob,
  addXP,
  completeWork,
  xpHistory,
  projectLegacyRows,
  ensurePlayer
};
