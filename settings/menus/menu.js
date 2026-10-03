const config = require("../config.json");

function getCurrentDateTime() {
    const now = new Date();
    const date = now.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const time = now.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" });
    return { date, time };
}

function generateMenu() {
    const { date, time } = getCurrentDateTime();
    return `┏╾═╼❋╾═╼⟡╾═╼❋╾═╼┓
┣┄┄┅┄┅┄┅┄┅┄┅┄┄┫
┃ ⟡ 𝐓𝐄𝐃 𝐁𝐎𝐓 ⟡ 
┃ 𖦹 ${date} 
┃ 𖦹 ${time} 
┃ 𖦹 Dono: ${config.NickDono} 
┣┄┄┅┄┅┄┅┄┅┄┅┄┄┫
┃ ❖ 𝐏𝐑𝐈𝐍𝐂𝐈𝐏𝐀𝐋 ❖ 
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ⌁ ${config.prefix}menuadm
┃ ⌁ ${config.prefix}brincadeiras
┃ ⌁ ${config.prefix}menurpg
┃ ⌁ ${config.prefix}menulogos
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ❖ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 ❖ 
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ⌁ ${config.prefix}ping
┃ ⌁ ${config.prefix}status
┃ ⌁ ${config.prefix}stats
┃ ⌁ ${config.prefix}roubar
┃ ⌁ ${config.prefix}revelar
┃ ⌁ ${config.prefix}sticker
┃ ⌁ ${config.prefix}pack
┃ ⌁ ${config.prefix}legenda
┃ ⌁ ${config.prefix}toimg
┃ ⌁ ${config.prefix}jeff
┃ ⌁ ${config.prefix}faber
┃ ⌁ ${config.prefix}norian
┃ ⌁ ${config.prefix}fdc
┃ ⌁ ${config.prefix}wf
┃ ⌁ ${config.prefix}nano
┃ ⌁ ${config.prefix}nano2
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ❖ 𝐂𝐎𝐍𝐕𝐄𝐑𝐒𝐀𝐎 ❖ 
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ⌁ ${config.prefix}totext
┃ ⌁ ${config.prefix}ptvmsg
┃ ⌁ ${config.prefix}attp
┃ ⌁ ${config.prefix}ttp
┃ ⌁ ${config.prefix}brat
┃ ⌁ ${config.prefix}gerarlink
┃ ⌁ ${config.prefix}rvisu
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ❖ 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐒 ❖ 
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ⌁ ${config.prefix}tomp3
┃ ⌁ ${config.prefix}8d
┃ ⌁ ${config.prefix}shazam
┃ ⌁ ${config.prefix}play
┃ ⌁ ${config.prefix}play2
┃ ⌁ ${config.prefix}play3
┃ ⌁ ${config.prefix}playvid2
┃ ⌁ ${config.prefix}ytp
┃ ⌁ ${config.prefix}sc
┃ ⌁ ${config.prefix}ttk
┃ ⌁ ${config.prefix}ttk2
┃ ⌁ ${config.prefix}tiktok
┃ ⌁ ${config.prefix}tiktok2
┃ ⌁ ${config.prefix}kwai
┃ ⌁ ${config.prefix}instamp3
┃ ⌁ ${config.prefix}instamp4
┃ ⌁ ${config.prefix}myinstants
┃ ⌁ ${config.prefix}Pintemp3
┃ ⌁ ${config.prefix}Pintemp4
┃ ⌁ ${config.prefix}Pinterest
┃ ⌁ ${config.prefix}Pinterest2
┃ ⌁ ${config.prefix}gif
┃ ⌁ ${config.prefix}robloxcodes
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ❖ 𝐏𝐄𝐑𝐅𝐈𝐋 ❖ 
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ⌁ ${config.prefix}perfil
┃ ⌁ ${config.prefix}perfilff
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ❖ 𝐕𝐎𝐙 ❖ 
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ⌁ ${config.prefix}alteradores
┣┄┄┅┄┅┄┅┄┅┄┅┄┄┫
┗╾═╼❋╾═╼⟡╾═╼❋╾═╼┛`;
}

module.exports = generateMenu;