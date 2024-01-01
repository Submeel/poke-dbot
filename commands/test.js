const { SlashCommandBuilder } = require('discord.js');
const { doTest } = require('../action/doTest');
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
    let result = doTest(item, amount, userId)
    let desc = result.content
    const confirm = new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('✔')
      .setStyle(ButtonStyle.Success);
    const cancel = new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('✖')
      .setStyle(ButtonStyle.Danger); 
    const buttons = new ActionRowBuilder()
      .addComponents(cancel, confirm);
    if (result.hasOwnProperty('updateData')) {
      const dataHandler = SpreadsheetDataHandler.getInstance();
      await dataHandler.updateCells(result.updateData)
      dataHandler.sheetRecords = result.sheetRecords
    }

    // 사용자의 상호작용에 대한 응답을 지연
    await interaction.deferReply();

    // 페이지가 하나만 있는 경우, 버튼 없이 해당 페이지를 보여줍니다.
    const msg = await interaction.editReply({
      embeds: desc,
      components: [buttons],
      fetchReply: true,
    });    

    return msg;


    // await interaction.reply({
    //   content: result.content, 
    //   components: [row]
    // });
  },
};