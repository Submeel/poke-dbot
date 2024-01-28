const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { doGacha } = require('../action/doGacha');
const SpreadsheetDataHandler = require('../sheet.js');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('납품')
    .setDescription('유실물을 납품하고 연구 보상을 받읍시다!')
  ,

  async execute(interaction) {
    const userId = interaction.user.id;
    let result = doGacha(userId)
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