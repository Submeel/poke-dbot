const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { doBox } = require('../action/doBox');
const SpreadsheetDataHandler = require('../sheet.js');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('박스')
    .setDescription('PC에 보관된 포켓몬의 정보를 확인합니다.')
  ,

  async execute(interaction) {
    const userId = interaction.user.id;
    let result = doBox(userId) 
    if (result.hasOwnProperty('updateData')) {
      console.log('updateData:', result.upadteData)
      // 업데이트
      const dataHandler = SpreadsheetDataHandler.getInstance();
      await dataHandler.updateCells(result.updateData)
      dataHandler.sheetRecords = result.sheetRecords
    }
    interaction.reply(result.content)
  },
};