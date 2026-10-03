'use strict';

const fs = require('fs');
const path = require('path');
const FormData = globalThis.FormData;
const Blob = globalThis.Blob;
const fetch = globalThis.fetch;
const economySync = require('./economySystem');
const profileService = require('./rpgProfileService');
const { 
  MENU_IMAGES,
  MENU_AUDIO_URL,
  MENU_THUMBNAIL_URL,
  MENU_SITE_URL,
  HOUSES,
  LUXURY_CARS,
  CAR_VALUES,
  BANKS,
  LIFE_MODES,
  BET_WARNINGS,
  EXIT_MESSAGES
} = require('./rpgData');

const DATABASE_DIR = path.resolve(__dirname, '../../database');
const FILES = {
  players: path.join(DATABASE_DIR, 'rpg.json'),
  cooldowns: path.join(DATABASE_DIR, 'cooldowns.json'),
  bets: path.join(DATABASE_DIR, 'caixa_apostas.json'),
  bankRatings: path.join(DATABASE_DIR, 'avaliacoesBancos.json'),
  avatars: path.join(DATABASE_DIR, 'avatars.json')
};

const RPG_COMMANDS = new Set([
  'modorpg', 'rpg', 'menurpg',
  'comprarescova', 'escovar', 'registrorpg', 'meupix', 'fazerpix',
  'trabalhar', 'ajudarpg', 'historicoxp', 'abrirbanco', 'minhaconta', 'perfilrpg', 'status', 'statusrpg', 'avatar',
  'sacarrpg', 'rendimentorpg', 'saldorpg', 'depositarrpg', 'depositar', 'sairrpg',
  'lojadeluxorpg', 'lojacasasrpg', 'minhascasasrpg', 'comprarrpgcasa',
  'garagemrpg', 'escolhervida', 'modosvida', 'pagarfianca', 'assaltarrpg',
  'apostarrpg', 'pagarpva', 'comprarrpgdeluxo', 'meuscarros',
  'transferirrpg', 'bancorpg', 'rankbancos'
]);

const workingPlayers = new Set();
let lastMenuImage = null;

function ensureDirectory() {
  fs.mkdirSync(DATABASE_DIR, { recursive: true });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readJson(filePath, fallback) {
  ensureDirectory();
  if (!fs.existsSync(filePath)) {
    writeJson(filePath, fallback);
    return clone(fallback);
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`[RPG] JSON inválido em ${filePath}:`, error.message);
    return clone(fallback);
  }
}

