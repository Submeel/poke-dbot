const { SlashCommandBuilder } = require('discord.js');
const { doExp } = require('../action/doExp');
const SpreadsheetDataHandler = require('../sheet.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('경험치')
    .setDescription('경험치를 증감시킵니다')
    .addStringOption(option =>
      option
        .setName('부호')
        .setDescription('+ or -')
        .addChoices(
          { name: '+', value: '+' },
          { name: '-', value: '-' },
        )
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('숫자')
        .setDescription('증감량을 입력하세요')
        .setRequired(true)
    )
    .addUserOption(option =>
      option
        .setName('대상')
        .setDescription('경험치를 지급할 대상을 입력해 주세요')
        .setRequired(true)
    )
  ,
  async execute(interaction) {
    const sign = interaction.options.getString('부호')
    const amount = interaction.options.getInteger('숫자')
    const userId = interaction.options.getUser('대상')
    const result = doExp(sign, amount, userId)
    if (result.hasOwnProperty('updateData')) {
      console.log('updateData:', result.upadteData)
      // 업데이트
      const dataHandler = SpreadsheetDataHandler.getInstance();
      await dataHandler.updateCells(result.updateData)
      console.log(result.sheetRecords['캐릭터'])
      console.log('업데이트 전:' , dataHandler.sheetRecords['캐릭터'])
      dataHandler.sheetRecords = result.sheetRecords
      console.log('업데이트 후:', dataHandler.sheetRecords['캐릭터'])
    }
    interaction.reply(result.content)
  },
};