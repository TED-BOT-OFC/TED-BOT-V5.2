const config = require("../config.json");

// Função para gerar data/hora formatada
function getCurrentDateTime() {
    const now = new Date();
    // Força o fuso horário de Brasília (America/Sao_Paulo)
    const date = now.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const time = now.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" });
    return { date, time };
}

function generateBrincadeirasMenu() {
    const { date, time } = getCurrentDateTime();

    return `┏╾═╼❋╾═╼⟡╾═╼❋╾═╼┓
┣┄┄┅┄┅┄┅┄┅┄┅┄┄┫
┃ ⟡ 𝐌𝐄𝐍𝐔 𝐃𝐄 𝐁𝐑𝐈𝐍𝐂𝐀𝐃𝐄𝐈𝐑𝐀𝐒 ⟡ 
┃ 𖦹 ${date} 
┃ 𖦹 ${time} 
┃ 𖦹 Dono: ${config.NickDono} 
┣┄┄┅┄┅┄┅┄┅┄┅┄┄┫
┃ ❖ 𝐓𝐎𝐏 𝟓 - 𝐑𝐀𝐍𝐊𝐈𝐍𝐆𝐒 ❖ 
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ⌁ ${config.prefix}rankgay
┃   ↳ Top 5 Gays
┃
┃ ⌁ ${config.prefix}rankcorno
┃   ↳ Top 5 Cornos
┃
┃ ⌁ ${config.prefix}rankbelo
┃   ↳ Top 5 Bonitos
┃
┃ ⌁ ${config.prefix}ranknerd
┃   ↳ Top 5 Nerds
┃
┃ ⌁ ${config.prefix}rankgostosa
┃   ↳ Top 5 Gostosas
┃
┃ ⌁ ${config.prefix}rankotario
┃   ↳ Top 5 Otários
┃
┃ ⌁ ${config.prefix}rankfeio
┃   ↳ Top 5 Feios
┃
┃ ⌁ ${config.prefix}rankrico
┃   ↳ Top 5 Milionários
┃
┃ ⌁ ${config.prefix}jokenpo
┃   ↳ Pedra, Papel e Tesoura
┃
┃ ⌁ ${config.prefix}rankjkp
┃   ↳ Ranking do Jokenpô
┃
┃ ⌁ ${config.prefix}roleta
┃   ↳ gera roleta anikada
┃
┃ ⌁ ${config.prefix}moeda
┃   ↳ moeda cara coroa random
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ❖ 𝐀ÇÕ𝐄𝐒 𝐂𝐎𝐌 𝐌𝐄𝐌𝐁𝐑𝐎𝐒 ❖ 
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ⌁ ${config.prefix}tapa @membro
┃   ↳ Dá um tapa
┃
┃ ⌁ ${config.prefix}tomate @membro
┃   ↳ Joga um tomate
┃
┃ ⌁ ${config.prefix}carinho @membro
┃   ↳ Dá um carinho
┃
┃ ⌁ ${config.prefix}aplaudir @membro
┃   ↳ Aplaude
┃
┃ ⌁ ${config.prefix}cafune @membro
┃   ↳ Faz um cafuné
┃
┃ ⌁ ${config.prefix}chutar @membro
┃   ↳ Dá um chute
┃
┃ ⌁ ${config.prefix}acenar @membro
┃   ↳ Acena
┃
┃ ⌁ ${config.prefix}dancar @membro
┃   ↳ Dança com
┃
┃ ⌁ ${config.prefix}morder @membro
┃   ↳ Dá uma mordida
┃
┃ ⌁ ${config.prefix}atirar @membro
┃   ↳ Dá um tiro
┃
┃ ⌁ ${config.prefix}beliscar @membro
┃   ↳ Dá um beliscão
┃
┃ ⌁ ${config.prefix}abracar @membro
┃   ↳ Dá um abraço
┃
┃ ⌁ ${config.prefix}matar @membro
┃   ↳ Mata
┃
┃ ⌁ ${config.prefix}comer @membro
┃   ↳ Come
┃
┃ ⌁ ${config.prefix}beijo @membro
┃   ↳ Dá um beijo
┃
┃ ⌁ ${config.prefix}foda @membro
┃   ↳ Faz sexo com
┃
┃ ⌁ ${config.prefix}soco @membro
┃   ↳ Dá um soco
┃
┃ ⌁ ${config.prefix}piscada @membro
┃   ↳ Dá uma piscada
┃
┃ ⌁ ${config.prefix}cutucar @membro
┃   ↳ Dá uma cutucada
┃
┃ ⌁ ${config.prefix}rasteira @membro
┃   ↳ Dá uma rasteira
┃
┃ ⌁ ${config.prefix}puxarorelha @membro
┃   ↳ Puxa a orelha
┃
┃ ⌁ ${config.prefix}ovo @membro
┃   ↳ Joga um ovo
┃
┃ ⌁ ${config.prefix}voadora @membro
┃   ↳ Dá uma voadora
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ❖ 𝐌𝐄𝐃𝐈𝐃𝐎𝐑𝐄𝐒 - 𝐀𝐏𝐀𝐑Ê𝐍𝐂𝐈𝐀 ❖ 
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ⌁ ${config.prefix}gay
┃   ↳ Medidor gay
┃
┃ ⌁ ${config.prefix}gostoso
┃   ↳ Medidor de gostosura
┃
┃ ⌁ ${config.prefix}feio
┃   ↳ Medidor de feiura
┃
┃ ⌁ ${config.prefix}lindo
┃   ↳ Medidor de beleza
┃
┃ ⌁ ${config.prefix}charmoso
┃   ↳ Medidor de charme
┃
┃ ⌁ ${config.prefix}playboy
┃   ↳ Medidor de ostentação
┃
┃ ⌁ ${config.prefix}forte
┃   ↳ Medidor de força
┃
┃ ⌁ ${config.prefix}fraco
┃   ↳ Medidor de fraqueza
┃
┃ ⌁ ${config.prefix}bombado
┃   ↳ Medidor de hipertrofia
┃
┃ ⌁ ${config.prefix}magrelo
┃   ↳ Medidor de leveza
┃
┃ ⌁ ${config.prefix}fortao
┃   ↳ Medidor de monstro
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ❖ 𝐌𝐄𝐃𝐈𝐃𝐎𝐑𝐄𝐒 - 𝐈𝐍𝐓𝐄𝐋𝐈𝐆Ê𝐍𝐂𝐈𝐀 ❖ 
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ⌁ ${config.prefix}inteligente
┃   ↳ Medidor de inteligência
┃
┃ ⌁ ${config.prefix}burro
┃   ↳ Medidor de burrice
┃
┃ ⌁ ${config.prefix}nerd
┃   ↳ Medidor intelectual
┃
┃ ⌁ ${config.prefix}otaku
┃   ↳ Medidor weeb
┃
┃ ⌁ ${config.prefix}malandro
┃   ↳ Medidor de malandragem
┃
┃ ⌁ ${config.prefix}esperto
┃   ↳ Medidor de esperteza
┃
┃ ⌁ ${config.prefix}bobo
┃   ↳ Medidor de bobeira
┃
┃ ⌁ ${config.prefix}otario
┃   ↳ Medidor de inocência
┃
┃ ⌁ ${config.prefix}psicopata
┃   ↳ Medidor sombrio
┃
┃ ⌁ ${config.prefix}visionario
┃   ↳ Medidor de visão de futuro
┃
┃ ⌁ ${config.prefix}criativo
┃   ↳ Medidor de imaginação
┃
┃ ⌁ ${config.prefix}estudioso
┃   ↳ Medidor acadêmico
┃
┃ ⌁ ${config.prefix}pratico
┃   ↳ Medidor de pragmatismo
┃
┃ ⌁ ${config.prefix}realista
┃   ↳ Medidor de objetividade
┃
┃ ⌁ ${config.prefix}sonhador
┃   ↳ Medidor de visão poética
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ❖ 𝐌𝐄𝐃𝐈𝐃𝐎𝐑𝐄𝐒 - 𝐀𝐌𝐎𝐑 ❖ 
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ⌁ ${config.prefix}fiel
┃   ↳ Medidor de lealdade
┃
┃ ⌁ ${config.prefix}infiel
┃   ↳ Medidor de traição
┃
┃ ⌁ ${config.prefix}corno
┃   ↳ Medidor de chifre
┃
┃ ⌁ ${config.prefix}gado
┃   ↳ Medidor de gadice
┃
┃ ⌁ ${config.prefix}pegador
┃   ↳ Medidor de magnetismo
┃
┃ ⌁ ${config.prefix}talarico
┃   ↳ Medidor de talaricagem
┃
┃ ⌁ ${config.prefix}romantico
┃   ↳ Medidor romântico
┃
┃ ⌁ ${config.prefix}carinhoso
┃   ↳ Medidor de carinho
┃
┃ ⌁ ${config.prefix}ciumento
┃   ↳ Medidor de ciúme
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ❖ 𝐌𝐄𝐃𝐈𝐃𝐎𝐑𝐄𝐒 - 𝐇𝐔𝐌𝐎𝐑 ❖ 
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ⌁ ${config.prefix}engracado
┃   ↳ Medidor de humor
┃
┃ ⌁ ${config.prefix}comedia
┃   ↳ Medidor de comédia
┃
┃ ⌁ ${config.prefix}zueiro
┃   ↳ Medidor de zoeira
┃
┃ ⌁ ${config.prefix}zueira
┃   ↳ Medidor de zoeira pesada
┃
┃ ⌁ ${config.prefix}brincalhao
┃   ↳ Medidor de zoeira
┃
┃ ⌁ ${config.prefix}brabo
┃   ↳ Medidor de brabeza
┃
┃ ⌁ ${config.prefix}chorao
┃   ↳ Medidor de sensibilidade
┃
┃ ⌁ ${config.prefix}chato
┃   ↳ Medidor de chatice
┃
┃ ⌁ ${config.prefix}fofoqueiro
┃   ↳ Medidor de fofoca
┃
┃ ⌁ ${config.prefix}bebado
┃   ↳ Medidor alcoólico
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ❖ 𝐌𝐄𝐃𝐈𝐃𝐎𝐑𝐄𝐒 - 𝐏𝐎𝐃𝐄𝐑 ❖ 
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ⌁ ${config.prefix}rei
┃   ↳ Medidor de realeza
┃
┃ ⌁ ${config.prefix}chefe
┃   ↳ Medidor de autoridade
┃
┃ ⌁ ${config.prefix}presidente
┃   ↳ Medidor de presidência
┃
┃ ⌁ ${config.prefix}patrao
┃   ↳ Medidor patronal
┃
┃ ⌁ ${config.prefix}billionario
┃   ↳ Medidor bilionário
┃
┃ ⌁ ${config.prefix}poderoso
┃   ↳ Medidor de poder
┃
┃ ⌁ ${config.prefix}vencedor
┃   ↳ Medidor de mentalidade
┃
┃ ⌁ ${config.prefix}lider
┃   ↳ Medidor de liderança
┃
┃ ⌁ ${config.prefix}mito
┃   ↳ Medidor lendário
┃
┃ ⌁ ${config.prefix}padrao
┃   ↳ Medidor de padrão
┃
┃ ⌁ ${config.prefix}rico
┃   ↳ Medidor de riqueza
┃
┃ ⌁ ${config.prefix}pobre
┃   ↳ Medidor de pobreza
┃
┃ ⌁ ${config.prefix}popular
┃   ↳ Medidor de carisma
┃
┃ ⌁ ${config.prefix}senhor
┃   ↳ Medidor de sabedoria
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ❖ 𝐌𝐄𝐃𝐈𝐃𝐎𝐑𝐄𝐒 - 𝐏𝐄𝐑𝐒𝐎𝐍𝐀𝐋𝐈𝐃𝐀𝐃𝐄 ❖ 
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ⌁ ${config.prefix}calmo
┃   ↳ Medidor de zen
┃
┃ ⌁ ${config.prefix}nervoso
┃   ↳ Medidor de ansiedade
┃
┃ ⌁ ${config.prefix}simpatico
┃   ↳ Medidor de simpatia
┃
┃ ⌁ ${config.prefix}misterioso
┃   ↳ Medidor de mistério
┃
┃ ⌁ ${config.prefix}corajoso
┃   ↳ Medidor de coragem
┃
┃ ⌁ ${config.prefix}covarde
┃   ↳ Medidor de covardia
┃
┃ ⌁ ${config.prefix}desumilde
┃   ↳ Medidor de ego
┃
┃ ⌁ ${config.prefix}humilde
┃   ↳ Medidor de humildade
┃
┃ ⌁ ${config.prefix}macho
┃   ↳ Medidor alfa
┃
┃ ⌁ ${config.prefix}otimista
┃   ↳ Medidor de otimismo
┃
┃ ⌁ ${config.prefix}pessimista
┃   ↳ Medidor de pessimismo
┃
┃ ⌁ ${config.prefix}confiante
┃   ↳ Medidor de confiança
┃
┃ ⌁ ${config.prefix}inseguro
┃   ↳ Medidor de hesitação
┃
┃ ⌁ ${config.prefix}maduro
┃   ↳ Medidor de maturidade
┃
┃ ⌁ ${config.prefix}infantil
┃   ↳ Medidor infantil
┃
┃ ⌁ ${config.prefix}serio
┃   ↳ Medidor de seriedade
┃
┃ ⌁ ${config.prefix}independente
┃   ↳ Medidor de liberdade
┃
┃ ⌁ ${config.prefix}solitario
┃   ↳ Medidor de solidão
┃
┃ ⌁ ${config.prefix}extrovertido
┃   ↳ Medidor social
┃
┃ ⌁ ${config.prefix}introvertido
┃   ↳ Medidor de paz interior
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ❖ 𝐌𝐄𝐃𝐈𝐃𝐎𝐑𝐄𝐒 - 𝐄𝐒𝐓𝐈𝐋𝐎 𝐃𝐄 𝐕𝐈𝐃𝐀 ❖ 
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ⌁ ${config.prefix}trabalhador
┃   ↳ Medidor workaholic
┃
┃ ⌁ ${config.prefix}preguicoso
┃   ↳ Medidor de preguiça
┃
┃ ⌁ ${config.prefix}dorminhoco
┃   ↳ Medidor de sono
┃
┃ ⌁ ${config.prefix}comilao
┃   ↳ Medidor de apetite
┃
┃ ⌁ ${config.prefix}atleta
┃   ↳ Medidor atlético
┃
┃ ⌁ ${config.prefix}sedentario
┃   ↳ Medidor sedentário
┃
┃ ⌁ ${config.prefix}saudavel
┃   ↳ Medidor de saúde
┃
┃ ⌁ ${config.prefix}doente
┃   ↳ Medidor de imunidade
┃
┃ ⌁ ${config.prefix}economico
┃   ↳ Medidor de pão-durismo
┃
┃ ⌁ ${config.prefix}gastador
┃   ↳ Medidor de gastança
┃
┃ ⌁ ${config.prefix}organizado
┃   ↳ Medidor de organização
┃
┃ ⌁ ${config.prefix}bagunceiro
┃   ↳ Medidor de bagunça
┃
┃ ⌁ ${config.prefix}responsavel
┃   ↳ Medidor de compromisso
┃
┃ ⌁ ${config.prefix}irresponsavel
┃   ↳ Medidor de improviso
┃
┃ ⌁ ${config.prefix}programador
┃   ↳ Medidor de código
┃
┃ ⌁ ${config.prefix}gamer
┃   ↳ Medidor gamer
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ❖ 𝐌𝐄𝐃𝐈𝐃𝐎𝐑𝐄𝐒 - 𝐈𝐃𝐄𝐎𝐋𝐎𝐆𝐈𝐀 ❖ 
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ⌁ ${config.prefix}bolsonarista
┃   ↳ Medidor bolsonarista
┃
┃ ⌁ ${config.prefix}petista
┃   ↳ Medidor petista
┃
┃ ⌁ ${config.prefix}comunista
┃   ↳ Medidor comunista
┃
┃ ⌁ ${config.prefix}lulista
┃   ↳ Medidor lulista
┃
┃ ⌁ ${config.prefix}religioso
┃   ↳ Medidor de fé
┃
┃ ⌁ ${config.prefix}ateu
┃   ↳ Medidor racionalista
┃
┃ ⌁ ${config.prefix}supersticioso
┃   ↳ Medidor de superstição
┃
┃ ⌁ ${config.prefix}cetico
┃   ↳ Medidor de ceticismo
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ❖ 𝐂𝐎𝐌𝐏𝐎𝐑𝐓𝐀𝐌𝐄𝐍𝐓𝐎 𝐃𝐔𝐕𝐈𝐃𝐎𝐒𝐎 ❖ 
┣┄┄┄┄┄┄┄┄┄┄┄┄┄┫
┃ ⌁ ${config.prefix}nazista
┃   ↳ Medidor de ideologia podre
┃
┃ ⌁ ${config.prefix}ladrao
┃   ↳ Medidor de ladrão
┃
┃ ⌁ ${config.prefix}safado
┃   ↳ Medidor de safadeza
┃
┃ ⌁ ${config.prefix}machista
┃   ↳ Medidor de machismo
┃
┃ ⌁ ${config.prefix}homofobico
┃   ↳ Medidor homofóbico
┃
┃ ⌁ ${config.prefix}racista
┃   ↳ Medidor racista
┃
┃ ⌁ ${config.prefix}pirocudo
┃   ↳ Medidor de lenda
┃
┃ ⌁ ${config.prefix}pirokudo
┃   ↳ Medidor de lenda
┃
┃ ⌁ ${config.prefix}vesgo
┃   ↳ Medidor de visão panorâmica
┃
┃ ⌁ ${config.prefix}sortudo
┃   ↳ Medidor de sorte
┃
┃ ⌁ ${config.prefix}azarado
┃   ↳ Medidor de azar
┃
┃ ⌁ ${config.prefix}traidor
┃   ↳ Medidor de traição
┃
┃ ⌁ ${config.prefix}bandido
┃   ↳ Medidor de ficha suja
┃
┃ ⌁ ${config.prefix}cachorro
┃   ↳ Medidor de lealdade
┃
┃ ⌁ ${config.prefix}vagabundo
┃   ↳ Medidor de vida mansa
┃
┃ ⌁ ${config.prefix}pilantra
┃   ↳ Medidor de pilantragem
┣┄┅┄┅┄┅┄┅┄┅┄┄┫
┗╾═╼❋╾═╼⟡╾═╼❋╾═╼┛`;
}

module.exports = generateBrincadeirasMenu;