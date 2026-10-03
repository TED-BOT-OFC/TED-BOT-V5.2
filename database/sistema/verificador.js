// ADICIONE ESTA LINHA NO TOPO do verificador.js
const { numerodono, NickDono } = require("../../settings/config.json");

async function verificarUsuario(sock, from, msg, prefix, BOT_PHONE) {
  const metadata = await sock.groupMetadata(from);
  const participants = metadata.participants;

  // ====== PEGA O NÚMERO REAL DO BOT ======
  const botNumero = BOT_PHONE.replace(/[^0-9]/g, ""); // ex: "557398558638"

  // ====== IDENTIFICA O DONO DO BOT ======
  const donoBotNumero = numerodono.replace(/[^0-9]/g, ""); // "557399791564"
  const nickDono = NickDono || "Dono do Bot";

  // ====== ACHA O PARTICIPANTE DO BOT NO GRUPO PELO NÚMERO ======
  const botParticipant = participants.find(p => {
    if (p.phoneNumber) return p.phoneNumber.includes(botNumero);
    if (p.jid) return p.jid.includes(botNumero);
    return false;
  });

  // Se achou, pega o LID real do bot
  const botId = botParticipant ? botParticipant.id : sock.user?.id;

  // Verifica se é admin
  const isBotAdmin = botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin');

  // ====== EXTRAI O CÓDIGO DIGITADO ======
  let codigoBusca = '';
  if (msg.message?.conversation) {
    const partes = msg.message.conversation.split(' ');
    if (partes.length > 1) codigoBusca = partes.slice(1).join(' ').trim();
  } else if (msg.message?.extendedTextMessage?.text) {
    const partes = msg.message.extendedTextMessage.text.split(' ');
    if (partes.length > 1) codigoBusca = partes.slice(1).join(' ').trim();
  }

  if (!codigoBusca) {
    return sock.sendMessage(from, { 
      text: `🔍 *VERIFICAÇÃO DE USUÁRIO*\n\n` +
            `❤️ *Uso correto:* ${prefix}verificar [LID/@mencao]\n\n` +
            `• ${prefix}verificar 26341621690562@lid\n` +
            `• ${prefix}verificar @usuario`
    }, { quoted: msg });
  }

  // ====== PROCURA O ALVO (igual antes) ======
  let alvoEncontrado = null;
  let metodoBusca = '';

  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  if (mentioned.length > 0) {
    alvoEncontrado = participants.find(p => p.id === mentioned[0]);
    metodoBusca = 'menção';
  }

  if (!alvoEncontrado) {
    let lidFormatado = codigoBusca.endsWith('@lid') ? codigoBusca : codigoBusca + '@lid';
    alvoEncontrado = participants.find(p => p.id === lidFormatado);
    if (alvoEncontrado) metodoBusca = 'LID completo';
  }

  if (!alvoEncontrado) {
    const lidParcial = codigoBusca.replace('@lid', '');
    alvoEncontrado = participants.find(p => p.id.replace('@lid', '') === lidParcial || p.id.includes(lidParcial));
    if (alvoEncontrado) metodoBusca = 'LID parcial';
  }

  if (!alvoEncontrado) {
    const numeroBusca = codigoBusca.replace(/[^0-9]/g, "");
    if (numeroBusca.length >= 8) {
      alvoEncontrado = participants.find(p =>
        (p.jid && p.jid.includes(numeroBusca)) ||
        (p.phoneNumber && p.phoneNumber.includes(numeroBusca)) ||
        (p.id && p.id.includes(numeroBusca))
      );
      if (alvoEncontrado) metodoBusca = 'número';
    }
  }

  // ====== MONTA A RESPOSTA ======
  if (alvoEncontrado) {
    let numeroReal = alvoEncontrado.phoneNumber || alvoEncontrado.jid?.split('@')[0] || alvoEncontrado.id.split('@')[0];
    const isAdmin = alvoEncontrado.admin === 'admin' || alvoEncontrado.admin === 'superadmin';
    const isSuperAdmin = alvoEncontrado.admin === 'superadmin';
    
    // ====== VERIFICA SE É O DONO DO BOT (MESMA LÓGICA DO ADM) ======
    const numeroAlvoLimpo = numeroReal.replace(/[^0-9]/g, "");
    const isDonoBot = numeroAlvoLimpo === donoBotNumero;

    let mensagem = `🔍 *VERIFICAÇÃO DE USUÁRIO* 🔍\n\n`;
    mensagem += `✅ *Usuário encontrado!*\n\n`;
    mensagem += `📱 *Número:* ${numeroReal}\n`;
    mensagem += `🆔 *LID no grupo:* ${alvoEncontrado.id}\n`;
    
    // STATUS DO USUÁRIO NO GRUPO
    mensagem += `👤 *Status no Grupo:* ${isSuperAdmin ? 'Dono do Grupo 👑' : isAdmin ? 'Administrador ♥️' : 'Membro 👨'}\n`;
    
    // STATUS COMO DONO DO BOT (IGUAL AO ADM)
    mensagem += `🤖 *Dono do Bot?:* ${isDonoBot ? "✅ Sim 👑" : "❌ Não"}\n`;
    
    mensagem += `🔎 *Método de busca:* ${metodoBusca}\n\n`;

    // ====== INFO DO BOT ======
    mensagem += `🤖 *Bot Número:* ${botNumero}\n`;
    mensagem += `🆔 *Bot LID:* ${botId}\n`;
    mensagem += `♥️ *Bot é admin?* ${isBotAdmin ? "✅ Sim" : "❤️ Não"}\n`;

    mensagem += `\n👥 *Total no grupo:* ${participants.length} membros\n`;
    mensagem += `_Verificação feita em ${new Date().toLocaleString('pt-BR')}_`;

    await sock.sendMessage(from, { text: mensagem }, { quoted: msg });
  } else {
    let mensagem = `❤️ Usuário não encontrado!\n\n`;
    mensagem += `🔎 *Termo buscado:* ${codigoBusca}\n`;
    mensagem += `👥 *Membros no grupo:* ${participants.length}\n\n`;
    mensagem += `🤖 *Bot Número:* ${botNumero}\n`;
    mensagem += `🆔 *Bot LID:* ${botId}\n`;
    mensagem += `♥️ *Bot é admin?* ${isBotAdmin ? "✅ Sim" : "❤️ Não"}\n`;

    await sock.sendMessage(from, { text: mensagem }, { quoted: msg });
  }
}

