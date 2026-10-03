'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_DIR = path.resolve(__dirname, '../../database');
const STATE_PATH = path.join(DB_DIR, 'economy.json');
const TX_PATH = path.join(DB_DIR, 'economy_transactions.json');
const AUDIT_PATH = path.join(DB_DIR, 'economy_audit.json');
const LOCK_PATH = path.join(DB_DIR, 'economy.lock');
const LEGACY_RPG_PATH = path.join(DB_DIR, 'rpg.json');
const LEGACY_DATA_PATH = path.join(__dirname, 'rpgData.js');
const LEGACY_DATA = require(LEGACY_DATA_PATH);
const profileService = require('./rpgProfileService');

const COMMANDS = new Set([
  'perfil', 'patrimonio', 'saldo', 'trabalho', 'empregos', 'salario', 'extrato', 'pagar', 'emprestimo', 'financiamento',
  'bolsa', 'acoes', 'comprar_acao', 'vender_acao', 'fundos', 'comprar_fundo', 'vender_fundo',
  'imoveis', 'comprar_imovel', 'vender_imovel', 'alugar', 'empresa', 'criar_empresa', 'empresa_status',
  'contratar', 'demitir', 'produtos', 'estoque', 'caixa', 'recursos', 'mercado', 'precos', 'impostos',
  'pagar_imposto', 'dividas', 'governo', 'orcamento', 'economia', 'inflacao', 'juros', 'desemprego', 'banco', 'bancos', 'abrir_conta', 'selecionar_banco', 'depositar_banco', 'sacar_banco', 'transferir_banco', 'doar',
  'noticias', 'eventos', 'ranking', 'historico', 'tickeconomia', 'economiaajuda'
]);

const BASE_PRICES = {
  petroleo: 100, gasolina: 7, energia: 250, agua: 80, madeira: 120, ferro: 180, aco: 300,
  alimentos: 500, trigo: 90, milho: 80, cafe: 140, ouro: 3500, minerio: 220, eletronicos: 1200
};
const JOBS = profileService.getJobs();
const PROPERTIES = [
  ['terreno', 'Terreno', 80000, 500], ['casa', 'Casa', 250000, 1800], ['apartamento', 'Apartamento', 180000, 1400],
  ['loja', 'Loja', 400000, 4500], ['escritorio', 'Escritório', 650000, 7000], ['galpao', 'Galpão', 900000, 10000], ['fazenda', 'Fazenda', 1200000, 15000]
].map(([id, nome, preco, aluguel]) => ({ id, nome, preco, aluguel }));
const STOCKS = [
  ['TECHBR', 'Tecnologia', 42.5], ['AGROBR', 'Agronegócio', 28.4], ['ENERBR', 'Energia', 67.2], ['BANCBR', 'Bancos', 31.8], ['MINERBR', 'Mineração', 54.1]
].map(([ticker, nome, preco]) => ({ ticker, nome, preco }));
const FUNDS = [
  ['alpha', 'Fundo Alpha', 100, 'médio', 0.01], ['renda', 'Renda Fixa', 102, 'baixo', 0.005], ['imob', 'Fundo Imobiliário', 98, 'médio', 0.01],
  ['acoes', 'Fundo de Ações', 110, 'alto', 0.015], ['commodities', 'Fundo de Commodities', 105, 'alto', 0.015]
].map(([id, nome, cota, risco, taxa]) => ({ id, nome, cota, risco, taxa }));
const COMPANY_TYPES = ['restaurante', 'loja', 'supermercado', 'oficina', 'transportadora', 'fabrica', 'software', 'fazenda', 'logistica'];

