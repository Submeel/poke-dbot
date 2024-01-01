const { SlashCommandBuilder } = require('discord.js');
const { doGift } = require('../action/doGift');
const SpreadsheetDataHandler = require('../sheet.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('선물')
    .setDescription('아이템을 선물합니다')
    .addStringOption(option =>
      option
        .setName('아이템')
        .setDescription('선물할 아이템을 입력해 주세요.')
  ).addUserOption(option =>
      option
        .setName('대상')
        .setDescription('선물을 주고싶은 캐릭터의 이름을 입력해 주세요.')
				.setRequired(true)
    )
    ,
  async execute(interaction) {
    const userId = interaction.user.id;
    const item = interaction.options.getString('아이템')
    const toUserId = interaction.options.getUser('대상')
    const result = doGift(toUserId, item, userId)
    if (result.hasOwnProperty('updateData')) {
      // 업데이트
      const dataHandler = SpreadsheetDataHandler.getInstance();
      await dataHandler.updateCells(result.updateData)
      dataHandler.sheetRecords = result.sheetRecords
    }


    interaction.reply(result.content)
  },
};