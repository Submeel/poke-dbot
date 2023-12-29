const { SlashCommandBuilder } = require('discord.js');
const { doPokemonExp } = require('../action/doPokemonExp');
const SpreadsheetDataHandler = require('../sheet.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('포켓몬경험치')
    .setDescription('포켓몬에게 경험치를 부여합니다.')
    .addStringOption(option =>
      option
        .setName('포켓몬')
        .setDescription('포켓몬 이름')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('경험치')
        .setDescription('부여할 경험치를 숫자로 적어주세요.')
        .setRequired(true)
    )
  ,
  async execute(interaction) {
    const userId = interaction.user.id;
    const monName = interaction.options.getString('포켓몬')
    const amount = interaction.options.getInteger('경험치')
    const result = doPokemonExp(monName, amount, userId)
    if (result.hasOwnProperty('updateData')) {
      console.log('updateData:', result.upadteData)
      // 업데이트
      const dataHandler = SpreadsheetDataHandler.getInstance();
      console.log('전:', dataHandler.sheetRecords['캐릭터'][0])
      await dataHandler.updateCells(result.updateData)
      dataHandler.sheetRecords = result.sheetRecords
      console.log('후:', dataHandler.sheetRecords['캐릭터'][0])
    }
    interaction.reply(result.content)
  },
};