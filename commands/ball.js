const { SlashCommandBuilder } = require('discord.js');
const { doBall } = require('../action/doBall');
const SpreadsheetDataHandler = require('../sheet.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('볼던지기')
    .setDescription('볼을 던져 포켓몬을 포획합니다.')
    .addStringOption(option =>
      option
        .setName('볼')
        .setDescription('사용할 볼을 입력해 주세요.')
        .setRequired(true)
    )
  ,
  async execute(interaction) {
    const userId = interaction.user.id;
    const item = interaction.options.getString('볼')
    const result = doBall(item, userId)
    if (result.hasOwnProperty('updateData')) {
      // 업데이트
      const dataHandler = SpreadsheetDataHandler.getInstance();
      await dataHandler.updateCells(result.updateData)
      dataHandler.sheetRecords = result.sheetRecords
    }


    interaction.reply(result.content)
  },
};