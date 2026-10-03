const config = require("../config.json");

function getCurrentDateTime() {
    const now = new Date();
    const date = now.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const time = now.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" });
    return { date, time };
}

function generateMenuAdm() {
    const { date, time } = getCurrentDateTime();

    return `┏╾═╼❋╾═╼⟡╾═╼❋╾═╼┓
┣┄┄┅┄┅┄┅┄┅┄┅┄┄┫
┃ ⟡ 𝐌𝐄𝐍𝐔 𝐀𝐃𝐌𝐈𝐍 ⟡ 
┃ 𖦹 ${date} 
┃ 𖦹 ${time} 
┃ 𖦹 Dono: ${config.NickDono} 
┣┄┄┅┄┅┄┅┄┅┄┅┄┄┫
┃ ❖ 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀ÇÕ𝐄𝐒 𝐆𝐄𝐑𝐀𝐈𝐒 ❖ 
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ⌁ ${config.prefix}views 1/0
┃   ↳ Ativar/Desativar visualizações
┃
┃ ⌁ ${config.prefix}backup
┃   ↳ Backup completo do sistema
┃
┃ ⌁ ${config.prefix}restart
┃   ↳ Reinicialização do bot
┃
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ❖ 𝐏𝐑𝐎𝐓𝐄ÇÃ𝐎 𝐄 𝐒𝐄𝐆𝐔𝐑𝐀𝐍ÇA ❖ 
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ⌁ ${config.prefix}antilinkhard
┃   ↳ Anti-link global (Todos os grupos)
┃
┃ ⌁ ${config.prefix}antilinkhard2
┃   ↳ Anti-link on/off
┃
┃ ⌁ ${config.prefix}antilinkgrupo
┃   ↳ Anti-link apenas neste grupo
┃
┃ ⌁ ${config.prefix}totag
┃   ↳ Mencionar todos os membros
┃
┃ ⌁ ${config.prefix}grupo f/a
┃   ↳ Fechar/Abrir grupo
┃
┃ ⌁ ${config.prefix}tempo-pg HH:MM
┃   ↳ Programar Fechar/Abrir
┃
┃ ⌁ ${config.prefix}d
┃   ↳ Configurações de detecção
┃
┃ ⌁ ${config.prefix}welcome
┃   ↳ Boas-vindas & Legendas
┃
┃ ⌁ ${config.prefix}cooldown
┃   ↳ Definir intervalo entre comandos
┃
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ❖ 𝐆𝐄𝐑𝐄𝐍𝐂𝐈𝐀𝐌𝐄𝐍𝐓𝐎 ❖ 
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ⌁ ${config.prefix}ban @user
┃   ↳ Banir membro do grupo
┃
┃ ⌁ ${config.prefix}blacklist @user
┃   ↳ Adicionar membro à blacklist
┃
┃ ⌁ ${config.prefix}marcar
┃   ↳ Marcar membro específico
┃
┃ ⌁ ${config.prefix}adverter
┃   ↳ Advertir o usuário
┃
┃ ⌁ ${config.prefix}xingamentos
┃   ↳ Moderação de palavrões
┃
┃ ⌁ ${config.prefix}autofigu
┃   ↳ Autofigu ao sticker
┃
┃ ⌁ ${config.prefix}promover
┃   ↳ Conceder administração
┃
┃ ⌁ ${config.prefix}rebaixar
┃   ↳ Remover administração
┃
┃ ⌁ ${config.prefix}mute
┃   ↳ Silenciar membro
┃
┃ ⌁ ${config.prefix}unmute
┃   ↳ Remover silenciamento
┃
┃ ⌁ ${config.prefix}fixar
┃   ↳ Fixar mensagem no grupo
┃
┃ ⌁ ${config.prefix}desfixar
┃   ↳ Remover mensagem fixada
┃
┃ ⌁ ${config.prefix}linkgp
┃   ↳ Gerar link do grupo
┃
┃ ⌁ ${config.prefix}inativos 5
┃   ↳ Listar quem tem menos de 5 atividades
┃
┃ ⌁ ${config.prefix}inativos
┃   ↳ Listar quem nunca teve atividade
┃
┃ ⌁ ${config.prefix}regras
┃   ↳ Exibir regras do grupo
┃
┃ ⌁ ${config.prefix}addsticker
┃   ↳ Salvar figurinha enviada
┃
┃ ⌁ ${config.prefix}audio
┃   ↳ ativa/desativa áudio aleatório
┃
┃ ⌁ ${config.prefix}brincadeiras
┃   ↳ Ativar modo brincadeiras
┃
┃ ⌁ ${config.prefix}modorpg 1/0
┃   ↳ Ativar/desativar o Mundo RPG neste grupo
┃
┣┄┅┄┅┄┅┄┅┄┅┄┄┫
┗╾═╼❋╾═╼⟡╾═╼❋╾═╼┛`;
}

module.exports = generateMenuAdm;
