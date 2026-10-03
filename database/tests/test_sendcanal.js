const assert = require('assert');
const handler = require('../../index.js');

const ownerJid = '559984814822@s.whatsapp.net';
const groupJid = '120363000000000000@g.us';
const newsletterJid = '120363429096081036@newsletter';
const sent = [];

const sock = {
  user: { id: '5511999999999:1@s.whatsapp.net' },
  async sendPresenceUpdate() {},
  async groupMetadata() {
    return {
      subject: 'Grupo de teste',
      owner: ownerJid,
      participants: [
        { id: ownerJid, phoneNumber: '559984814822', admin: 'superadmin' },
        { id: '5511999999999@s.whatsapp.net', phoneNumber: '5511999999999', admin: 'admin' },
      ],
    };
  },
  async sendMessage(to, content, options) {
    sent.push({ to, content, options });
    return { key: { id: String(sent.length) } };
  },
};

const event = {
  messages: [{
    key: {
      remoteJid: groupJid,
      participant: ownerJid,
      fromMe: false,
      id: 'TEST-SENDCANAL-TEXT',
    },
    pushName: 'Dono',
    message: {
      extendedTextMessage: {
        text: '!sendcanal',
        contextInfo: {
          quotedMessage: {
            conversation: 'Mensagem de teste para o canal',
          },
        },
      },
    },
  }],
};

(async () => {
  await handler(event, sock);

  const publication = sent.find(item => item.to === newsletterJid);
  assert(publication, 'A publicação no newsletter não foi enviada.');
  assert.strictEqual(publication.content.text, 'Mensagem de teste para o canal');
  assert(sent.some(item => item.content?.react?.text === '✅'), 'A reação de sucesso não foi enviada.');
  console.log('sendcanal: teste de texto aprovado');
  process.exit(0);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