function defaultState() {
  return {
    version: 1,
    clock: { day: 1, week: 1, month: 1, quarter: 1, year: 1, lastTick: Date.now() },
    macro: { inflation: 0.006, interest: 0.105, unemployment: 0.08, cycle: 'estabilidade', moneySupply: 0 },
    prices: Object.fromEntries(Object.entries(BASE_PRICES).map(([id, price]) => [id, { price, supply: 100, demand: 100, trend: 0 }])),
    stocks: Object.fromEntries(STOCKS.map((s) => [s.ticker, { ...s, price: s.preco, change: 0, volume: 0 }])),
    funds: Object.fromEntries(FUNDS.map((f) => [f.id, { ...f, change: 0 }])),
    players: {}, companies: {}, npcs: [], loans: {}, properties: {}, events: [], news: [],
    government: { treasury: 0, revenue: 0, spending: 0, debt: 0, infrastructure: 50, health: 50, education: 50, transport: 50 },
    metrics: { transactions: 0, suspicious: 0, companies: 0, assets: 0, debts: 0 }
  };
}
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function ensureDb() { fs.mkdirSync(DB_DIR, { recursive: true }); }
function readJson(file, fallback) {
  ensureDb();
  if (!fs.existsSync(file)) { atomicWrite(file, fallback); return clone(fallback); }
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { atomicWrite(file, fallback); return clone(fallback); }
}
function atomicWrite(file, value) {
  ensureDb(); const tmp = `${file}.${process.pid}.tmp`; fs.writeFileSync(tmp, JSON.stringify(value, null, 2)); fs.renameSync(tmp, file);
}
function state() { const s = readJson(STATE_PATH, defaultState()); return { ...defaultState(), ...s, clock: { ...defaultState().clock, ...(s.clock || {}) }, macro: { ...defaultState().macro, ...(s.macro || {}) } }; }
function transactions() { return readJson(TX_PATH, []); }
function audit(entry) { const log = readJson(AUDIT_PATH, []); log.push({ at: new Date().toISOString(), ...entry }); atomicWrite(AUDIT_PATH, log.slice(-10000)); }
function money(v) { return Number.isFinite(Number(v)) ? Math.round(Number(v) * 100) / 100 : 0; }
function fmt(v) { return money(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function id(prefix) { return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`; }
function args(ctx) { return Array.isArray(ctx.args) ? ctx.args : []; }
function text(ctx) { return args(ctx).join(' ').trim(); }
function reply(ctx, message) { return ctx.reply(message); }
function lock() { ensureDb(); try { const fd = fs.openSync(LOCK_PATH, 'wx'); return fd; } catch (error) { if (error.code === 'EEXIST') { try { const stat = fs.statSync(LOCK_PATH); if (Date.now() - stat.mtimeMs > 120000) fs.rmSync(LOCK_PATH, { force: true }); } catch {} } return null; } }
function unlock(fd) { if (fd !== null) { fs.closeSync(fd); try { fs.unlinkSync(LOCK_PATH); } catch {} } }
function withLock(fn) {
  let fd = lock(); let attempts = 0;
  while (fd === null && attempts < 20) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10); fd = lock(); attempts += 1; }
  if (fd === null) throw new Error('Economia ocupada; tente novamente.');
  try { return fn(); } finally { unlock(fd); }
}
function legacyPlayer(key) { try { const rows = readJson(LEGACY_RPG_PATH, []); return Array.isArray(rows) ? rows.find((row) => row.id === key) : null; } catch { return null; } }
function legacyAssets(row) { const houses = [...(LEGACY_DATA.HOUSES || []), ...(LEGACY_DATA.LUXURY_CARS || [])]; const names = [...new Set([...(row.casas || []), ...(row.carros || [])])]; return names.map((name) => { const item = houses.find((x) => x.nome === name); return { id: `legacy_${name}`, kind: (row.casas || []).includes(name) ? 'property' : 'vehicle', type: name, name, value: money(item?.preco || 0), legacy: true }; }); }
function syncLegacyRead(players) { const s = state(); let changed = false; for (const row of players) { const e = s.players[row.id]; if (!e) continue; e.assets ||= []; const uniqueAssets = new Map(e.assets.map((asset) => [asset.id, asset])); if (uniqueAssets.size !== e.assets.length) { e.assets = [...uniqueAssets.values()]; changed = true; } const syncedAssets = legacyAssets(row); const nonLegacyAssets = e.assets.filter((asset) => !asset.legacy); const nextAssets = [...nonLegacyAssets, ...syncedAssets]; if (JSON.stringify(nextAssets) !== JSON.stringify(e.assets)) changed = true; e.assets = nextAssets; if (!e.rpgXpInitialized) { e.xp = profileService.legacyXp(row); e.rpgXpInitialized = true; changed = true; } const snapshot = e.legacySnapshot; if (!snapshot) { e.legacySnapshot = { cash: money(row.dinheiro), bank: money(row.carteiraBanco) }; changed = true; } else { const legacyChanged = money(row.dinheiro) !== money(snapshot.cash) || money(row.carteiraBanco) !== money(snapshot.bank); if (legacyChanged) { e.cash = money(row.dinheiro); e.bank = money(row.carteiraBanco); e.legacySnapshot = { cash: e.cash, bank: e.bank }; changed = true; } else { row.dinheiro = money(e.cash); row.carteiraBanco = money(e.bank); } } const info = profileService.levelInfo(e.xp); row.xp = info.xp; row.nivel = info.level; row.casas = [...new Set(e.assets.filter((a) => a.kind === 'property' && a.legacy).map((a) => a.name))]; row.carros = [...new Set(e.assets.filter((a) => a.kind === 'vehicle' && a.legacy).map((a) => a.name))]; } if (changed) atomicWrite(STATE_PATH, s); return players; }
function syncLegacyWrite(players) { return withLock(() => { const s = state(); for (const row of players) { const existing = s.players[row.id]; const before = existing ? money(existing.cash) : 0; const next = existing || player(s, { sender: row.id, pushName: row.nome }); existing || (s.players[row.id] = next); next.nome = row.nome || next.nome; next.cash = money(row.dinheiro); next.bank = money(row.carteiraBanco); next.rpgXpInitialized = true; if (!Number.isFinite(Number(next.xp))) next.xp = profileService.legacyXp(row); const info = profileService.levelInfo(next.xp); row.xp = info.xp; row.nivel = info.level; next.legacySnapshot = { cash: next.cash, bank: next.bank }; const delta = money(next.cash - before); if (delta !== 0) { record(s, next, delta > 0 ? 'legacy_credit' : 'legacy_debit', Math.abs(delta), 'Sincronização de operação legada'); } const assets = legacyAssets(row); next.assets ||= []; for (const asset of assets) if (!next.assets.some((a) => a.id === asset.id)) next.assets.push(asset); } atomicWrite(STATE_PATH, s); return players; }); }
function player(s, ctx) {
  const key = ctx.sender; const legacy = legacyPlayer(key);
  if (!s.players[key]) s.players[key] = { id: key, nome: legacy?.nome || ctx.pushName || key.split('@')[0], cash: money(legacy?.dinheiro ?? 1000), bank: money(legacy?.carteiraBanco ?? 0), assets: [], liabilities: [], stocks: {}, funds: {}, job: null, xp: profileService.legacyXp(legacy), rpgXpInitialized: true, reputation: 50, creditScore: 600, expenses: 900, history: [], goals: [], legacyImportedAt: new Date().toISOString(), legacySnapshot: { cash: money(legacy?.dinheiro ?? 1000), bank: money(legacy?.carteiraBanco ?? 0) } };
  s.players[key].xp = Number.isFinite(Number(s.players[key].xp)) ? Math.max(0, Math.trunc(Number(s.players[key].xp))) : 0;
  return s.players[key];
}
function assetsValue(p, s) {
  const property = p.assets.filter((a) => a.kind === 'property').reduce((n, a) => n + money(a.value), 0);
  const vehicles = p.assets.filter((a) => a.kind === 'vehicle').reduce((n, a) => n + money(a.value), 0);
  const stocks = Object.entries(p.stocks).reduce((n, [ticker, q]) => n + money(q * (s.stocks[ticker]?.price || 0)), 0);
  const funds = Object.entries(p.funds).reduce((n, [fund, q]) => n + money(q * (s.funds[fund]?.cota || 0)), 0);
  const companies = p.assets.filter((a) => a.kind === 'company').reduce((n, a) => n + money(a.value), 0);
  return money(property + vehicles + stocks + funds + companies + p.cash + p.bank);
}
function liabilitiesValue(p, s = {}) { const own = p.liabilities.reduce((n, l) => n + Math.max(0, money(l.balance)), 0); const bankLoans = Object.values(s.loans || {}).filter((loan) => loan.userId === p.id && loan.status !== 'PAID').reduce((n, loan) => { const installments = Object.values(s.installments || {}).filter((item) => item.loanId === loan.id && item.status !== 'PAID').reduce((sum, item) => sum + Number(item.amountCents || 0), 0); return n + (installments ? installments / 100 : Number(loan.totalDueCents || 0) / 100); }, 0); return money(own + bankLoans); }
function netWorth(p, s) { return money(assetsValue(p, s) - liabilitiesValue(p, s)); }
function findTransaction(transactionId) { return transactions().find((t) => t.id === transactionId); }
function record(s, p, type, amount, description, metadata = {}) {
  const value = money(amount); const txid = metadata.transactionId || id('tx');
  const existing = findTransaction(txid);
  if (existing) return existing;
  const tx = { id: txid, playerId: p.id, type, amount: value, description, at: new Date().toISOString(), ...metadata };
  const all = transactions(); all.push(tx); atomicWrite(TX_PATH, all.slice(-50000)); p.history.push(tx); s.metrics.transactions += 1; audit({ action: type, playerId: p.id, amount: value, transactionId: txid });
  return tx;
}
function credit(s, p, amount, description, metadata = {}) { const v = money(amount); if (v <= 0) throw new Error('Valor deve ser positivo.'); const txid = metadata.transactionId; if (txid && findTransaction(txid)) return findTransaction(txid); p.cash += v; s.macro.moneySupply += v; record(s, p, 'credit', v, description, metadata); }
function debit(s, p, amount, description, metadata = {}) { const v = money(amount); if (v <= 0) throw new Error('Valor deve ser positivo.'); const txid = metadata.transactionId; if (txid && findTransaction(txid)) return findTransaction(txid); if (p.cash < v) throw new Error(`Saldo insuficiente. Disponível: R$ ${fmt(p.cash)}`); p.cash -= v; s.macro.moneySupply -= v; record(s, p, 'debit', v, description, metadata); }
function parseAmount(value) { const v = Number(String(value || '').replace(',', '.')); return Number.isFinite(v) && v > 0 ? v : NaN; }
const BANK_FEES = { nubank: 0.01, 'mercado pago': 0.015, inter: 0.02, brasil: 0.025, bradesco: 0.03 };
function bankInfo(id) { const normalized = String(id || '').toLowerCase(); const bank = (LEGACY_DATA.BANKS || []).find((item) => item.id === normalized || item.nome.toLowerCase() === normalized); return bank ? { ...bank, fee: BANK_FEES[bank.id] ?? 0.02 } : null; }
function bankName(p) { return p.selectedBank || 'nenhum'; }
function bankDebit(p, amount) { const v = money(amount); if (v <= 0) throw new Error('Valor deve ser positivo.'); if (!p.selectedBank) throw new Error('Escolha um banco primeiro.'); if (p.bank < v) throw new Error(`Saldo bancário insuficiente. Disponível: R$ ${fmt(p.bank)}`); p.bank = money(p.bank - v); return v; }
function bankCredit(p, amount) { const v = money(amount); if (v <= 0) throw new Error('Valor deve ser positivo.'); p.bank = money(p.bank + v); return v; }
function autoAdvance(s) { const dayMs = Number(process.env.ECONOMY_DAY_MS || 86400000); const elapsed = Math.floor((Date.now() - Number(s.clock.lastTick || Date.now())) / dayMs); if (elapsed > 0) tick(s, Math.min(elapsed, 365)); }
function tick(s, days = 1) {
  const count = Math.max(1, Math.min(365, Number(days) || 1));
  for (let i = 0; i < count; i += 1) {
    s.clock.day += 1; s.clock.week = Math.ceil(s.clock.day / 7); s.clock.month = Math.ceil(s.clock.day / 30); s.clock.quarter = Math.ceil(s.clock.month / 3); s.clock.year = Math.ceil(s.clock.month / 12);
    if (!s.npcs.length) { for (let n = 1; n <= 25; n += 1) { const job = JOBS[n % JOBS.length]; s.npcs.push({ id: `npc_${n}`, nome: `Cidadão ${n}`, profession: job.id, salary: job.salario, cash: job.salario * 2, consumption: 0.7, employed: true }); } }
    for (const npc of s.npcs) { npc.cash = money(npc.cash + npc.salary / 30); const spend = money(npc.salary / 30 * npc.consumption); npc.cash = Math.max(0, money(npc.cash - spend)); const food = s.prices.alimentos; food.demand += spend / 100; }
    for (const company of Object.values(s.companies)) { const workers = company.employees.length || 1; const revenue = money(250 * workers * (1 + s.government.infrastructure / 200)); const payroll = money(company.employees.reduce((total, employee) => total + Number(employee.salary || 0) / 30, 0)); company.revenue = money(company.revenue + revenue); company.expenses = money(company.expenses + payroll + 80); company.profit = money(company.revenue - company.expenses); company.capital = Math.max(0, money(company.capital + revenue - payroll - 80)); company.value = Math.max(0, money(company.capital + Math.max(0, company.profit) * 2)); const owner = s.players[company.owner]; const asset = owner?.assets.find((a) => a.kind === 'company' && a.id === company.id); if (asset) asset.value = company.value; }
    if (Math.random() < 0.08) { const events = [{ title: 'Chuva intensa afetou a logística', impact: 'combustivel' }, { title: 'Nova tecnologia elevou a produtividade', impact: 'eletronicos' }, { title: 'Seca reduziu a produção agrícola', impact: 'alimentos' }, { title: 'Confiança do consumidor melhorou', impact: 'consumo' }]; const event = events[Math.floor(Math.random() * events.length)]; s.events.push({ id: id('event'), ...event, at: new Date().toISOString() }); s.news.push({ at: new Date().toISOString(), title: event.title }); if (s.prices[event.impact]) s.prices[event.impact].demand *= 1.15; if (event.impact === 'consumo') s.macro.unemployment = Math.max(0.02, s.macro.unemployment - 0.005); }
    for (const item of Object.values(s.prices)) { const pressure = (item.demand - item.supply) / 100; item.trend = Math.max(-0.2, Math.min(0.2, pressure + s.macro.inflation)); item.price = Math.max(0.01, money(item.price * (1 + item.trend * 0.03))); item.demand = Math.max(50, money(item.demand * 0.995)); item.supply = Math.max(50, money(item.supply * 0.998)); }
    for (const stock of Object.values(s.stocks)) { const shock = (Math.random() - 0.48) * 0.04 + (s.macro.interest < 0.1 ? 0.005 : -0.003); stock.change = shock; stock.price = Math.max(0.01, money(stock.price * (1 + shock))); stock.volume = 0; }
    for (const fund of Object.values(s.funds)) { const shock = (Math.random() - 0.45) * 0.018; fund.change = shock; fund.cota = Math.max(0.01, money(fund.cota * (1 + shock))); }
    if (s.clock.day % 30 === 0) {
      for (const p of Object.values(s.players)) { if (p.job) { const job = JOBS.find((j) => j.id === p.job.id); if (job) credit(s, p, job.salario * (1 - 0.1), `Salário mensal: ${job.nome}`); } if (p.expenses > 0 && p.cash >= p.expenses) debit(s, p, p.expenses, 'Custo de vida mensal'); }
      s.macro.inflation = Math.max(0, Math.min(0.25, s.macro.inflation + (Math.random() - 0.48) * 0.002));
      for (const p of Object.values(s.players)) for (const l of p.liabilities) { l.balance = money(l.balance * (1 + s.macro.interest / 12)); if (l.balance > 0) s.metrics.debts += 1; }
    }
  }
  s.clock.lastTick = Date.now();
}
function help(ctx) { return reply(ctx, `*Economia RPG — comandos principais*\n\n${ctx.prefix || '/'}economia · ${ctx.prefix || '/'}perfil · ${ctx.prefix || '/'}patrimonio · ${ctx.prefix || '/'}empregos\n${ctx.prefix || '/'}emprestimo · ${ctx.prefix || '/'}bolsa · ${ctx.prefix || '/'}fundos · ${ctx.prefix || '/'}imoveis\n${ctx.prefix || '/'}empresa · ${ctx.prefix || '/'}recursos · ${ctx.prefix || '/'}impostos · ${ctx.prefix || '/'}governo\n${ctx.prefix || '/'}noticias · ${ctx.prefix || '/'}eventos · ${ctx.prefix || '/'}historico`); }

async function handleCommand(ctx) {
  const command = String(ctx.command || '').toLowerCase(); if (!COMMANDS.has(command)) return false;
  try {
    return withLock(() => {
      const s = state(); autoAdvance(s); const p = player(s, ctx); const a = args(ctx); const prefix = ctx.prefix || '/';
      if (command === 'economiaajuda') { atomicWrite(STATE_PATH, s); return help(ctx); }
      if (command === 'tickeconomia') { tick(s, parseInt(a[0] || '1', 10)); atomicWrite(STATE_PATH, s); return reply(ctx, `Calendário avançou para dia ${s.clock.day}, mês ${s.clock.month}, ano ${s.clock.year}.`); }
      if (command === 'perfil' || command === 'saldo') { const wantsRpg = String(a[0] || '').toLowerCase() === 'rpg'; const summary = wantsRpg ? profileService.getFinancialSummary(ctx.sender, { pushName: p.nome }) : null; atomicWrite(STATE_PATH, s); if (summary) return reply(ctx, `💰 *SALDO RPG*\n\nDinheiro: R$ ${fmt(summary.cash)}\nBanco: ${summary.bankName || 'Não disponível'}\nSaldo bancário: R$ ${fmt(summary.bank)}\nTotal disponível: R$ ${fmt(summary.available)}\nEmpréstimos: ${summary.debt > 0 ? `R$ ${fmt(summary.debt)}` : 'Não disponível'}\nTaxas/dívidas: ${summary.feesAndDebts > 0 ? `R$ ${fmt(summary.feesAndDebts)}` : 'Não disponível'}\nPatrimônio líquido: R$ ${fmt(summary.netWorth)}`); return reply(ctx, `*Perfil econômico de ${p.nome}*\nCarteira única: R$ ${fmt(p.cash)}\nSaldo no banco (${bankName(p)}): R$ ${fmt(p.bank)}\nTotal sob gestão: R$ ${fmt(p.cash + p.bank)}\nPatrimônio líquido: R$ ${fmt(netWorth(p, s))}\nScore de crédito: ${p.creditScore}\nProfissão: ${p.job?.nome || 'Desempregado'}\nInflação: ${(s.macro.inflation * 100).toFixed(2)}%`); }
      if (command === 'patrimonio') { atomicWrite(STATE_PATH, s); return reply(ctx, `*Patrimônio*\nAtivos: R$ ${fmt(assetsValue(p, s))}\nPassivos: R$ ${fmt(liabilitiesValue(p, s))}\nPatrimônio líquido: R$ ${fmt(netWorth(p, s))}\nAções: ${Object.entries(p.stocks).map(([k, q]) => `${k} ${q}`).join(', ') || 'nenhuma'}\nFundos: ${Object.entries(p.funds).map(([k, q]) => `${k} ${q}`).join(', ') || 'nenhum'}`); }
      if (command === 'bancos') { atomicWrite(STATE_PATH, s); return reply(ctx, '*Bancos disponíveis*\n' + (LEGACY_DATA.BANKS || []).map((b) => `${b.id} — ${b.nome}: taxa ${(BANK_FEES[b.id] * 100).toFixed(2)}%`).join('\\n')); }
      if (command === 'banco' || command === 'abrir_conta') { atomicWrite(STATE_PATH, s); return reply(ctx, `Banco atual: ${bankName(p)}\nSaldo bancário: R$ ${fmt(p.bank)}\nUse ${prefix}bancos para consultar taxas e ${prefix}selecionar_banco código.`); }
      if (command === 'selecionar_banco') { const bank = bankInfo(a.join(' ')); if (!bank) return reply(ctx, `Banco inválido. Use ${prefix}bancos.`); p.selectedBank = bank.id; atomicWrite(STATE_PATH, s); return reply(ctx, `Banco selecionado: ${bank.nome}. Taxa de transferência: ${(bank.fee * 100).toFixed(2)}%.`); }
      if (command === 'depositar_banco') { const v = parseAmount(a[0]); if (!Number.isFinite(v)) return reply(ctx, `Uso: ${prefix}depositar_banco valor`); debit(s, p, v, 'Depósito na carteira bancária'); bankCredit(p, v); record(s, p, 'bank_deposit', v, `Depósito no banco ${bankName(p)}`); atomicWrite(STATE_PATH, s); return reply(ctx, `Depósito realizado. Carteira: R$ ${fmt(p.cash)} | Banco: R$ ${fmt(p.bank)}.`); }
      if (command === 'sacar_banco') { const v = parseAmount(a[0]); if (!Number.isFinite(v)) return reply(ctx, `Uso: ${prefix}sacar_banco valor`); bankDebit(p, v); credit(s, p, v, 'Saque da carteira bancária'); record(s, p, 'bank_withdraw', v, `Saque do banco ${bankName(p)}`); atomicWrite(STATE_PATH, s); return reply(ctx, `Saque realizado. Carteira: R$ ${fmt(p.cash)} | Banco: R$ ${fmt(p.bank)}.`); }
      if (command === 'transferir_banco' || command === 'doar') { const targetKey = a[0]; const v = parseAmount(a[1]); if (!targetKey || !Number.isFinite(v)) return reply(ctx, `Uso: ${prefix}${command} id_do_usuario valor`); const target = s.players[targetKey] || Object.values(s.players).find((x) => x.id === targetKey || x.nome.toLowerCase() === String(targetKey).toLowerCase()); if (!target || target.id === p.id) return reply(ctx, 'Destinatário não encontrado.'); const feeRate = BANK_FEES[bankName(p)] ?? 0.02; const fee = money(v * feeRate); bankDebit(p, v + fee); bankCredit(target, v); record(s, p, command === 'doar' ? 'donation' : 'bank_transfer', v, `${command === 'doar' ? 'Doação' : 'Transferência'} para ${target.nome}`, { fee, recipientId: target.id }); atomicWrite(STATE_PATH, s); return reply(ctx, `${command === 'doar' ? 'Doação' : 'Transferência'} concluída. Enviado: R$ ${fmt(v)} | Taxa: R$ ${fmt(fee)} | Banco: ${bankName(p)}.`); }
      if (command === 'empregos') { atomicWrite(STATE_PATH, s); return reply(ctx, '*Mercado de trabalho*\n' + JOBS.map((j) => `${j.id}: ${j.nome} — R$ ${fmt(j.salario)}/mês — level mínimo ${j.minLevel} — XP mínimo ${j.minXp}`).join('\n')); }
      if (command === 'trabalho') { const job = JOBS.find((j) => j.id === String(a[0] || '').toLowerCase()); const info = profileService.levelInfo(p.xp || 0); if (!job) return reply(ctx, `Use ${prefix}trabalho código. Códigos: ${JOBS.map((j) => j.id).join(', ')}`); if (info.level < job.minLevel || (p.xp || 0) < job.minXp) return reply(ctx, `❌ Requisitos insuficientes para ${job.nome}.\nLevel atual: ${info.level} | mínimo: ${job.minLevel}\nXP global atual: ${p.xp || 0} | mínimo: ${job.minXp}\nComo corrigir: realize atividades disponíveis no RPG.`); p.job = { ...job }; atomicWrite(STATE_PATH, s); return reply(ctx, `✅ Você agora trabalha como ${job.nome}, com salário mensal de R$ ${fmt(job.salario)}.`); }
      if (command === 'salario') { atomicWrite(STATE_PATH, s); return reply(ctx, `Seu salário atual é R$ ${fmt(p.job?.salario || 0)}/mês.`); }
      if (command === 'extrato' || command === 'historico') { atomicWrite(STATE_PATH, s); return reply(ctx, '*Últimas movimentações*\n' + (p.history.slice(-12).reverse().map((t) => `${t.at.slice(0, 16).replace('T', ' ')} — ${t.type} R$ ${fmt(t.amount)} — ${t.description}`).join('\n') || 'Nenhuma movimentação.')); }
      if (command === 'emprestimo' || command === 'financiamento') { const v = parseAmount(a[0]); if (!Number.isFinite(v) || v < 100) return reply(ctx, `Uso: ${prefix}${command} valor`); const loan = { id: id('loan'), balance: money(v * 1.15), principal: v, interest: 0.15, dueMonth: s.clock.month + 12, status: 'ativo' }; p.liabilities.push(loan); credit(s, p, v, `${command} recebido`, { loanId: loan.id }); p.creditScore = Math.max(300, p.creditScore - 5); s.metrics.debts += 1; atomicWrite(STATE_PATH, s); return reply(ctx, `Crédito aprovado: R$ ${fmt(v)}. Saldo devedor inicial: R$ ${fmt(loan.balance)}.`); }
      if (command === 'pagar') { const v = parseAmount(a[0]); if (!Number.isFinite(v)) return reply(ctx, `Uso: ${prefix}pagar valor`); const loan = p.liabilities.find((l) => l.status === 'ativo' && l.balance > 0); if (!loan) return reply(ctx, 'Você não possui dívida ativa.'); const paid = Math.min(v, loan.balance); debit(s, p, paid, 'Pagamento de dívida'); loan.balance = money(loan.balance - paid); if (loan.balance <= 0) loan.status = 'quitado'; p.creditScore = Math.min(850, p.creditScore + 8); atomicWrite(STATE_PATH, s); return reply(ctx, `Pagamento registrado: R$ ${fmt(paid)}. Saldo restante: R$ ${fmt(loan.balance)}.`); }
      if (command === 'dividas') { atomicWrite(STATE_PATH, s); return reply(ctx, '*Dívidas*\n' + (p.liabilities.map((l) => `${l.id}: saldo R$ ${fmt(l.balance)} — ${l.status}`).join('\n') || 'Nenhuma dívida.')); }
      if (command === 'bolsa' || command === 'acoes') { atomicWrite(STATE_PATH, s); return reply(ctx, '*Bolsa fictícia*\n' + Object.values(s.stocks).map((x) => `${x.ticker} — ${x.nome}: R$ ${fmt(x.price)} (${(x.change * 100).toFixed(2)}%)`).join('\n')); }
      if (command === 'comprar_acao' || command === 'vender_acao') { const ticker = String(a[0] || '').toUpperCase(); const q = Number(a[1]); const stock = s.stocks[ticker]; if (!stock || !Number.isInteger(q) || q <= 0) return reply(ctx, `Uso: ${prefix}${command} TICKER quantidade`); const total = money(stock.price * q); if (command === 'comprar_acao') { debit(s, p, total, `Compra de ${q} ações ${ticker}`); p.stocks[ticker] = (p.stocks[ticker] || 0) + q; } else { if ((p.stocks[ticker] || 0) < q) throw new Error('Quantidade de ações insuficiente.'); p.stocks[ticker] -= q; credit(s, p, total, `Venda de ${q} ações ${ticker}`); } stock.volume += q; atomicWrite(STATE_PATH, s); return reply(ctx, `${command === 'comprar_acao' ? 'Compra' : 'Venda'} executada: ${q} ${ticker} por R$ ${fmt(total)}. Risco: o preço pode subir ou cair.`); }
      if (command === 'fundos') { atomicWrite(STATE_PATH, s); return reply(ctx, '*Fundos*\n' + Object.values(s.funds).map((x) => `${x.id} — ${x.nome}: cota R$ ${fmt(x.cota)}, risco ${x.risco}`).join('\n')); }
      if (command === 'comprar_fundo' || command === 'vender_fundo') { const fid = String(a[0] || '').toLowerCase(); const q = Number(a[1]); const fund = s.funds[fid]; if (!fund || !Number.isInteger(q) || q <= 0) return reply(ctx, `Uso: ${prefix}${command} fundo cotas`); const total = money(fund.cota * q); if (command === 'comprar_fundo') { debit(s, p, total, `Compra de ${q} cotas ${fid}`); p.funds[fid] = (p.funds[fid] || 0) + q; } else { if ((p.funds[fid] || 0) < q) throw new Error('Cotas insuficientes.'); p.funds[fid] -= q; credit(s, p, total, `Venda de ${q} cotas ${fid}`); } atomicWrite(STATE_PATH, s); return reply(ctx, 'Operação de fundo executada.'); }
      if (command === 'imoveis') { atomicWrite(STATE_PATH, s); return reply(ctx, '*Mercado imobiliário*\n' + PROPERTIES.map((x) => `${x.id} — ${x.nome}: R$ ${fmt(x.preco)} | aluguel R$ ${fmt(x.aluguel)}`).join('\n')); }
      if (command === 'comprar_imovel') { const type = String(a[0] || '').toLowerCase(); const item = PROPERTIES.find((x) => x.id === type); if (!item) return reply(ctx, `Tipos: ${PROPERTIES.map((x) => x.id).join(', ')}`); debit(s, p, item.preco, `Compra de imóvel ${item.nome}`); const asset = { id: id('property'), kind: 'property', type, name: item.nome, value: item.preco, rent: item.aluguel, maintenance: item.preco * 0.002 }; p.assets.push(asset); s.metrics.assets += 1; atomicWrite(STATE_PATH, s); return reply(ctx, `${item.nome} adquirido por R$ ${fmt(item.preco)}. Manutenção mensal estimada: R$ ${fmt(asset.maintenance)}.`); }
      if (command === 'vender_imovel') { const asset = p.assets.find((x) => x.kind === 'property' && (!a[0] || x.id === a[0] || x.type === a[0])); if (!asset) return reply(ctx, 'Imóvel não encontrado.'); p.assets = p.assets.filter((x) => x !== asset); credit(s, p, asset.value * 0.95, `Venda de imóvel ${asset.name}`); atomicWrite(STATE_PATH, s); return reply(ctx, `Imóvel vendido por R$ ${fmt(asset.value * 0.95)} após custos.`); }
      if (command === 'alugar') { const asset = p.assets.find((x) => x.kind === 'property'); if (!asset) return reply(ctx, 'Você não possui imóvel para alugar.'); credit(s, p, asset.rent, `Aluguel recebido: ${asset.name}`); atomicWrite(STATE_PATH, s); return reply(ctx, `Aluguel recebido: R$ ${fmt(asset.rent)}.`); }
      if (command === 'recursos' || command === 'mercado' || command === 'precos') { atomicWrite(STATE_PATH, s); return reply(ctx, '*Mercado de recursos*\n' + Object.entries(s.prices).map(([k, v]) => `${k}: R$ ${fmt(v.price)} | oferta ${v.supply} | demanda ${v.demand}`).join('\n')); }
      if (command === 'criar_empresa') { const type = String(a[0] || '').toLowerCase(); const name = a.slice(1).join(' ') || `Empresa ${type}`; if (!COMPANY_TYPES.includes(type)) return reply(ctx, `Tipos: ${COMPANY_TYPES.join(', ')}`); const capital = 5000; debit(s, p, capital, `Capital inicial da empresa ${name}`); const company = { id: id('company'), owner: p.id, name, type, capital, revenue: 0, expenses: 0, profit: 0, debt: 0, reputation: 50, employees: [], stock: {}, inventory: {}, value: capital }; s.companies[company.id] = company; p.assets.push({ kind: 'company', id: company.id, name, value: capital }); s.metrics.companies += 1; atomicWrite(STATE_PATH, s); return reply(ctx, `Empresa criada: ${name}. Capital inicial: R$ ${fmt(capital)}.`); }
      if (command === 'empresa' || command === 'empresa_status' || command === 'caixa') { const mine = Object.values(s.companies).filter((c) => c.owner === p.id); atomicWrite(STATE_PATH, s); return reply(ctx, '*Empresas*\n' + (mine.map((c) => `${c.id} — ${c.name} (${c.type}) | caixa R$ ${fmt(c.capital)} | receita R$ ${fmt(c.revenue)} | lucro R$ ${fmt(c.profit)}`).join('\n') || 'Nenhuma empresa.')); }
      if (command === 'contratar' || command === 'demitir') { const c = Object.values(s.companies).find((x) => x.owner === p.id && (!a[0] || x.id === a[0])); if (!c) return reply(ctx, 'Empresa não encontrada.'); if (command === 'contratar') { c.employees.push({ id: id('employee'), role: a[1] || 'funcionário', salary: parseAmount(a[2]) || 1800, productivity: 1, satisfaction: 70 }); } else if (c.employees.length) c.employees.pop(); else return reply(ctx, 'A empresa não possui funcionários.'); atomicWrite(STATE_PATH, s); return reply(ctx, `${command === 'contratar' ? 'Funcionário contratado' : 'Funcionário demitido'} com sucesso.`); }
      if (command === 'produtos' || command === 'estoque') { const mine = Object.values(s.companies).filter((c) => c.owner === p.id); atomicWrite(STATE_PATH, s); return reply(ctx, mine.map((c) => `${c.name}: ${JSON.stringify(c.inventory)}`).join('\n') || 'Nenhum estoque cadastrado.'); }
      if (command === 'impostos') { const due = money(Math.max(0, p.cash * 0.1)); atomicWrite(STATE_PATH, s); return reply(ctx, `Imposto estimado: R$ ${fmt(due)} (10% sobre a base disponível). Use ${prefix}pagar_imposto valor.`); }
      if (command === 'pagar_imposto') { const v = parseAmount(a[0]) || money(p.cash * 0.1); debit(s, p, v, 'Imposto pago'); s.government.treasury += v; s.government.revenue += v; p.creditScore = Math.min(850, p.creditScore + 2); atomicWrite(STATE_PATH, s); return reply(ctx, `Imposto pago: R$ ${fmt(v)}. O valor foi enviado ao caixa do governo.`); }
      if (command === 'governo' || command === 'orcamento') { atomicWrite(STATE_PATH, s); return reply(ctx, `*Governo*\nCaixa: R$ ${fmt(s.government.treasury)}\nArrecadação: R$ ${fmt(s.government.revenue)}\nDívida pública: R$ ${fmt(s.government.debt)}\nInfraestrutura: ${s.government.infrastructure}\nSaúde: ${s.government.health}\nEducação: ${s.government.education}\nTransporte: ${s.government.transport}`); }
      if (command === 'economia' || command === 'inflacao' || command === 'juros' || command === 'desemprego') { atomicWrite(STATE_PATH, s); return reply(ctx, `*Indicadores econômicos*\nCiclo: ${s.macro.cycle}\nInflação mensal: ${(s.macro.inflation * 100).toFixed(2)}%\nJuros básicos: ${(s.macro.interest * 100).toFixed(2)}%\nDesemprego: ${(s.macro.unemployment * 100).toFixed(2)}%\nDia ${s.clock.day} | mês ${s.clock.month} | ano ${s.clock.year}`); }
      if (command === 'noticias' || command === 'eventos') { atomicWrite(STATE_PATH, s); return reply(ctx, '*Notícias e eventos*\n' + (s.news.slice(-10).reverse().map((n) => `${n.at}: ${n.title}`).join('\n') || 'Nenhum evento recente.')); }
      if (command === 'ranking') { const ranking = Object.values(s.players).sort((x, y) => netWorth(y, s) - netWorth(x, s)).slice(0, 10); atomicWrite(STATE_PATH, s); return reply(ctx, '*Ranking patrimonial*\n' + ranking.map((x, i) => `${i + 1}º ${x.nome}: R$ ${fmt(netWorth(x, s))}`).join('\n')); }
      atomicWrite(STATE_PATH, s); return help(ctx);
    });
  } catch (error) { return reply(ctx, `❌ ${error.message}`); }
}

function advance(days = 0) { return withLock(() => { const s = state(); if (days > 0) tick(s, days); else autoAdvance(s); atomicWrite(STATE_PATH, s); return s.clock; }); }
function isEconomyCommand(command) { return COMMANDS.has(String(command || '').toLowerCase()); }
module.exports = { COMMANDS, isEconomyCommand, handleCommand, STATE_PATH, TX_PATH, defaultState, tick, advance, syncLegacyRead, syncLegacyWrite };

if (process.env.DISABLE_ECONOMY_WORKER !== '1') {
  const worker = setInterval(() => {
    try { advance(); } catch (error) { console.error('[ECONOMY] worker:', error.message); }
  }, 60 * 60 * 1000);
  worker.unref();
}
