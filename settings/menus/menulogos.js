const config = require("../config.json");

// Função para gerar data/hora formatada
function getCurrentDateTime() {
    const now = new Date();
    const date = now.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const time = now.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" });
    return { date, time };
}

function generatemenulogos() {
    const { date, time } = getCurrentDateTime();

    return `┏╾═╼❋╾═╼⟡╾═╼❋╾═╼┓
┣┄┄┅┄┅┄┅┄┅┄┅┄┄┫
┃ ⟡ 𝐌𝐄𝐍𝐔 𝐋𝐎𝐆𝐎𝐒 ⟡ 
┃ 𖦹 ${date} 
┃ 𖦹 ${time} 
┃ 𖦹 Dono: ${config.NickDono} 
┣┄┄┅┄┅┄┅┄┅┄┅┄┄┫
┃ ❖ 𝐀𝐍𝐈𝐌𝐄 & 𝐆𝐀𝐌𝐄 ❖ 
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ⌁ ${config.prefix}Anime
┃ ⌁ ${config.prefix}Anime2
┃ ⌁ ${config.prefix}Game
┃ ⌁ ${config.prefix}Pubgvideo
┃ ⌁ ${config.prefix}Pubgavatar
┃ ⌁ ${config.prefix}Ffavatar
┃ ⌁ ${config.prefix}Lolavatar
┃ ⌁ ${config.prefix}Mascotemetal
┃ ⌁ ${config.prefix}Mascote
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ❖ 𝐅𝐈𝐑𝐄 & 𝐈𝐂𝐄 ❖ 
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ⌁ ${config.prefix}Ffrose
┃ ⌁ ${config.prefix}Ffgren
┃ ⌁ ${config.prefix}Lava-logo
┃ ⌁ ${config.prefix}Fire-logo
┃ ⌁ ${config.prefix}Ice-logo
┃ ⌁ ${config.prefix}Frozen
┃ ⌁ ${config.prefix}Snow
┃ ⌁ ${config.prefix}Dragonfire
┃ ⌁ ${config.prefix}Phlogo
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ❖ 𝐄𝐅𝐄𝐈𝐓𝐎𝐒 & 𝐏𝐀𝐑𝐓𝐈𝐂𝐔𝐋𝐀𝐒 ❖ 
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ⌁ ${config.prefix}Fluffy-logo
┃ ⌁ ${config.prefix}Cool-logo
┃ ⌁ ${config.prefix}Comic-logo
┃ ⌁ ${config.prefix}Water-logo
┃ ⌁ ${config.prefix}Elegant-logo
┃ ⌁ ${config.prefix}Gold-logo
┃ ⌁ ${config.prefix}Fortune-logo
┃ ⌁ ${config.prefix}Blue-logo
┃ ⌁ ${config.prefix}Silver-logo
┃ ⌁ ${config.prefix}Neon-logo
┃ ⌁ ${config.prefix}Skate-name
┃ ⌁ ${config.prefix}Retro-logo
┃ ⌁ ${config.prefix}Candy-logo
┃ ⌁ ${config.prefix}Glossy-logo
┃ ⌁ ${config.prefix}Glossy
┃ ⌁ ${config.prefix}Newyear
┃ ⌁ ${config.prefix}Tiger
┃ ⌁ ${config.prefix}Galaxy-light
┃ ⌁ ${config.prefix}Galaxy
┃ ⌁ ${config.prefix}Glitch
┃ ⌁ ${config.prefix}Graffiti
┃ ⌁ ${config.prefix}Metallic
┃ ⌁ ${config.prefix}Goldpink
┃ ⌁ ${config.prefix}Comics
┃ ⌁ ${config.prefix}Cemiterio
┃ ⌁ ${config.prefix}Blood
┃ ⌁ ${config.prefix}Hallobat
┃ ⌁ ${config.prefix}Titanium
┃ ⌁ ${config.prefix}Eraser
┃ ⌁ ${config.prefix}Halloween
┃ ⌁ ${config.prefix}America
┃ ⌁ ${config.prefix}Mascoteneon
┃ ⌁ ${config.prefix}Doubleexposure
┃ ⌁ ${config.prefix}Metal
┃ ⌁ ${config.prefix}3dcrack
┃ ⌁ ${config.prefix}Colorful
┃ ⌁ ${config.prefix}Ballon
┃ ⌁ ${config.prefix}Multicolor
┃ ⌁ ${config.prefix}Graffitipaint
┃ ⌁ ${config.prefix}Graffitistyle
┃ ⌁ ${config.prefix}Ligatures
┃ ⌁ ${config.prefix}Watercolor
┃ ⌁ ${config.prefix}Summerbeach
┃ ⌁ ${config.prefix}Cloudsky
┃ ⌁ ${config.prefix}Techstyle
┃ ⌁ ${config.prefix}Royal
┃ ⌁ ${config.prefix}Firework
┃ ⌁ ${config.prefix}Captain
┃ ⌁ ${config.prefix}Graffitiwall
┃ ⌁ ${config.prefix}Blackpink
┃ ⌁ ${config.prefix}Deadpool
┃ ⌁ ${config.prefix}Glitter
┃ ⌁ ${config.prefix}Vintage3d
┃ ⌁ ${config.prefix}Retro
┣┄┅┄┅┄┅┄┅┄┅┄┄┫
┗╾═╼❋╾═╼⟡╾═╼❋╾═╼┛`;
}

module.exports = generatemenulogos;