'use strict';
const rpg = require('../../arquivos/rpg/rpgSystem');
const economy = require('../../arquivos/rpg/economySystem');
if (!economy.isEconomyCommand('pagar_imposto')) throw new Error('comando econômico ausente');
if (!rpg.RPG_COMMANDS.has('trabalhar')) throw new Error('comando legado ausente');
console.log('MÓDULOS: PASSOU');