async function getVerificacao(sock, from, msg, prefixOrConfig, BOT_PHONE) {
    let participants = [];
    try {
        const metadata = await sock.groupMetadata(from);
        participants = metadata.participants || [];
    } catch (e) {
        console.error("Erro ao obter metadados do grupo no verificador:", e.message);
    }

    // Extrair numerodono e NickDono de forma segura
    let realNumeroDono = numerodono;
    let realNickDono = NickDono;

    if (prefixOrConfig && typeof prefixOrConfig === 'object') {
        if (prefixOrConfig.numerodono) realNumeroDono = prefixOrConfig.numerodono;
        if (prefixOrConfig.NickDono) realNickDono = prefixOrConfig.NickDono;
    }

    // PEGA O NÚMERO REAL DO BOT 
    const botNumero = BOT_PHONE ? BOT_PHONE.replace(/[^0-9]/g, "") : "";

    // ====== IDENTIFICA O DONO DO BOT ======
    const donoBotNumero = realNumeroDono ? realNumeroDono.replace(/[^0-9]/g, "") : "";
    const nickDono = realNickDono || "Dono do Bot";

    // ACHA O PARTICIPANTE DO BOT NO GRUPO 
    const botParticipant = participants.find(p => {
        if (p.phoneNumber) return p.phoneNumber.includes(botNumero);
        if (p.jid) return p.jid.includes(botNumero);
        return false;
    });

    const botId = botParticipant ? botParticipant.id : sock.user?.id;
    const isBotAdmin = botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin');

    // ====== IDENTIFICA O REMETENTE ======
    const sender = msg.key?.participant || msg.key?.remoteJid || msg.participant || msg.jid || (typeof msg === 'string' ? msg : "");
    const senderParticipant = participants.find(p => p.id === sender);

    // Verifica se o remetente é admin/dono (MESMA LÓGICA)
    const isSenderAdmin = senderParticipant && (senderParticipant.admin === 'admin' || senderParticipant.admin === 'superadmin');
    const isSenderOwner = senderParticipant && senderParticipant.admin === 'superadmin';
    
    // ====== VERIFICA SE O REMETENTE É O DONO DO BOT (MESMA LÓGICA) ======
    const senderId = senderParticipant?.id || (typeof msg === 'string' ? msg : msg.key?.participant || msg.key?.remoteJid || "");
    
    // Tenta pegar o número de várias formas para garantir
    let senderNumero = "";
    if (senderParticipant && senderParticipant.phoneNumber) senderNumero = senderParticipant.phoneNumber;
    else if (senderId.includes('@s.whatsapp.net')) senderNumero = senderId.split('@')[0];
    
    const senderNumeroLimpo = senderNumero ? senderNumero.replace(/[^0-9]/g, "") : "";
    
    // Verificação por LID (Novo padrão do WhatsApp)
    // Se o sender for um LID, verificamos se ele corresponde ao participante que tem o número do dono
    let isLidDono = false;
    if (senderId.endsWith('@lid') && participants.length > 0) {
        const donoNoGrupo = participants.find(p => {
            const pNum = (p.phoneNumber || p.id?.split('@')[0] || "").replace(/[^0-9]/g, "");
            return pNum === donoBotNumero || (pNum.length >= 8 && donoBotNumero.endsWith(pNum));
        });
        if (donoNoGrupo && donoNoGrupo.id === senderId) isLidDono = true;
    }

    // Compara o final dos números (últimos 8 dígitos) para evitar problemas com 9 extra ou DDI
    const isSenderDonoBot = isLidDono || 
                            (senderNumeroLimpo !== "" && (
                                (senderNumeroLimpo === donoBotNumero) || 
                                (senderNumeroLimpo.length >= 8 && donoBotNumero.endsWith(senderNumeroLimpo)) ||
                                (donoBotNumero.length >= 8 && senderNumeroLimpo.endsWith(donoBotNumero))
                            ));

    return {
        participants,
        isSenderAdmin: isSenderAdmin,
        isSenderOwner: isSenderOwner,
        isSenderDonoBot: isSenderDonoBot,
        botId: botId,
        isBotAdmin: isBotAdmin,
        donoBotNumero: donoBotNumero,
        nickDono: nickDono
    };
}

// 📝 EXPORTA AS DUAS FUNÇÕES
module.exports = { 
  verificarUsuario,
  getVerificacao
};