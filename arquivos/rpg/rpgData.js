'use strict';

const MENU_IMAGES = [
  'https://xatimg.com/image/TyANiC68n4eZ.jpg',
  'https://xatimg.com/image/961HUSiON1gH.jpg',
  'https://xatimg.com/image/TyANiC68n4eZ.jpg',
  'https://xatimg.com/image/O7PErzKMLStl.jpg',
  'https://xatimg.com/image/961HUSiON1gH.jpg',
  'https://xatimg.com/image/TyANiC68n4eZ.jpg',
  'https://xatimg.com/image/O7PErzKMLStl.jpg',
  'https://xatimg.com/image/961HUSiON1gH.jpg'
];

const MENU_AUDIO_URL = 'https://c.top4top.io/m_3439grqmu7.mp3';
const MENU_THUMBNAIL_URL = 'https://xatimg.com/image/47FHqq0plr88.jpg';
const MENU_SITE_URL = 'https://tedhost.com.br';

const HOUSES = [
  { nome: 'Apartamento Simples', preco: 50000, descricao: 'Prático e acessível.', imagem: 'https://xatimg.com/image/4x0bJNhUXjoT.jpg' },
  { nome: 'Casa de Subúrbio', preco: 120000, descricao: 'Conforto para a família.', imagem: 'https://xatimg.com/image/98wcb2aeuQmR.jpg' },
  { nome: 'Casa de Praia', preco: 250000, descricao: 'Vista para o mar garantida.', imagem: 'https://xatimg.com/image/sdiNYMz2YFei.jpg' },
  { nome: 'Cobertura Urbana', preco: 400000, descricao: 'Vista panorâmica da cidade.', imagem: 'https://xatimg.com/image/GK10AijJMgA5.jpg' },
  { nome: 'Casa no Lago', preco: 600000, descricao: 'Tranquilidade à beira da água.', imagem: 'https://xatimg.com/image/LK54Mxot7Ls7.jpg' },
  { nome: 'Mansão Urbana', preco: 850000, descricao: 'Luxo na cidade grande.', imagem: 'https://xatimg.com/image/lObhwjiTYtbm.jpg' },
  { nome: 'Mansão no Campo', preco: 1200000, descricao: 'Espaço e natureza juntos.', imagem: 'https://xatimg.com/image/wRlZGWNsBADn.png' },
  { nome: 'Castelo Antigo', preco: 1800000, descricao: 'História e elegância.', imagem: 'https://files.catbox.moe/xu07os.jpg' },
  { nome: 'Villa Italiana', preco: 2200000, descricao: 'Estilo europeu clássico.', imagem: 'https://files.catbox.moe/4i1aoj.jpeg' },
  { nome: 'Palacete Francês', preco: 2600000, descricao: 'Charme do velho mundo.', imagem: 'https://files.catbox.moe/q7dn5n.jpg' },
  { nome: 'Casa Futurista', preco: 3000000, descricao: 'Tecnologia em cada canto.', imagem: 'https://files.catbox.moe/e2ijfs.jpg' },
  { nome: 'Ilha Particular', preco: 3500000, descricao: 'Privacidade total.', imagem: 'https://files.catbox.moe/52ykv7.jpg' },
  { nome: 'Mansão Subterrânea', preco: 4000000, descricao: 'Luxo abaixo do solo.', imagem: 'https://i.ibb.co/spcK26RX/pexels-photo-221457.jpg' },
  { nome: 'Mega Mansão', preco: 4500000, descricao: 'Espaço e ostentação.', imagem: 'https://i.ibb.co/pr540cSr/fc7716cdaec6ce9f4c9449e5a4d58249.jpg' },
  { nome: 'Palácio Real', preco: 5000000, descricao: 'Morada digna da realeza.', imagem: 'https://i.ibb.co/v6BXQZCt/images-7.jpg' }
];

