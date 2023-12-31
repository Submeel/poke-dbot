const { SlashCommandBuilder } = require('discord.js');
const SpreadsheetDataHandler = require('../sheet.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('테스트')
    .setDescription('아이템을 판매합니다')
    .addStringOption(option =>
      option
        .setName('아이템')
        .setDescription('구매할 아이템을 입력해 주세요.')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('수량')
        .setDescription('1이상 99미만의 정수로 판매할 수량을 입력해 주세요. 공란일 경우 1개로 취급합니다.')
    )
  ,

  async execute(interaction) {
    const userId = interaction.user.id;
    const item = interaction.options.getString('아이템')
    const amount = interaction.options.getInteger('수량')
    //let result = doTest(item, amount, userId)
    const confirm = new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('✅')
      .setStyle(ButtonStyle.Success);
    const cancel = new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('❌')
      .setStyle(ButtonStyle.Danger); 
    const row = new ActionRowBuilder()
      .addComponents(cancel, confirm);
    // if (result.hasOwnProperty('updateData')) {
    //   const dataHandler = SpreadsheetDataHandler.getInstance();
    //   await dataHandler.updateCells(result.updateData)
    //   dataHandler.sheetRecords = result.sheetRecords
    // }
    await interaction.reply({
      content: 'result.content', 
      components: [row]
    });
  },
};