const config = require("../config.json");

// Função para gerar data/hora formatada
function getCurrentDateTime() {
    const now = new Date();
    const date = now.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const time = now.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" });
    return { date, time };
}

function generatmdono() {
    const { date, time } = getCurrentDateTime();

    return `┏╾═╼❋╾═╼⟡╾═╼❋╾═╼┓
┣┄┄┅┄┅┄┅┄┅┄┅┄┄┫
┃ ⟡ 𝐌𝐄𝐍𝐔 𝐃𝐎𝐍𝐎 ⟡ 
┃ 𖦹 ${date} 
┃ 𖦹 ${time} 
┃ 𖦹 Dono: ${config.NickDono} 
┣┄┄┅┄┅┄┅┄┅┄┅┄┄┫
┃ ❖ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 ❖ 
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ⌁ ${config.prefix}fotomenu
┃   ↳ Menu de fotos
┃
┃ ⌁ ${config.prefix}verificado-global
┃   ↳ Verificação global
┃
┃ ⌁ ${config.prefix}antipv (on/off)
┃   ↳ Ativar/Desativar anti privado
┃
┃ ⌁ ${config.prefix}visualizarmsg
┃   ↳ Visualizar mensagens
┃
┃ ⌁ ${config.prefix}bangp
┃   ↳ Banir de privado
┃
┃ ⌁ ${config.prefix}addsticker (reply)
┃   ↳ Adicionar sticker respondendo
┃
┃ ⌁ ${config.prefix}sendcanal (reply)
┃   ↳ Publicar texto ou mídia no canal
┃
┃ ⌁ ${config.prefix}#tempo-pg (reply)
┃   ↳ Ajustar tempo de postagem
┃
┃ ⌁ ${config.prefix}cooldown
┃   ↳ Definir intervalo entre comandos
┣┄┅┄┅┄┅┄┅┄┅┄┄┫
┗╾═╼❋╾═╼⟡╾═╼❋╾═╼┛`;
}

module.exports = generatmdono;