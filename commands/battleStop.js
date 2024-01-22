const { ThreadAutoArchiveDuration, SlashCommandBuilder } = require('discord.js');
const { doBattleStop } = require('../action/doBattleStop');
const SpreadsheetDataHandler = require('../sheet.js');
const { writeJson } = require('../jsonFile.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('중단')
    .setDescription('승부를 강제로 종료합니다.')
  ,
  async execute(interaction) {
    const channelId = interaction.channel.id;
    const userId = interaction.user.id;
    const result = doBattleStop(userId, channelId)
    if (result.hasOwnProperty('updateData')) {
      // 업데이트
      const dataHandler = SpreadsheetDataHandler.getInstance();
      await dataHandler.updateCells(result.updateData)
      dataHandler.sheetRecords = result.sheetRecords
    }

    interaction.reply(result.content)
  },
};