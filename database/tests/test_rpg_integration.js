'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const rpg = require(path.join(PROJECT_ROOT, 'arquivos/rpg/rpgSystem'));
const profileService = require(path.join(PROJECT_ROOT, 'arquivos/rpg/rpgProfileService'));
const rpgManager = require(path.join(PROJECT_ROOT, 'database/sistema/rpgManager'));
const data = require(path.join(PROJECT_ROOT, 'arquivos/rpg/rpgData'));

const files = [
  rpg.FILES.players,
  rpg.FILES.cooldowns,
  rpg.FILES.bets,
  rpg.FILES.bankRatings,
  rpg.FILES.avatars,
  profileService.STATE_PATH,
  path.join(PROJECT_ROOT, 'database/economy_transactions.json'),
  path.join(PROJECT_ROOT, 'database/economy_audit.json'),
  rpgManager.CONFIG_PATH
];
const backups = new Map();
for (const file of files) backups.set(file, fs.existsSync(file) ? fs.readFileSync(file) : null);

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function player(jid) { return readJson(rpg.FILES.players).find((item) => item.id === jid); }

const messages = [];
const groupFlags = {};
const sock = {
  async sendMessage(from, content) {
    messages.push({ from, content });
    return { key: { id: String(messages.length) } };
  },
  async sendPresenceUpdate() {}
};

function makeContext(command, args = [], sender = '11111111111@s.whatsapp.net', extras = {}) {
  const text = `${extras.prefix || '!'}${command}${args.length ? ` ${args.join(' ')}` : ''}`;
  return {
    sock,
    from: extras.from || '120363000000000000@g.us',
    info: extras.info || { key: { id: 'abc', remoteJid: extras.from || '120363000000000000@g.us', participant: sender }, message: {} },
    sender,
    command,
    args,
    isGroup: extras.isGroup !== undefined ? extras.isGroup : true,
    prefix: extras.prefix || '!',
    botName: 'TED BOT',
    body: text,
    reply: async (textReply, mentions = []) => messages.push({ from: extras.from || '120363000000000000@g.us', content: { text: textReply, mentions } }),
    isRpgEnabled: (group) => groupFlags[group] === true,
    setRpgEnabled: (group, enabled) => { groupFlags[group] = enabled; },
    getVerification: async () => ({ isSenderAdmin: true, isSenderOwner: false, isSenderDonoBot: false, isBotAdmin: true }),
    downloadImage: async () => Buffer.from('image')
  };
}

async function run(command, args = [], sender, extras) {
  const handled = await rpg.handleCommand(makeContext(command, args, sender, extras));
  assert.strictEqual(handled, true, `${command} deveria ser tratado pelo núcleo RPG`);
}

