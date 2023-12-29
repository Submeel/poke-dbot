const { SlashCommandBuilder } = require('discord.js');
const { doRooting } = require('../action/doRooting');
const SpreadsheetDataHandler = require('../sheet.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('획득')
    .setDescription('아이템을 획득합니다')
    .addStringOption(option =>
      option
        .setName('아이템')
        .setDescription('획득할 아이템을 입력해 주세요.')
        .setRequired(true)
    )
  ,
  async execute(interaction) {
    const userId = interaction.user.id;
    const item = interaction.options.getString('아이템')
    const result = doRooting(item, userId)
    if (result.hasOwnProperty('updateData')) {
      // 업데이트
      const dataHandler = SpreadsheetDataHandler.getInstance();
      await dataHandler.updateCells(result.updateData)
      dataHandler.sheetRecords = result.sheetRecords
    }

    
    interaction.reply(result.content)
  },
};