'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { findParticipant, resolveTarget } = require('../../arquivos/menus/adverter');
const manager = require('../../database/sistema/xingamentosManager');

const dbPath = path.join(__dirname, '../../database/sistema/xingamentos.json');
const original = fs.readFileSync(dbPath);
const participants = [
  { id: '5511999999999@s.whatsapp.net', admin: null },
  { id: '12345678901234@lid', jid: '5511888888888@s.whatsapp.net', admin: null },
  { id: '5511777777777@s.whatsapp.net', admin: 'admin' }
];

function info({ mentionedJid, participant } = {}) {
  return { message: { extendedTextMessage: { contextInfo: { mentionedJid, participant } } }, key: { participant: '5511000000000@s.whatsapp.net' } };
}

try {
  assert.strictEqual(findParticipant(participants, '@5511999999999')?.id, '5511999999999@s.whatsapp.net');
  assert.strictEqual(findParticipant(participants, '12345678901234@lid')?.id, '12345678901234@lid');
  assert.strictEqual(resolveTarget(info({ mentionedJid: ['5511999999999@s.whatsapp.net'] }), participants, [])?.id, '5511999999999@s.whatsapp.net');
  assert.strictEqual(resolveTarget(info(), participants, ['@5511999999999'])?.id, '5511999999999@s.whatsapp.net');
  assert.strictEqual(resolveTarget(info({ participant: '5511999999999@s.whatsapp.net' }), participants, [])?.id, '5511999999999@s.whatsapp.net');
  assert.strictEqual(resolveTarget(info(), participants, ['@5500000000000']), null);

  const group = 'test-warning-removal@g.us';
  const user = '5511999999999@s.whatsapp.net';
  manager.resetAdvertencias(group, user);
  assert.strictEqual(manager.addAdvertencia(group, user), 1);
  assert.strictEqual(manager.addAdvertencia(group, user), 2);
  assert.strictEqual(manager.removeAdvertencia(group, user), 1);
  assert.strictEqual(manager.getAdvertencias(group, user), 1);
  assert.strictEqual(manager.removeAdvertencia(group, user), 0);
  assert.strictEqual(manager.removeAdvertencia(group, user), 0);
  assert.strictEqual(manager.getAdvertencias(group, user), 0);
  console.log('TESTE ADVERTÊNCIA: PASSOU');
} finally {
  fs.writeFileSync(dbPath, original);
}
