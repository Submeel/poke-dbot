const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { doTest } = require('../action/doTest');
const buttonPagination = require('../buttonPagination');
const SpreadsheetDataHandler = require('../sheet.js');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('테스트')
    .setDescription('PC에 보관된 포켓몬의 정보를 확인합니다.')
  ,

  async execute(interaction) {
    const userId = interaction.user.id;
    let result = doTest(userId)
    if (result.hasOwnProperty('updateData')) {
      console.log('updateData:', result.upadteData)
      // 업데이트
      const dataHandler = SpreadsheetDataHandler.getInstance();
      await dataHandler.updateCells(result.updateData)
      dataHandler.sheetRecords = result.sheetRecords
    }
    try {
      const embeds = [];
      // const embeds = result.content.embeds;
      for (let i = 0; i < embeds.lenght; i++) {
        embeds.push(result.content.embeds.i);
      }

      console.log('embeds lenght:', embeds.length)
      await buttonPagination(interaction, embeds);
    } catch (err) {
      console.log(err);
    }

    // interaction.reply(result.content)
  },
};