async function test() {
  try {
    writeJson(rpg.FILES.players, []);
    writeJson(rpg.FILES.cooldowns, {});
    writeJson(rpg.FILES.bets, { total: 0, nivel: 1 });
    writeJson(rpg.FILES.bankRatings, {});
    writeJson(rpg.FILES.avatars, []);
    fs.rmSync(profileService.STATE_PATH, { force: true });
    fs.rmSync(path.join(PROJECT_ROOT, 'database/economy_transactions.json'), { force: true });
    fs.rmSync(path.join(PROJECT_ROOT, 'database/economy_audit.json'), { force: true });
    writeJson(rpgManager.CONFIG_PATH, {});

    const senderA = '11111111111@s.whatsapp.net';
    const senderB = '22222222222@s.whatsapp.net';

    assert.strictEqual(rpg.isRpgCommand('registrorpg'), true);
    assert.strictEqual(rpg.isRpgCommand('rankbancos'), true);
    assert.strictEqual(rpg.isRpgCommand('comandoinexistente'), false);
    assert.strictEqual(data.HOUSES.length, 15);
    assert.strictEqual(data.LUXURY_CARS.length, 15);
    assert.strictEqual(data.BANKS.length, 5);

    await run('modorpg', ['1'], senderA);
    assert.strictEqual(groupFlags['120363000000000000@g.us'], true);
    await run('menurpg', [], senderA);
    assert(messages.some((message) => message.content.audio), 'menu RPG deveria enviar áudio');
    assert(messages.some((message) => message.content.image && message.content.caption?.includes('MENU RPG')), 'menu RPG deveria enviar imagem e legenda');

    await run('registrorpg', ['Alice'], senderA);
    await run('registrorpg', ['Bruno'], senderB);
    assert.strictEqual(player(senderA).dinheiro, 100);
    assert.match(player(senderA).pix, /^\d{11}@pix$/);

    await run('comprarescova', [], senderA);
    assert.strictEqual(player(senderA).escova, true);
    assert.strictEqual(player(senderA).dinheiro, 50);
    await run('escovar', [], senderA);

    await run('abrirbanco', [], senderA);
    await run('depositarrpg', ['25'], senderA);
    assert.strictEqual(player(senderA).carteiraBanco, 125);
    assert.strictEqual(player(senderA).dinheiro, 25);
    await run('sacarrpg', ['25'], senderA);
    assert.strictEqual(player(senderA).carteiraBanco, 100);
    assert.strictEqual(player(senderA).dinheiro, 50);

    await run('meupix', [], senderA);
    assert(messages.some((message) => message.content.interactiveButtons?.[0]?.name === 'cta_copy'), 'meupix deveria enviar botão de cópia');

    let players = readJson(rpg.FILES.players);
    players.find((item) => item.id === senderA).dinheiro = 30000000;
    players.find((item) => item.id === senderB).dinheiro = 100000;
    writeJson(rpg.FILES.players, players);

    await run('fazerpix', [`${player(senderB).pix}/500`], senderA);
    assert.strictEqual(player(senderB).dinheiro, 100500);

    await run('bancorpg', ['nubank'], senderA);
    await run('bancorpg', ['bradesco'], senderB);
    const beforeTransferB = player(senderB).dinheiro;
    await run('transferirrpg', ['Bruno/1000'], senderA);
    assert.strictEqual(player(senderB).dinheiro, beforeTransferB + 950, 'transferência entre bancos distintos deve cobrar 5%');

    await run('comprarrpgcasa', ['1'], senderA);
    await run('comprarrpgdeluxo', ['1'], senderA);
    assert.deepStrictEqual(player(senderA).casas, ['Apartamento Simples']);
    assert.deepStrictEqual(player(senderA).carros, ['Ferrari SF90 Stradale']);
    await run('minhascasasrpg', [], senderA);
    await run('garagemrpg', [], senderA);
    await run('meuscarros', [], senderA);
    const moneyBeforeTax = player(senderA).dinheiro;
    await run('pagarpva', [], senderA);
    assert.strictEqual(player(senderA).dinheiro, moneyBeforeTax - 25000, 'IPVA deve ser 5% do valor do veículo');

    await run('escolhervida', ['trabalhador'], senderA);
    assert.strictEqual(player(senderA).modoVida, 'trabalhador');
    await run('modosvida', [], senderA);

    players = readJson(rpg.FILES.players);
    players.find((item) => item.id === senderA).ultimoModoVida = Date.now();
    writeJson(rpg.FILES.avatars, [{ id: senderA, avatar: 'https://example.test/avatar.jpg' }]);
    await run('statusrpg', [], senderA);
    assert(messages.some((message) => message.content.image?.url === 'https://example.test/avatar.jpg'), 'status deveria enviar o avatar gravado');
    await run('status', [], senderA);
    await run('saldorpg', [], senderA);
    await run('ajudarpg', [], senderA);
    await run('depositar', ['help'], senderA);
    await run('historicoxp', [], senderA);
    assert(messages.some((message) => message.content.text?.includes('DEPÓSITO RPG')), 'depósito semântico deveria oferecer ajuda contextual');
    assert(messages.some((message) => message.content.text?.includes('não há alterações de XP')), 'histórico de XP deveria informar ausência de registros');

    const originalRandom = Math.random;
    Math.random = () => 0;
    await run('apostarrpg', ['500'], senderA);
    Math.random = originalRandom;
    assert.strictEqual(readJson(rpg.FILES.bets).total, 0, 'vitória deve zerar a casa de apostas');

    players = readJson(rpg.FILES.players);
    players.find((item) => item.id === senderA).dinheiro = 6000;
    players.find((item) => item.id === senderA).preso = true;
    players.find((item) => item.id === senderA).tempoPrisao = 2;
    writeJson(rpg.FILES.players, players);
    await run('pagarfianca', [], senderA);
    assert.strictEqual(player(senderA).preso, false);
    assert.strictEqual(player(senderA).dinheiro, 1000);

    await run('rankbancos', [], senderA);
    assert(messages.some((message) => message.content.text?.includes('Ranking dos Bancos RPG')), 'ranking bancário deveria ser exibido');

    await run('sairrpg', ['confirmar'], senderB);
    assert.strictEqual(player(senderB), undefined, 'sairrpg confirmar deve apagar o cadastro do jogador');

    console.log('TESTE RPG: PASSOU');
  } finally {
    for (const [file, backup] of backups) {
      if (backup === null) fs.rmSync(file, { force: true });
      else fs.writeFileSync(file, backup);
    }
  }
}

test().catch((error) => {
  console.error('TESTE RPG: FALHOU');
  console.error(error.stack || error);
  process.exitCode = 1;
});
