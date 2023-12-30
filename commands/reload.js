const { SlashCommandBuilder } = require('discord.js');
const SpreadsheetDataHandler = require('../sheet.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('새로고침')
    .setDescription('시트에서 변경된 값을 다시 불러옵니다.')
  ,
  async execute(interaction) {
    const dataHandler = SpreadsheetDataHandler.getInstance();
    await dataHandler.getAllSheetDataAsDictionaries();
    console.log('Sheet data load 완료:', dataHandler.sheetRecords);
    interaction.reply("시트에서 모든 데이터를 다시 불러왔으며, 적용되었습니다.")
  },
};