const LUXURY_CARS = [
  { nome: 'Ferrari SF90 Stradale', preco: 500000, descricao: 'Alta performance híbrida.', imagem: 'https://xatimg.com/image/5q7G4zYzYKQs.jpg' },
  { nome: 'Lamborghini Sián', preco: 750000, descricao: 'O primeiro Lamborghini híbrido.', imagem: 'https://xatimg.com/image/ItbXwvOlRizz.jpg' },
  { nome: 'Rolls-Royce Phantom', preco: 980000, descricao: 'Luxo silencioso absoluto.', imagem: 'https://xatimg.com/image/TosRokBdnPTw.jpg' },
  { nome: 'Bentley Continental GT', preco: 1100000, descricao: 'Poder e requinte.', imagem: 'https://xatimg.com/image/0dSLx1Rt2Ppr.jpg' },
  { nome: 'Aston Martin Valkyrie', preco: 1800000, descricao: 'Desempenho de Fórmula 1.', imagem: 'https://xatimg.com/image/WEfsGtj6z6eW.jpg' },
  { nome: 'Bugatti Veyron', preco: 3000000, descricao: 'Superesportivo clássico.', imagem: 'https://xatimg.com/image/eHb8pXcLkzFQ.jpg' },
  { nome: 'Bugatti La Voiture Noire', preco: 4500000, descricao: 'Exclusividade máxima.', imagem: 'https://xatimg.com/image/mLeRShYJzlSs.jpg' },
  { nome: 'Pagani Huayra', preco: 5200000, descricao: 'Artesanal e potente.', imagem: 'https://xatimg.com/image/OouteTt2PT9S.jpg' },
  { nome: 'Koenigsegg Jesko', preco: 7000000, descricao: 'Velocidade absurda.', imagem: 'https://xatimg.com/image/RHbqcliffAzM.jpg' },
  { nome: 'McLaren Speedtail', preco: 8500000, descricao: 'Futurismo e velocidade.', imagem: 'https://xatimg.com/image/k6ZRIJUnRrC1.jpg' },
  { nome: 'Bugatti Centodieci', preco: 9000000, descricao: 'Homenagem ao passado.', imagem: 'https://xatimg.com/image/aP4CxcCbsBLu.jpg' },
  { nome: 'Lamborghini Veneno', preco: 9500000, descricao: 'Agressivo e raro.', imagem: 'https://xatimg.com/image/afUHki50leyV.jpg' },
  { nome: 'Maybach Exelero', preco: 11000000, descricao: 'Luxo e potência juntos.', imagem: 'https://xatimg.com/image/Xr2FPpw3IjDi.jpg' },
  { nome: 'Ferrari Pininfarina Sergio', preco: 13000000, descricao: 'Design exclusivo.', imagem: 'https://xatimg.com/image/nkbNjCPIttjM.jpg' },
  { nome: 'Rolls-Royce Boat Tail', preco: 15000000, descricao: 'O carro mais caro do mundo.', imagem: 'https://xatimg.com/image/aoA3zZAdL9ds.jpg' }
];

const CAR_VALUES = Object.fromEntries(LUXURY_CARS.map((car) => [car.nome, car.preco]));

const BANKS = [
  { nome: 'Nubank', id: 'nubank', estrelas: 4.8, crescimento: 91 },
  { nome: 'Mercado Pago', id: 'mercado pago', estrelas: 4.5, crescimento: 88 },
  { nome: 'Banco Inter', id: 'inter', estrelas: 4.3, crescimento: 76 },
  { nome: 'Banco do Brasil', id: 'brasil', estrelas: 4.0, crescimento: 70 },
  { nome: 'Bradesco', id: 'bradesco', estrelas: 3.9, crescimento: 65 }
];

const LIFE_MODES = ['trabalhador', 'investidor', 'aventureiro', 'econômico', 'luxuoso'];