function writeJson(filePath, data) {
  ensureDirectory();
  const temporaryPath = `${filePath}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(temporaryPath, filePath);
}

function getPlayers() {
  const players = readJson(FILES.players, []);
  return Array.isArray(players) ? players : [];
}

function savePlayers(players) {
  writeJson(FILES.players, players);
  economySync.syncLegacyWrite(players);
}

function getPlayer(players, jid) {
  return players.find((player) => player.id === jid);
}

function parseInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function parseMoney(value) {
  if (value === undefined || value === null || value === '') return NaN;
  const cents = profileService.cents(String(value));
  return cents > 0 ? profileService.fromCents(cents) : NaN;
}

function randomFrom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function number(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function formatNumber(value) {
  return number(value).toLocaleString('pt-BR');
}

function commandHelp(command, prefix) {
  const p = prefix || '!';
  const help = {
    depositar: `🏦 *DEPÓSITO RPG*\n\nServe para transferir dinheiro em espécie para sua conta bancária.\n\nComo usar:\n*${p}depositar <valor>*\nExemplo: *${p}depositar 5000*\n\nRequisitos:\n• possuir conta bancária;\n• possuir dinheiro suficiente;\n• valor maior que zero.\n\nErros comuns:\n• *Valor inválido*: use apenas números;\n• *Saldo insuficiente*: escolha um valor menor ou consulte *${p}saldorpg*.` ,
    sacar: `🏦 *SAQUE RPG*\n\nTransfere saldo bancário para o dinheiro em espécie.\n\nSintaxe: *${p}sacar <valor>*\nExemplo: *${p}sacarrpg 1000*\n\nRequisitos: conta bancária e saldo suficiente.`,
    status: `📊 *STATUS RPG*\n\nMostra XP global, level derivado, dinheiro, banco, profissão, empréstimos, estatísticas e patrimônio sem inventar dados.\n\nUse: *${p}statusrpg* ou *${p}status*`,
    saldo: `💰 *SALDO RPG*\n\nMostra apenas carteira, banco, total disponível, dívidas e patrimônio líquido.\n\nUse: *${p}saldorpg*`,
    trabalhar: `💼 *TRABALHAR*\n\nRealiza uma atividade e concede dinheiro e XP global.\n\nSintaxe: *${p}trabalhar* ou *${p}trabalhar <profissão>*\nExemplo: *${p}trabalhar vendedor*\n\nRequisitos da profissão são consultados na configuração central. Aguarde 15 segundos entre trabalhos.`,
    fazerpix: `💠 *FAZER PIX*\n\nTransfere dinheiro para outro jogador pela chave PIX.\n\nSintaxe: *${p}fazerpix chavePIX/valor*\nExemplo: *${p}fazerpix 12345678901@pix/500*\n\nO PIX não concede XP automaticamente; se uma regra futura conceder XP, ela deverá usar o XPService.`,
    historicoxp: `📜 *HISTÓRICO DE XP*\n\nExibe alterações de XP, motivo, origem, operação e level antes/depois.\n\nUse: *${p}historicoxp*`,
    rpg: `📚 *AJUDA RPG*\n\nUse *${p}statusrpg*, *${p}saldorpg*, *${p}trabalhar*, *${p}depositar valor*, *${p}fazerpix chave/valor* e *${p}historicoxp*.\n\nPara ajuda específica, use *${p}depositar help* ou *${p}trabalhar help*.`
  };
  return help[command] || help.rpg;
}

function extractRawArgument(ctx) {
  const prefixAndCommand = `${ctx.prefix}${ctx.command}`;
  const body = typeof ctx.body === 'string' ? ctx.body : '';
  if (body.toLowerCase().startsWith(prefixAndCommand.toLowerCase())) {
    return body.slice(prefixAndCommand.length).trim();
  }
  return (ctx.args || []).join(' ').trim();
}

function getMentionedJid(info) {
  return info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || null;
}

function getExitMessages(level) {
  for (const [limit, messages] of Object.entries(EXIT_MESSAGES)) {
    if (limit === 'infinity' || level < Number(limit)) return messages;
  }
  return EXIT_MESSAGES.infinity;
}

function chooseMenuImage() {
  const candidates = MENU_IMAGES.filter((url) => url !== lastMenuImage);
  const image = randomFrom(candidates.length ? candidates : MENU_IMAGES);
  lastMenuImage = image;
  return image;
}

function renderRpgMenu(prefix, botName, sender) {
  const now = new Date();
  const currentTime = now.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour12: false });
  const currentDate = now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  return `
╭── 🎮 MENU RPG ──╮
│ 📅 Data: ${currentDate}
│ ⏰ Hora: ${currentTime}
│ 👤 Usuário: @${sender.split('@')[0]}
╰────────────────────╯
━━━━━━━━━━━━━━━
📋 INICIAIS
━━━━━━━━━━━━━━━
📌 Registrar → ${prefix}registrorpg
🛍️ Comprar Escova → ${prefix}comprarescova
🪥 Escovar os Dentes → ${prefix}escovar
━━━━━━━━━━━━━━━
💼 TRABALHO & PROGRESSO
━━━━━━━━━━━━━━━
💼 Trabalhar → ${prefix}trabalhar
📊 Status Geral → ${prefix}statusrpg
📚 Ajuda contextual → ${prefix}ajudarpg
📜 Histórico de XP → ${prefix}historicoxp
━━━━━━━━━━━━━━━
🏦 BANCO & FINANÇAS
━━━━━━━━━━━━━━━
🏦 Abrir Banco → ${prefix}abrirbanco
💳 Minha Conta → ${prefix}minhaconta
💸 Operações Bancárias:
💰 Sacar → ${prefix}sacarrpg
💼 Depositar → ${prefix}depositarrpg
📊 Saldo → ${prefix}saldorpg
📈 Rendimentos → ${prefix}rendimentorpg
🔁 Transferência → ${prefix}transferirrpg
🏅 Ranking de Bancos → ${prefix}rankbancos
🏛️ Banco Central → ${prefix}bancorpg
🏛️ Bancos disponíveis → ${prefix}bancos
💳 Conta bancária → ${prefix}banco
🏦 Abrir conta → ${prefix}abrir_conta
🔎 Selecionar banco → ${prefix}selecionar_banco código
📥 Depositar → ${prefix}depositar_banco valor
📤 Sacar → ${prefix}sacar_banco valor
🔁 Transferir do banco → ${prefix}transferir_banco id valor
🎁 Doar → ${prefix}doar id valor
━━━━━━━━━━━━━━━
🛍️ LOJAS & LUXO
━━━━━━━━━━━━━━━
🏬 Loja de Luxo → ${prefix}lojadeluxorpg
💎 Comprar de Luxo → ${prefix}comprarrpgdeluxo
━━━━━━━━━━━━━━━
🚗 CARROS & GARAGEM
━━━━━━━━━━━━━━━
🚗 Meus Carros → ${prefix}meuscarros
🅿️ Garagem → ${prefix}garagemrpg
💳 Pagar IPVA → ${prefix}pagarpva
━━━━━━━━━━━━━━━
🏠 CASAS & IMÓVEIS
━━━━━━━━━━━━━━━
🏠 Loja de Casas → ${prefix}lojacasasrpg
🏡 Comprar Casa → ${prefix}comprarrpgcasa
🏘️ Minhas Casas → ${prefix}minhascasasrpg
━━━━━━━━━━━━━━━
🌱 MODOS DE VIDA
━━━━━━━━━━━━━━━
🌍 Ver Modos de Vida → ${prefix}modosvida
🎯 Escolher Vida → ${prefix}escolhervida
━━━━━━━━━━━━━━━
🎲 AÇÃO & RISCO
━━━━━━━━━━━━━━━
🎰 Casa de Apostas → ${prefix}apostarrpg
🕵️ Assaltar Jogador → ${prefix}assaltarrpg
🪪 Pagar Fiança → ${prefix}pagarfianca
━━━━━━━━━━━━━━━
💸 PIX & INVESTIMENTOS
━━━━━━━━━━━━━━━
💠 Meu Pix → ${prefix}meupix
📤 Fazer Pix → ${prefix}fazerpix
━━━━━━━━━━━━━━━
📈 ECONOMIA & PATRIMÔNIO
━━━━━━━━━━━━━━━
👤 Perfil econômico → ${prefix}perfil
💰 Saldo → ${prefix}saldo
💰 Patrimônio → ${prefix}patrimonio
📜 Extrato → ${prefix}extrato
📚 Histórico → ${prefix}historico
🏆 Ranking → ${prefix}ranking
❓ Ajuda econômica → ${prefix}economiaajuda
━━━━━━━━━━━━━━━
💼 TRABALHO & CRÉDITO
━━━━━━━━━━━━━━━
📋 Empregos → ${prefix}empregos
🎓 Escolher trabalho → ${prefix}trabalho código
💵 Salário → ${prefix}salario
💳 Empréstimo → ${prefix}emprestimo valor
🏦 Financiamento → ${prefix}financiamento valor
📉 Dívidas → ${prefix}dividas
💵 Pagar dívida → ${prefix}pagar valor
━━━━━━━━━━━━━━━
📊 MERCADOS & ATIVOS
━━━━━━━━━━━━━━━
📈 Bolsa → ${prefix}bolsa
🪙 Ações → ${prefix}acoes
➕ Comprar ação → ${prefix}comprar_acao TICKER quantidade
➖ Vender ação → ${prefix}vender_acao TICKER quantidade
🏦 Fundos → ${prefix}fundos
➕ Comprar fundo → ${prefix}comprar_fundo fundo cotas
➖ Vender fundo → ${prefix}vender_fundo fundo cotas
🏠 Imóveis → ${prefix}imoveis
🏡 Comprar imóvel → ${prefix}comprar_imovel tipo
🏷️ Vender imóvel → ${prefix}vender_imovel tipo
🔑 Receber aluguel → ${prefix}alugar
🌾 Recursos → ${prefix}recursos
📦 Mercado → ${prefix}mercado
💲 Preços → ${prefix}precos
━━━━━━━━━━━━━━━
🏢 EMPRESAS
━━━━━━━━━━━━━━━
🏭 Criar empresa → ${prefix}criar_empresa tipo nome
📊 Empresa → ${prefix}empresa
📋 Status empresarial → ${prefix}empresa_status
👥 Contratar → ${prefix}contratar id cargo salário
🚪 Demitir → ${prefix}demitir id
🛒 Produtos → ${prefix}produtos
📦 Estoque → ${prefix}estoque
💼 Caixa empresarial → ${prefix}caixa
━━━━━━━━━━━━━━━
🌍 CIDADE & GOVERNO
━━━━━━━━━━━━━━━
📉 Economia → ${prefix}economia
📈 Inflação → ${prefix}inflacao
🏦 Juros → ${prefix}juros
👥 Desemprego → ${prefix}desemprego
🧾 Impostos → ${prefix}impostos
💸 Pagar imposto → ${prefix}pagar_imposto valor
🏛️ Governo → ${prefix}governo
💰 Orçamento → ${prefix}orcamento
📰 Notícias → ${prefix}noticias
🎲 Eventos → ${prefix}eventos
⏩ Avançar calendário → ${prefix}tickeconomia dias
━━━━━━━━━━━━━━━
🚪 SAIR DO RPG
━━━━━━━━━━━━━━━
❌ Sair do RPG → ${prefix}sairrpg
`;
}

function createPix() {
  let pix = '';
  for (let index = 0; index < 11; index += 1) pix += Math.floor(Math.random() * 10);
  return `${pix}@pix`;
}

async function sendMenu(ctx) {
  if (!ctx.isGroup || !ctx.isRpgEnabled(ctx.from)) {
    await ctx.reply(`⚠️ O modo RPG está desativado neste grupo.\n\nPara ativar, um administrador deve usar:\n*${ctx.prefix}modorpg 1*`);
    return;
  }

  const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
  try {
    await ctx.sock.sendPresenceUpdate('recording', ctx.from);
    await delay(800);
    await ctx.sock.sendPresenceUpdate('paused', ctx.from);
    await delay(100);
    await ctx.sock.sendMessage(ctx.from, {
      audio: { url: MENU_AUDIO_URL },
      mimetype: 'audio/mpeg',
      ptt: true
    }, { quoted: ctx.info });
    await delay(300);
    await ctx.sock.sendMessage(ctx.from, {
      image: { url: chooseMenuImage() },
      caption: renderRpgMenu(ctx.prefix, ctx.botName, ctx.sender),
      contextInfo: {
        mentionedJid: [ctx.sender],
        externalAdReply: {
          showAdAttribution: true,
          mediaType: 1,
          mediaUrl: null,
          title: `⚡️ ${ctx.botName} ⚡️`,
          body: 'ミ★ 》 𝘴𝘪𝘵𝘦 𝘰𝘧𝘤《★彡',
          sourceUrl: MENU_SITE_URL,
          thumbnailUrl: MENU_THUMBNAIL_URL
        }
      }
    }, { quoted: ctx.info });
  } catch (error) {
    console.error('[RPG] Erro ao carregar menu:', error);
    await ctx.reply('❌ Erro ao carregar o menu RPG.');
  }
}

async function handleModeToggle(ctx) {
  if (!ctx.isGroup) return ctx.reply('Este comando só pode ser usado em grupos.');
  const verification = await ctx.getVerification();
  const canManage = verification.isSenderAdmin || verification.isSenderOwner || verification.isSenderDonoBot;
  if (!canManage) return ctx.reply('Este comando só pode ser usado por administradores do grupo.');
  if (!verification.isBotAdmin) return ctx.reply('Preciso ser administrador do grupo para alterar o modo RPG.');
  if (!ctx.args.length) {
    return ctx.reply(`Use 1 pra ativar ou 0 pra desativar o modo RPG. Exemplo: ${ctx.prefix}${ctx.command} 1 para ativar.`);
  }

  const option = Number(ctx.args[0]);
  const mention = `@${ctx.sender.split('@')[0]}`;
  if (option === 1) {
    if (ctx.isRpgEnabled(ctx.from)) return ctx.reply(`${mention} o modo RPG já está ativado neste grupo. Para desativar, use 0.`, [ctx.sender]);
    ctx.setRpgEnabled(ctx.from, true);
    return ctx.reply(`O modo RPG foi *ativado* com sucesso pelo(a) admin ${mention}.`, [ctx.sender]);
  }
  if (option === 0) {
    if (!ctx.isRpgEnabled(ctx.from)) return ctx.reply(`${mention} o modo RPG já está desativado neste grupo. Para ativar, use 1.`, [ctx.sender]);
    ctx.setRpgEnabled(ctx.from, false);
    return ctx.reply(`O modo RPG foi *desativado* com sucesso pelo(a) admin ${mention}.`, [ctx.sender]);
  }
  return ctx.reply('Use 1 para ativar e 0 para desativar o modo RPG neste grupo.');
}

async function handleAvatar(ctx) {
  const imageMessage = ctx.info?.message?.imageMessage || ctx.info?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  if (!imageMessage) {
    return ctx.reply(`❌ Envie ou responda uma *imagem* com o comando *${ctx.prefix}avatar*`);
  }

  try {
    const buffer = await ctx.downloadImage(imageMessage);
    const mimeType = imageMessage.mimetype || 'image/jpeg';
    const extension = mimeType.includes('png') ? 'png' : 'jpg';
    if (!FormData || !Blob || !fetch) throw new Error('As APIs nativas de upload não estão disponíveis neste ambiente.');
    const formData = new FormData();
    formData.append('file', new Blob([buffer], { type: mimeType }), `avatar.${extension}`);
    const response = await fetch('https://tedzinho.com.br/upload', {
      method: 'POST',
      body: formData
    });
    const uploaded = await response.json();
    if (!uploaded.fileUrl) throw new Error(uploaded.message || 'Resposta inválida do servidor de upload.');

    const avatars = readJson(FILES.avatars, []);
    const avatarIndex = avatars.findIndex((avatar) => avatar.id === ctx.sender);
    if (avatarIndex >= 0) avatars[avatarIndex].avatar = uploaded.fileUrl;
    else avatars.push({ id: ctx.sender, avatar: uploaded.fileUrl });
    writeJson(FILES.avatars, avatars);
    return ctx.reply(`✅ Avatar atualizado com sucesso!\n\n📸 Novo Avatar:\n${uploaded.fileUrl}`);
  } catch (error) {
    console.error('[RPG] Erro no avatar:', error.message);
    return ctx.reply('❌ Não foi possível atualizar o avatar. Tente novamente com outra imagem.');
  }
}

async function handleWork(ctx, player) {
  const cooldowns = readJson(FILES.cooldowns, {});
  const now = Date.now();
  const waitTime = 15 * 1000;
  const lastWork = number(cooldowns[ctx.sender], 0);
  if (now - lastWork < waitTime) {
    const remaining = Math.ceil((waitTime - (now - lastWork)) / 1000);
    return ctx.reply(`⏳ Você já está trabalhando! Aguarde *${remaining} segundos*.`);
  }
  if (workingPlayers.has(ctx.sender)) {
    return ctx.reply('⏳ Você já está trabalhando! Aguarde 15 segundos para concluir o trabalho.');
  }

  cooldowns[ctx.sender] = now;
  writeJson(FILES.cooldowns, cooldowns);
  workingPlayers.add(ctx.sender);
  await ctx.reply('🧹 Você começou a trabalhar... Aguarde 15 segundos.');

  setTimeout(async () => {
    try {
      const operationId = `work:${ctx.sender}:${ctx.info?.key?.id || now}`;
      const result = profileService.completeWork(ctx.sender, {
        operationId,
        pushName: player.nome,
        reason: 'Trabalho — atividade geral',
        source: 'trabalho'
      });
      if (result.duplicate) return;
      const levelMessage = result.levelUp
        ? `🎉 *LEVEL UP!* Você alcançou o Level *${result.afterLevel}*.\n`
        : '';
      await ctx.sock.sendMessage(ctx.from, {
        text: `💼 *Trabalho finalizado!*\n` +
          `👔 Empregos realizados: *${result.workCount}*\n` +
          `📊 Progresso até salário máximo: *${Math.min(result.workCount, 50)}/50*\n` +
          `💰 Salário base: *R$ ${formatNumber(result.salaryBase)}*\n` +
          `📈 Bônus de level: *x${result.multiplier.toFixed(1)}*\n` +
          `💸 Você ganhou: *R$ ${formatNumber(result.earnedMoney)}*\n` +
          `⭐ XP ganho: *+${result.earnedXp}*\n` +
          `📊 XP global: *${result.afterXp}*\n` + levelMessage
      }, { quoted: ctx.info });
    } catch (error) {
      console.error('[RPG] Falha ao concluir trabalho:', error);
      await ctx.sock.sendMessage(ctx.from, { text: `❌ Não foi possível concluir o trabalho.\nComo corrigir: tente novamente após alguns segundos.\nDetalhe: ${error.message}` }, { quoted: ctx.info });
    } finally {
      workingPlayers.delete(ctx.sender);
    }
  }, waitTime);
}

async function handleStatus(ctx, player) {
  const now = Date.now();
  const profile = profileService.getProfile(ctx.sender, { pushName: player.nome });
  const avatars = readJson(FILES.avatars, []);
  const avatar = avatars.find((item) => item.id === ctx.sender)?.avatar;
  const bank = BANKS.find((item) => item.id === profile.bankId || item.nome.toLowerCase() === String(profile.bankName || '').toLowerCase());
  const value = (item, fallback = 'Não disponível') => item === null || item === undefined || item === '' ? fallback : item;
  const bankBalance = profile.bankName || profile.bank > 0 ? `R$ ${formatNumber(profile.bank)}` : 'Não disponível';
  const info = [
    `👤 *Jogador:* ${value(profile.name)}`,
    `⭐ *Level:* ${profile.level}`,
    `✨ *XP global:* ${formatNumber(profile.xp)} XP`,
    `📈 *Próximo level:* ${profile.levelInfo.remainingXp} XP restantes (${profile.levelInfo.nextLevelXp} XP)`,
    `💰 *Dinheiro:* R$ ${formatNumber(profile.cash)}`,
    `🏦 *Banco:* ${value(bank?.nome || profile.bankName)}`,
    `💳 *Saldo bancário:* ${bankBalance}`,
    `💼 *Profissão:* ${value(profile.profession)}`,
    `📊 *Progresso profissional:* ${profile.professionalProgress === null ? 'Não disponível' : `${profile.professionalProgress}%`}`,
    `💵 *Empréstimos:* ${profile.debt > 0 ? `R$ ${formatNumber(profile.debt)}` : 'Não disponível'}`,
    `📅 *Parcelas restantes:* ${profile.installmentsRemaining || 'Não disponível'}`,
    `🏆 *Estatísticas:* trabalhos ${profile.workCount || 0} · XP recebido ${profile.stats.xpGained || 0}`,
    `💠 *PIX:* ${value(profile.pix)}`,
    `📦 *Patrimônio líquido:* R$ ${formatNumber(profile.netWorth)}`,
    `🧾 *Última atualização:* ${new Date(now).toLocaleString('pt-BR')}`
  ];
  const caption = `\n╭━━━〔 *📊 STATUS RPG* 〕━━━╮\n┃ ${info.join('\n┃ ')}\n╰━━━━━━━━━━━━━━━━━━━━━━━╯\n`;
  if (avatar) return ctx.sock.sendMessage(ctx.from, { image: { url: avatar }, caption }, { quoted: ctx.info });
  return ctx.reply(caption);
}

async function handleCommand(ctx) {
  const command = ctx.command.toLowerCase();
  if (!RPG_COMMANDS.has(command)) return false;

  if (command === 'modorpg') {
    await handleModeToggle(ctx);
    return true;
  }
  if (['rpg', 'menurpg'].includes(command)) {
    await sendMenu(ctx);
    return true;
  }
  if (command === 'avatar') {
    await handleAvatar(ctx);
    return true;
  }

  const players = economySync.syncLegacyRead(getPlayers());
  let player = getPlayer(players, ctx.sender);
  const requirePlayer = async () => {
    if (player) return true;
    await ctx.reply(`❌ Você não está registrado no RPG!\nUse: *${ctx.prefix}registrorpg nome*`);
    return false;
  };

  if (command === 'ajudarpg') {
    await ctx.reply(commandHelp('rpg', ctx.prefix));
    return true;
  }

  if (command === 'registrorpg') {
    if (!ctx.isGroup) {
      await ctx.reply('Esse comando só pode ser usado em grupos.');
      return true;
    }
    const name = extractRawArgument(ctx);
    if (!name) {
      await ctx.reply(`Formato inválido.\nUse assim: *${ctx.prefix}registrorpg Nome*`);
      return true;
    }
    if (player) {
      await ctx.reply('❌ Você já está registrado no RPG!');
      return true;
    }
    const age = Math.floor(Math.random() * 43) + 17;
    player = { id: ctx.sender, nome: name, idade: age, dinheiro: 100, xp: 0, nivel: 1, pix: createPix() };
    players.push(player);
    savePlayers(players);
    await ctx.reply(`✅ Registro feito com sucesso no RPG!\n\n👤 Nome: ${name}\n🎂 Idade: ${age}\n💰 Dinheiro inicial: 100 moedas\n🔐 Chave PIX: ${player.pix}`);
    return true;
  }

  if (command === 'comprarescova') {
    if (!await requirePlayer()) return true;
    if (number(player.dinheiro) < 50) return ctx.reply('Você não tem dinheiro suficiente para comprar uma escova (custa 50 moedas).');
    if (player.escova) return ctx.reply('Você já comprou uma escova!');
    const cash = profileService.adjustCash(ctx.sender, -50, 'Compra de escova', { pushName: player.nome });
    player.dinheiro = cash.after;
    player.escova = true;
    savePlayers(players);
    await ctx.reply('✅ Você comprou uma escova de dentes! Agora pode escovar todos os dias.');
    return true;
  }

  if (command === 'escovar') {
    if (!await requirePlayer()) return true;
    if (!player.escova) return ctx.reply(`Você não tem uma escova! Compre uma usando:\n*${ctx.prefix}comprarescova*`);
    await ctx.reply('✨ Você escovou os dentes com sucesso! Que sorriso brilhante 😁');
    return true;
  }

  if (command === 'meupix') {
    if (!await requirePlayer()) return true;
    if (!player.pix) return ctx.reply('🚫 Você ainda não tem uma chave PIX registrada.');
    await ctx.sock.sendMessage(ctx.from, {
      text: `🔐 Sua chave PIX:\n\n💳 *${player.pix}*\n\nUse essa chave para receber transferências!`,
      interactiveButtons: [{
        name: 'cta_copy',
        buttonParamsJson: JSON.stringify({ display_text: 'Copiar Chave PIX', id: 'pix_copia_e_cola', copy_code: player.pix })
      }]
    }, { quoted: ctx.info });
    return true;
  }

  if (command === 'fazerpix') {
    if (!await requirePlayer()) return true;
    if (ctx.args[0]?.toLowerCase() === 'help' || ctx.args[0]?.toLowerCase() === 'ajuda') return ctx.reply(commandHelp('fazerpix', ctx.prefix));
    const [pix, valueText] = (ctx.args[0] || '').split('/');
    const value = parseMoney(valueText);
    if (!pix || !Number.isFinite(value) || value <= 0) return ctx.reply(`❌ Formato inválido. Use: chavePIX/valor. Exemplo: *${ctx.prefix}fazerpix 06179180069@pix/500*`);
    if (!pix.endsWith('@pix')) return ctx.reply("❌ Chave PIX inválida. Deve terminar com '@pix'.");
    const target = players.find((candidate) => candidate.pix === pix);
    if (!target) return ctx.reply('❌ Nenhum jogador encontrado com essa chave PIX.');
    if (target.id === ctx.sender) return ctx.reply('🤨 Você não pode transferir para si mesmo.');
    try {
      const result = profileService.transferCash(ctx.sender, target.id, value, { operationId: `pix-legacy:${ctx.info?.key?.id || `${ctx.sender}:${target.id}:${value}`}`, pushName: player.nome, description: 'PIX legado', source: 'pix' });
      player.dinheiro = result.sender;
      target.dinheiro = result.recipient;
      savePlayers(players);
    } catch (error) {
      return ctx.reply(`❌ ${error.message}\n\nComo corrigir: consulte *${ctx.prefix}saldorpg* e tente novamente com um valor menor.`);
    }
    await ctx.reply(`✅ Transferência feita com sucesso!\n\n💸 Valor: *${value} moedas*\n📤 Para: *${target.nome}*\n🔐 Via chave PIX: *${pix}*`);
    return true;
  }

  if (command === 'trabalhar') {
    if (!await requirePlayer()) return true;
    const requestedJob = ctx.args[0]?.toLowerCase();
    if (requestedJob === 'help' || requestedJob === 'ajuda') {
      await ctx.reply(commandHelp('trabalhar', ctx.prefix));
      return true;
    }
    if (requestedJob) {
      const job = profileService.getJob(requestedJob);
      if (!job) {
        await ctx.reply(`❌ Profissão não encontrada.\nComo corrigir: use *${ctx.prefix}empregos* para ver os códigos disponíveis.`);
        return true;
      }
      const profile = profileService.getProfile(ctx.sender, { pushName: player.nome });
      const missingLevel = Math.max(0, job.minLevel - profile.level);
      const missingXp = Math.max(0, job.minXp - profile.xp);
      if (missingLevel > 0 || missingXp > 0) {
        await ctx.reply(`💼 *TRABALHO: ${job.nome.toUpperCase()}*\n\n⭐ Level atual: *${profile.level}*\n⭐ Level mínimo: *${job.minLevel}*\n✨ XP global atual: *${profile.xp}*\n✨ XP mínimo: *${job.minXp}*\n\n❌ Você ainda não possui os requisitos.\nFalta: *${missingLevel} level* e *${missingXp} XP*.\n\nComo corrigir: realize atividades disponíveis no RPG e tente novamente.`);
        return true;
      }
      profileService.setJob(ctx.sender, job, { pushName: player.nome });
      player.profissao = job.nome;
    }
    await handleWork(ctx, player);
    return true;
  }

  if (command === 'abrirbanco') {
    if (!await requirePlayer()) return true;
    if (number(player.carteiraBanco) > 0) return ctx.reply('🏦 Você já tem uma conta bancária ativa.');
    const bank = profileService.adjustBankBalance(ctx.sender, 100, 'Bônus de abertura de conta', { pushName: player.nome });
    player.carteiraBanco = bank.after;
    player.areaInvestimento = 1;
    savePlayers(players);
    await ctx.reply('✅ Conta bancária criada com sucesso!\n💰 Você recebeu 100 moedas ');
    return true;
  }

  if (command === 'minhaconta') {
    if (!player || player.carteiraBanco === undefined) return ctx.reply(`Você ainda não criou uma conta.\nUse: *${ctx.prefix}abrirbanco*`);
    await ctx.reply(`🏦 *Sua Conta Bancária RPG* 🏦\n\n💰 Saldo: ${player.carteiraBanco} moedas\n🧠 XP: ${player.xp}\n⬆️ Nível: ${player.nivel}`);
    return true;
  }

  if (command === 'perfilrpg') {
    if (!await requirePlayer()) return true;
    await ctx.reply(`📜 *Perfil RPG* 📜\n\n👤 Nome: ${player.nome}\n🎂 Idade: ${player.idade}\n🚻 Gênero: ${player.genero}\n💰 Dinheiro: ${player.dinheiro} moedas\n⭐ XP: ${player.xp}\n⬆️ Nível: ${player.nivel}`);
    return true;
  }

  if (command === 'sacarrpg' || command === 'depositarrpg' || command === 'depositar') {
    if (!await requirePlayer()) return true;
    const operation = command === 'sacarrpg' ? 'sacar' : 'depositar';
    if (ctx.args[0]?.toLowerCase() === 'help' || ctx.args[0]?.toLowerCase() === 'ajuda') {
      await ctx.reply(commandHelp(operation, ctx.prefix));
      return true;
    }
    const value = parseMoney(ctx.args[0]);
    if (!ctx.args[0]) return ctx.reply(`🏦 *${operation.toUpperCase()} RPG*\n\n${operation === 'depositar' ? 'Coloca dinheiro em espécie no banco.' : 'Traz dinheiro do banco para a carteira.'}\n\nUse: *${ctx.prefix}${command} <valor>*\nExemplo: *${ctx.prefix}${command} 5000*\n\nConsulte seu saldo com *${ctx.prefix}saldorpg*.`);
    if (!Number.isFinite(value) || value <= 0) return ctx.reply(`❌ Valor inválido.\nComo corrigir: use *${ctx.prefix}${command} <valor>* com um número maior que zero.\nExemplo: *${ctx.prefix}${command} 5000*`);
    if (!Number.isFinite(Number(player.carteiraBanco)) && operation === 'sacar') return ctx.reply(`Você ainda não criou uma conta.\nUse: *${ctx.prefix}abrirbanco*`);
    try {
      const result = profileService.transferCashBank(ctx.sender, operation === 'depositar' ? 'deposit' : 'withdraw', value, { pushName: player.nome, description: operation === 'depositar' ? 'Depósito RPG' : 'Saque RPG' });
      player.dinheiro = result.cash;
      player.carteiraBanco = result.bank;
      savePlayers(players);
      await ctx.reply(`✅ ${operation === 'depositar' ? 'Depósito' : 'Saque'} realizado.\n💰 Dinheiro: R$ ${formatNumber(result.cash)}\n🏦 Banco: R$ ${formatNumber(result.bank)}`);
    } catch (error) {
      await ctx.reply(`❌ ${error.message}\n\nComo corrigir: confira seu saldo com *${ctx.prefix}saldorpg* e tente um valor menor.`);
    }
    return true;
  }

  if (command === 'saldorpg') {
    if (!await requirePlayer()) return true;
    const summary = profileService.getFinancialSummary(ctx.sender, { pushName: player.nome });
    await ctx.reply(`💰 *SALDO RPG*\n\nDinheiro: R$ ${formatNumber(summary.cash)}\nBanco: ${summary.bankName || 'Não disponível'}\nSaldo bancário: R$ ${formatNumber(summary.bank)}\nTotal disponível: R$ ${formatNumber(summary.available)}\nEmpréstimos: ${summary.debt > 0 ? `R$ ${formatNumber(summary.debt)}` : 'Não disponível'}\nTaxas/dívidas: ${summary.feesAndDebts > 0 ? `R$ ${formatNumber(summary.feesAndDebts)}` : 'Não disponível'}\nPatrimônio líquido: R$ ${formatNumber(summary.netWorth)}`);
    return true;
  }

  if (command === 'rendimentorpg') {
    if (!await requirePlayer()) return true;
    if (number(player.carteiraBanco) <= 0) return ctx.reply('🏦 Você não tem saldo no banco para render.');
    const now = Date.now();
    const wait = 15 * 60 * 1000;
    if (player.ultimoRendimento && now - player.ultimoRendimento < wait) {
      const remaining = wait - (now - player.ultimoRendimento);
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      await ctx.reply(`⏳ Ainda não passou o tempo para novo rendimento.\nEspere mais *${minutes}m ${seconds}s*.`);
      return true;
    }
    const balance = profileService.getProfile(ctx.sender, { pushName: player.nome }).bank;
    let rate = 0.02;
    if (balance >= 1000 && balance < 5000) rate = 0.05;
    else if (balance >= 5000 && balance < 10000) rate = 0.08;
    else if (balance >= 10000 && balance < 20000) rate = 0.12;
    else if (balance >= 20000) rate = 0.15;
    const income = Math.floor(balance * rate);
    const bank = profileService.adjustBankBalance(ctx.sender, income, 'Rendimento bancário', { pushName: player.nome });
    player.carteiraBanco = bank.after;
    player.ultimoRendimento = now;
    savePlayers(players);
    await ctx.reply(`📈 *Rendimento Aplicado!*\n🏦 Saldo anterior: ${balance} moedas\n📊 Taxa aplicada: ${(rate * 100).toFixed(0)}%\n➕ Rendimento: ${income} moedas\n💰 Novo saldo no banco: ${player.carteiraBanco} moedas\n\n🕒 Você poderá render novamente em 15 minutos.`);
    return true;
  }

  if (command === 'sairrpg') {
    if (!await requirePlayer()) return true;
    if (!ctx.args[0] || ctx.args[0].toLowerCase() !== 'confirmar') return ctx.reply(`⚠️ Tem certeza que quer sair do RPG?\nSe sim, use:\n*${ctx.prefix}sairrpg confirmar*`);
    const message = randomFrom(getExitMessages(number(player.nivel, 1)));
    const index = players.findIndex((candidate) => candidate.id === ctx.sender);
    players.splice(index, 1);
    savePlayers(players);
    await ctx.reply(`✅ Seus dados foram apagados com sucesso.\n\n${message}`);
    return true;
  }

  if (command === 'historicoxp') {
    if (!await requirePlayer()) return true;
    const rows = profileService.xpHistory(ctx.sender, 15);
    if (!rows.length) {
      await ctx.reply('📜 Ainda não há alterações de XP registradas.');
      return true;
    }
    await ctx.reply(`📜 *HISTÓRICO DE XP*\n\n${rows.map((row) => `${row.xpDelta > 0 ? '+' : ''}${row.xpDelta} XP · ${row.reason}\nOrigem: ${row.source} · XP: ${row.xpBefore} → ${row.xpAfter}\nOperação: ${row.operationId}\nData: ${row.at}`).join('\n\n')}`);
    return true;
  }

  if (command === 'status' || command === 'statusrpg') {
    if (!await requirePlayer()) return true;
    await handleStatus(ctx, player);
    return true;
  }

  if (command === 'lojadeluxorpg') {
    let message = '💎 *LOJA DE CARROS DE LUXO* 💎\n\nSomente para os mais ricos...\n\n';
    LUXURY_CARS.forEach((car, index) => { message += `*${index + 1}.* ${car.nome} - R$${formatNumber(car.preco)}\n`; });
    await ctx.reply(`${message}\nPara comprar: *${ctx.prefix}comprarrpgdeluxo número*\nEx: *${ctx.prefix}comprarrpgdeluxo 3*`);
    return true;
  }

  if (command === 'lojacasasrpg') {
    let message = '🏡 *LOJA DE CASAS DE LUXO* 🏡\n\nMorar bem tem seu preço...\n\n';
    HOUSES.forEach((house, index) => { message += `*${index + 1}.* ${house.nome} - R$${formatNumber(house.preco)}\n`; });
    await ctx.reply(`${message}\nPara comprar: *${ctx.prefix}comprarrpgcasa número*\nEx: *${ctx.prefix}comprarrpgcasa 5*`);
    return true;
  }

  if (command === 'minhascasasrpg') {
    if (!await requirePlayer()) return true;
    if (!player.casas?.length) return ctx.reply('🏠 Você ainda não possui nenhuma casa.');
    let message = `🏡 *SUAS CASAS DE LUXO* 🏡\n\nVocê tem ${player.casas.length} casa(s):\n\n`;
    player.casas.forEach((house, index) => { message += `*${index + 1}.* ${house}\n`; });
    await ctx.reply(message);
    return true;
  }

  if (command === 'comprarrpgcasa' || command === 'comprarrpgdeluxo') {
    if (!await requirePlayer()) return true;
    if (!ctx.args[0]) return ctx.reply(`Use: *${ctx.prefix}${command} número*\nEx: *${ctx.prefix}${command} ${command === 'comprarrpgcasa' ? 5 : 3}*`);
    const catalog = command === 'comprarrpgcasa' ? HOUSES : LUXURY_CARS;
    const index = parseInteger(ctx.args[0]) - 1;
    if (!Number.isFinite(index) || index < 0 || index >= catalog.length) return ctx.reply('❌ Número inválido. Escolha entre 1 e 15.');
    const item = catalog[index];
    if (number(player.dinheiro) < item.preco) return ctx.reply('💸 Você não tem dinheiro suficiente.');
    player.dinheiro = profileService.adjustCash(ctx.sender, -item.preco, `Compra de ${item.nome}`, { pushName: player.nome }).after;
    const property = command === 'comprarrpgcasa' ? 'casas' : 'carros';
    player[property] = Array.isArray(player[property]) ? player[property] : [];
    player[property].push(item.nome);
    savePlayers(players);
    const icon = command === 'comprarrpgcasa' ? '🏠' : '🚘';
    const noun = command === 'comprarrpgcasa' ? 'casa' : 'carro de luxo';
    await ctx.sock.sendMessage(ctx.from, {
      image: { url: item.imagem },
      caption: `${icon} Você comprou ${command === 'comprarrpgcasa' ? 'a' : 'o'} ${noun} *${item.nome}*!\n💰 Valor pago: R$${formatNumber(item.preco)}\n📄 ${item.descricao}`
    }, { quoted: ctx.info });
    return true;
  }

  if (command === 'garagemrpg' || command === 'meuscarros') {
    if (!await requirePlayer()) return true;
    if (!player.carros?.length) return ctx.reply(command === 'garagemrpg' ? '🚗 Você ainda não tem nenhum carro na garagem.' : '🚗 Você não tem carros ainda.');
    if (command === 'meuscarros') {
      await ctx.reply(`🚘 *Seus carros:*\n${player.carros.map((car) => `• ${car}`).join('\n')}`);
    } else {
      let message = '🚘 *Sua Garagem de Luxo* 🚘\n\n';
      player.carros.forEach((car, index) => { message += `*${index + 1}.* ${car}\n`; });
      await ctx.reply(message);
    }
    return true;
  }

  if (command === 'escolhervida') {
    if (!await requirePlayer()) return true;
    const choice = ctx.args[0]?.toLowerCase();
    if (!choice) return ctx.reply(`🌱 Modo de vida atual: *${player.modoVida || 'Nenhum'}*\n\nUse: *${ctx.prefix}escolhervida trabalhador/investidor/aventureiro/econômico/luxuoso*`);
    if (!LIFE_MODES.includes(choice)) return ctx.reply(`❌ Modo inválido!\nUse: *${ctx.prefix}escolhervida trabalhador/investidor/aventureiro/econômico/luxuoso*`);
    const now = Date.now();
    const limit = 24 * 60 * 60 * 1000;
    if (player.ultimoModoVida && now - player.ultimoModoVida < limit) {
      const remaining = ((limit - (now - player.ultimoModoVida)) / 3600000).toFixed(1);
      return ctx.reply(`⏳ Você só pode trocar de modo a cada 24h.\nFaltam *${remaining}h* para trocar novamente.`);
    }
    player.modoVida = choice;
    player.ultimoModoVida = now;
    savePlayers(players);
    await ctx.reply(`✅ *${player.nome}*, seu novo modo de vida é: *${choice}* 🌍\nTudo pronto para uma nova jornada!`);
    return true;
  }

  if (command === 'modosvida') {
    await ctx.reply(`📚 *Modos de Vida Disponíveis*:\n\n1. *Trabalhador* - +20% ao trabalhar\n2. *Investidor* - +10% no rendimento bancário\n3. *Aventureiro* - +XP em tudo\n4. *Econômico* - -10% em taxas\n5. *Luxuoso* - Acesso a itens e carros de luxo\n\nUse: *${ctx.prefix}escolhervida nome*`);
    return true;
  }

  if (command === 'pagarfianca') {
    if (!await requirePlayer()) return true;
    if (!player.preso) return ctx.reply('✅ Você não está preso.');
    const bail = 5000;
    if (number(player.dinheiro) < bail) return ctx.reply(`💸 Você não tem dinheiro suficiente para pagar a fiança.\n💵 Fiança: *${bail} moedas*`);
    player.dinheiro = profileService.adjustCash(ctx.sender, -bail, 'Pagamento de fiança', { pushName: player.nome }).after;
    player.preso = false;
    delete player.tempoPrisao;
    savePlayers(players);
    await ctx.reply(`🔓 Você pagou *${bail} moedas* e foi libertado da prisão!\nNão cometa mais crimes, hein... 👮`);
    return true;
  }

  if (command === 'assaltarrpg') {
    const targetJid = getMentionedJid(ctx.info);
    if (!targetJid) return ctx.reply('⚠️ Marque a pessoa que você quer assaltar.');
    if (!await requirePlayer()) return true;
    const victim = getPlayer(players, targetJid);
    if (!victim) return ctx.reply('❌ Essa pessoa não está registrada no RPG.');
    if (targetJid === ctx.sender) return ctx.reply('❌ Você não pode se assaltar, gênio.');
    const police = Math.random() < 0.3;
    const stolen = Math.floor(Math.random() * (number(victim.dinheiro) * 0.3)) + 50;
    if (police) {
      const prisonTime = Math.floor(Math.random() * 5) + 1;
      player.preso = true;
      player.tempoPrisao = prisonTime;
      savePlayers(players);
      await ctx.reply(`🚨 *${player.nome} tentou assaltar ${victim.nome}, mas foi preso!*\n⛓️ Tempo de prisão: *${prisonTime} turnos*.`);
      return true;
    }
    if (number(victim.dinheiro) < stolen) return ctx.reply('❌ Essa pessoa está lisa, não tem dinheiro pra ser assaltada.');
    victim.dinheiro = number(victim.dinheiro) - stolen;
    player.dinheiro = number(player.dinheiro) + stolen;
    savePlayers(players);
    await ctx.reply(`💰 *Assalto realizado com sucesso!*\n\n👤 Assaltante: ${player.nome}\n🎯 Vítima: ${victim.nome}\n🪙 Valor roubado: *${stolen} moedas*`);
    return true;
  }

  if (command === 'apostarrpg') {
    if (!await requirePlayer()) return true;
    const value = parseInteger(ctx.args[0]);
    if (!ctx.args[0]) return ctx.reply(`🎰 Use: *${ctx.prefix}apostarrpg valor*\nEx: *${ctx.prefix}apostarrpg 500*`);
    if (!Number.isFinite(value) || value < 500) return ctx.reply('❌ Valor inválido. A aposta mínima é 500 moedas.');
    if (number(player.dinheiro) < value) return ctx.reply('💸 Você não tem dinheiro suficiente para apostar esse valor.');
    const bettingHouse = readJson(FILES.bets, { total: 0, nivel: 1 });
    bettingHouse.total = number(bettingHouse.total, 0);
    bettingHouse.nivel = number(bettingHouse.nivel, 1) || 1;
    if (value >= 50000) await ctx.reply(randomFrom(BET_WARNINGS));
    const won = Math.random() < 0.40;
    const houseIncome = Math.floor(value * 0.15);
    player.dinheiro = number(player.dinheiro) - value;
    bettingHouse.total += houseIncome;
    if (won) {
      const prize = bettingHouse.total + value;
      player.dinheiro += prize;
      await ctx.reply(`🎉 *Parabéns, ${player.nome}!* Você venceu na Casa de Apostas!\n\n🪙 Valor apostado: *${value} moedas*\n🏆 Valor ganho: *${prize} moedas*\n📊 Nível da Casa: *${bettingHouse.nivel}*\n🏠 A Casa foi zerada!`);
      bettingHouse.total = 0;
      bettingHouse.nivel = 1;
    } else {
      bettingHouse.total += value;
      bettingHouse.nivel += 1;
      await ctx.reply(`😢 Você perdeu, ${player.nome}...\n\n🪙 Valor apostado: *${value} moedas*\n📉 Chance de vitória: *40%*\n📊 Nível da Casa: *${bettingHouse.nivel}*\n💰 Total acumulado: *${bettingHouse.total} moedas*\n🏠 A casa está cada vez mais confiável!`);
    }
    savePlayers(players);
    writeJson(FILES.bets, bettingHouse);
    return true;
  }

  if (command === 'pagarpva') {
    if (!await requirePlayer()) return true;
    if (!player.carros?.length) return ctx.reply('🚗 Você não tem carros para pagar IPVA.');
    const totalValue = player.carros.reduce((sum, car) => sum + number(CAR_VALUES[car], 0), 0);
    const tax = Math.floor(totalValue * 0.05);
    if (number(player.dinheiro) < tax) return ctx.reply(`💸 Seu IPVA custa R$${formatNumber(tax)}, e você não tem saldo suficiente.`);
    player.dinheiro = profileService.adjustCash(ctx.sender, -tax, 'Pagamento de IPVA', { pushName: player.nome }).after;
    savePlayers(players);
    await ctx.reply(`✅ Você pagou R$${formatNumber(tax)} de IPVA.\nSeus veículos estão regularizados.`);
    return true;
  }

  if (command === 'transferirrpg') {
    const [targetName, valueText] = (ctx.args[0] || '').split('/');
    const value = parseInteger(valueText);
    if (!ctx.args[0]) return ctx.reply(`❌ Use: *${ctx.prefix}transferirrpg nomeDoUsuário/valor*\nExemplo: *${ctx.prefix}transferirrpg tedzinho/500*`);
    if (!targetName || !Number.isFinite(value) || value <= 0) return ctx.reply('❌ Formato inválido. Use assim: *nomeDoUsuário/valor* (Ex: *tedzinho/500*)');
    if (!await requirePlayer()) return true;
    const target = players.find((candidate) => candidate.nome?.toLowerCase().trim() === targetName.toLowerCase().trim());
    if (!target) return ctx.reply('❌ Remetente ou destinatário não encontrado ou não registrado.');
    if (!player.banco || !target.banco) return ctx.reply('🏦 Ambos os jogadores precisam ter um banco registrado. Use: *bancorpg*');
    const fee = player.banco !== target.banco ? Math.floor(value * 0.05) : 0;
    const finalValue = value - fee;
    try {
      const result = profileService.transferCash(ctx.sender, target.id, value, { recipientValue: finalValue, operationId: `transfer-rpg:${ctx.info?.key?.id || `${ctx.sender}:${target.id}:${value}`}`, pushName: player.nome, description: 'Transferência RPG', source: 'transferirrpg' });
      player.dinheiro = result.sender;
      target.dinheiro = result.recipient;
      savePlayers(players);
    } catch (error) {
      return ctx.reply(`❌ ${error.message}\n\nComo corrigir: utilize um valor menor ou consulte *${ctx.prefix}saldorpg*.`);
    }
    await ctx.reply(`💸 *Transferência Realizada!*\n👤 De: *${player.nome}*\n👤 Para: *${target.nome}*\n🏦 Bancos: ${player.banco.toUpperCase()} → ${target.banco.toUpperCase()}\n💰 Valor enviado: ${value} moedas\n🧾 ${fee > 0 ? `Taxa: ${fee} moedas (5%)` : 'Sem taxa — bancos iguais!'}\n📥 ${finalValue} moedas recebidas com sucesso!`);
    return true;
  }

  if (command === 'bancorpg') {
    if (!await requirePlayer()) return true;
    const bankName = extractRawArgument(ctx);
    if (!bankName) return ctx.reply(`❌ Use: *${ctx.prefix}bancorpg nomeDoBanco*\nExemplo: *${ctx.prefix}bancorpg Nubank*`);
    player.banco = bankName;
    savePlayers(players);
    await ctx.reply(`✅ Banco registrado com sucesso!\n👤 Jogador: *${player.nome}*\n🏦 Banco: *${bankName}*\n\nAgora você pode fazer transferências usando esse banco.`);
    return true;
  }

  if (command === 'rankbancos') {
    const ratings = readJson(FILES.bankRatings, {});
    const ranking = BANKS.map((bank) => {
      const clients = players.filter((candidate) => candidate.banco === bank.id).length;
      const scores = Array.isArray(ratings[bank.id]) ? ratings[bank.id] : [];
      const average = scores.length ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1) : bank.estrelas;
      return { ...bank, clients, average };
    }).sort((first, second) => second.clients - first.clients);
    let message = '🏦 *Ranking dos Bancos RPG*\n\n';
    ranking.forEach((bank, index) => {
      message += `*${index + 1}º lugar: ${bank.nome}*\n👥 Clientes: ${bank.clients}\n⭐ Avaliação: ${bank.average} estrelas\n\n`;
    });
    await ctx.reply(message.trim());
    return true;
  }

  return false;
}

function isRpgCommand(command) {
  return RPG_COMMANDS.has(String(command || '').toLowerCase());
}

module.exports = { isRpgCommand, handleCommand, FILES, RPG_COMMANDS };
