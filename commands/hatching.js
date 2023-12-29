const { SlashCommandBuilder } = require('discord.js');
const { doHatching } = require('../action/doHatching');
const SpreadsheetDataHandler = require('../sheet.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('부화')
    .setDescription('알을 부화시킵니다.')    
    .addStringOption(option =>
      option
        .setName('이름')
        .setDescription('포켓몬 이름')
        .setRequired(true)
    )
    ,
  async execute(interaction) {
    const userId = interaction.user.id;
    const monName = interaction.options.getString('이름')
    const result = doHatching( userId, monName)
    if (result.hasOwnProperty('updateData')) {
      // 업데이트
      const dataHandler = SpreadsheetDataHandler.getInstance();
      console.log('전:',dataHandler.sheetRecords['캐릭터'][0] )
      await dataHandler.updateCells(result.updateData)
      dataHandler.sheetRecords = result.sheetRecords
      console.log('후:',dataHandler.sheetRecords['캐릭터'][0] )
    }

    
    console.log('reply:', result.content)
    interaction.reply(result.content)
  },
};