const BET_WARNINGS = [
  '👀 Olha tá gastando demais, hein! Cuidado que amanhã vai te derrubar!',
  '😱 Rapaz, tá apostando alto demais! Vai com calma que não é só no jogo que perde!',
  '🔥 Calma aí, campeão! Apostar 50 mil ou mais é pra poucos, hein!',
  '💀 Tá jogando com fogo! Esse gasto pode te derrubar amanhã!',
  '🤡 Cuidado, você tá virando meme apostando assim!',
  '⚠️ Olha a responsa! Apostar alto assim pode dar ruim!',
  '🧨 Tá jogando pesado demais, melhor dar uma segurada!',
  '😬 Apostar tudo assim é roleta russa, cuidado!',
  '💣 Essa aposta pode explodir na sua cara, pense bem!',
  '🚨 ALERTA: Tá gastando demais, pode virar piada!',
  '😵 Apostar assim é pra quem gosta de viver perigosamente!',
  '💸 Cuidado pra não deixar o bolso vazio amanhã!',
  '🤯 Essa aposta pode te deixar com dor de cabeça!',
  '🛑 Freia essa empolgação antes que seja tarde!',
  '🔥 Tá pegando fogo essa conta, segura esse impulso!',
  '🎲 Sorte é importante, mas controle é essencial!',
  '😎 Tá jogando como se fosse rico, mas não exagere!',
  '👻 Apostar assim pode assombrar seu saldo amanhã!',
  '⚡ Tá apostando com eletricidade, cuidado com o choque!',
  '🦸‍♂️ Tá agindo como herói, mas até herói cai, viu?',
  '🕵️‍♀️ Cuidado que tão te observando jogar assim!',
  '🌪️ Apostar desse jeito é furacão no seu bolso!',
  '🚧 Zona de risco ativada, apostador, controle-se!',
  '💡 Pense duas vezes antes de apostar tudo!',
  '🎯 Apostar assim é tiro no escuro, cuidado!',
  '💥 Tá jogando alto, vai com calma pra não explodir!',
  '😜 Tá brincando com fogo, apostador maluco!',
  '💀 Se continuar assim, vai perder tudo rapidinho!',
  '🤡 Memes tão te esperando com essas apostas!',
  '🤑 Tá fazendo chover dinheiro, mas cuidado com a tempestade!',
  '🥶 Apostar demais pode congelar sua conta amanhã!',
  '🔥 Vai devagar com esse fogo no bolso!',
  '🚀 Apostar assim é foguete que pode cair rápido!',
  '😬 Segura essa onda antes que ela te engula!',
  '💣 Apostar alto pode ser um estouro na sua vida!',
  '🕳️ Cuidado para não cair no buraco das apostas!',
  '😤 Tá apostando forte, mas respira fundo!',
  '⚖️ Equilíbrio é tudo, não jogue tudo de uma vez!',
  '🎉 Pequenas apostas, grandes vitórias, lembre disso!',
  '🙃 Apostar tudo pode virar um jogo de azar!',
  '🧙‍♂️ Apostador sábio controla as apostas, não o contrário!',
  '💭 Pense no amanhã antes de apostar tudo hoje!',
  '⏳ Apostar demais pode custar caro no futuro!',
  '⚡ Jogue com estratégia, não só com emoção!',
  '🌈 Sorte e cuidado andam juntos nas apostas!'
];

const EXIT_MESSAGES = {
  3: [
    '🐣 *Você mal começou e já desistiu? Covarde.*',
    '😵 *Você caiu no primeiro buraco e nunca mais voltou.*',
    '🥱 *Você preferiu dormir do que lutar. Adeus, sonhador.*'
  ],
  6: [
    '⚔️ *Você largou a espada antes de aprender a usá-la.*',
    '🎒 *Você fugiu e deixou até a mochila pra trás.*',
    '🚶 *Você apenas... foi embora. Ninguém sabe pra onde.*'
  ],
  10: [
    '🧭 *Você se perdeu no caminho e nunca mais voltou.*',
    '🏕️ *Você acampou longe demais e se esqueceu da aventura.*'
  ],
  20: [
    '🛡️ *Um guerreiro cansado pendurou seu escudo.*',
    '⚰️ *Dizem que você caiu em combate, mas ninguém viu seu corpo.*'
  ],
  35: [
    '🏰 *Um herói veterano se retirou em silêncio.*',
    '🍷 *Você decidiu viver da fama... e da boa bebida.*'
  ],
  50: [
    '📖 *Sua lenda será contada nas tavernas por gerações.*',
    '🔥 *Você saiu deixando apenas pegadas em chamas.*'
  ],
  75: [
    '👑 *O Rei abandonou seu trono, e o reino chora sua ausência.*',
    '🏹 *O caçador mais lendário desapareceu entre as árvores.*'
  ],
  100: [
    '🌟 *Você se tornou uma estrela, mas não da forma que esperávamos.*',
    '🔮 *Um mago poderoso sumiu no tempo, deixando apenas ecos.*'
  ],
  infinity: [
    '🌌 *Você alcançou o topo... e desapareceu como uma estrela cadente.*',
    '🪐 *A aventura te levou além do próprio RPG. Agora você é lenda.*'
  ]
};

module.exports = {
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
};
