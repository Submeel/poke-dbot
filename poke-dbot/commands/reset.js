const { SlashCommandBuilder } = require('discord.js');
const SpreadsheetDataHandler = require('../sheet.js');
const _ = require('lodash');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('리셋')
    .setDescription('시트 값을 초기화합니다.')
  ,
  async execute(interaction) {
    const dataHandler = SpreadsheetDataHandler.getInstance();
    let sheetRecords = _.cloneDeep(dataHandler.sheetRecords);
    const chaRecords = sheetRecords['캐릭터']
    await dataHandler.clearCells("캐릭터", "R3:R100");
    await dataHandler.clearCells("캐릭터", "S3:S100");
    for (const userId in chaRecords) {
      chaRecords[userId]['모험횟수'] = null;
      chaRecords[userId]['탐색횟수'] = null;
    }
    dataHandler.sheetRecords = sheetRecords
    interaction.reply("Reset successful.")
  },
};