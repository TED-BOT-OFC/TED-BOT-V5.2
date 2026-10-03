'use strict';
const assert = require('assert');
const economy = require('../../arquivos/rpg/economySystem');
const replies = [];
const ctx = {
  command: 'noticias',
  args: [],
  prefix: '.',
  sender: 'test-noticias@s.whatsapp.net',
  pushName: 'Teste Noticias',
  reply: async (message) => { replies.push(message); return true; }
};
economy.handleCommand(ctx).then(() => {
  assert(replies.length === 1, 'noticias não respondeu');
  assert(replies[0].includes('Notícias e eventos'), 'resposta de noticias inválida');
  console.log('TESTE NOTICIAS: PASSOU');
}).catch((error) => { console.error('TESTE NOTICIAS: FALHOU'); console.error(error.stack || error); process.exitCode = 1; });
