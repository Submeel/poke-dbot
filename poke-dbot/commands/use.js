const { SlashCommandBuilder } = require('discord.js');
const { doUse } = require('../action/doUse');
const SpreadsheetDataHandler = require('../sheet.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('사용')
    .setDescription('아이템을 사용합니다')
    .addStringOption(option =>
      option
        .setName('아이템')
        .setDescription('사용할 아이템을 입력해 주세요.')
        .setRequired(true)
    )
  ,
  async execute(interaction) {
    const userId = interaction.user.id;
    const item = interaction.options.getString('아이템')
    const result = doUse(item, userId)
    if (result.hasOwnProperty('updateData')) {
      // 업데이트
      const dataHandler = SpreadsheetDataHandler.getInstance();
      await dataHandler.updateCells(result.updateData)
      dataHandler.sheetRecords = result.sheetRecords
    }


    interaction.reply(result.content)
  },
};