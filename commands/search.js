const { SlashCommandBuilder } = require('discord.js');
const { doSearch } = require('../action/doSearch');
const SpreadsheetDataHandler = require('../sheet.js');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('탐색')
    .setDescription('주변의 포켓몬을 탐색합니다.')
    .addStringOption(option =>
      option
        .setName('대상')
        .setDescription('포켓몬 혹은 찾고자 하는 포켓몬의 명칭을 입력합니다.')
        .setRequired(true)
    )
  ,
  async execute(interaction) {
    const userId = interaction.user.id
    const target = interaction.options.getString('대상')
    let result = doSearch(target, userId)
    if (result.hasOwnProperty('updateData')) {
      // 업데이트
      const dataHandler = SpreadsheetDataHandler.getInstance();
      await dataHandler.updateCells(result.updateData)
      dataHandler.sheetRecords = result.sheetRecords
    }
    interaction.reply(result.content)
  },
};