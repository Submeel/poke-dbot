const { SlashCommandBuilder } = require('discord.js');
const { doPoketmonEdit } = require('../action/doPoketmonEdit');
const SpreadsheetDataHandler = require('../sheet.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('변경')
    .setDescription('포켓몬을 변경합니다.')    
    .addStringOption(option =>
      option
        .setName('변경_전_이름')
        .setDescription('변경 전 포켓몬 이름')
        .setRequired(true)
    ).addStringOption(option =>
      option
        .setName('변경_후_이름')
        .setDescription('변경 후 포켓몬 이름')
        .setRequired(true)
    ).addStringOption(option =>
      option
        .setName('종류')
        .setDescription('포켓몬 종류를 기입하세요')
        .setRequired(true)
    ).addIntegerOption(option =>
      option
          .setName('레벨')
          .setDescription('포켓몬 레벨을 기입하세요.')
          .setRequired(true)
    )
    .addIntegerOption(option =>
      option
          .setName('경험치')
          .setDescription('포켓몬 경험치를 기입하세요.')
          .setRequired(true)
  )
    .addStringOption(option =>
      option
        .setName('볼')
        .setDescription('포켓몬이 담긴 볼을 기입하세요.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('파티')
        .setDescription('포켓몬을 데리고 다니시겠습니까?')
        .addChoices(
          {name:'Y', value:'Y'},
          {name:'N', value:'N'}
        )
        .setRequired(true)
    )
    ,
  async execute(interaction) {
    const userId = interaction.user.id;
    const asIsMonName = interaction.options.getString('변경_전_이름')
    const toBeMonName = interaction.options.getString('변경_후_이름')
    const monKind = interaction.options.getString('종류')
    const monLevel = interaction.options.getInteger('레벨')
    const monExp = interaction.options.getInteger('경험치')
    const monBall = interaction.options.getString('볼')
    const monParty = interaction.options.getString('파티')
    const result = doPoketmonEdit(userId, asIsMonName, toBeMonName, monKind, monLevel, monExp, monBall, monParty)
    if (result.hasOwnProperty('updateData')) {
      // 업데이트
      const dataHandler = SpreadsheetDataHandler.getInstance();
      console.log('전:',dataHandler.sheetRecords['캐릭터'][0] )
      await dataHandler.updateCells(result.updateData)
      dataHandler.sheetRecords = result.sheetRecords
      console.log('후:',dataHandler.sheetRecords['캐릭터'][0] )
    }

    // const emoji = '✅';
    // const emojiSnd = '❌'
    console.log('reply:', result.content)
    interaction.reply(result.content)
    // const replyMessage = await interaction.reply({ content: result.content, fetchReply: true})
    // await replyMessage.react(emoji)
    // await replyMessage.react(emojiSnd)


    
  },
};
