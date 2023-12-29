const { SlashCommandBuilder } = require('discord.js');
const { doPoketmonDelete } = require('../action/doPoketmonDelete');
const SpreadsheetDataHandler = require('../sheet.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('놓아주기')
    .setDescription('포켓몬을 놓아줍니다.')    
    .addStringOption(option =>
      option
        .setName('이름')
        .setDescription('포켓몬이름')
        .setRequired(true)
    ),
  async execute(interaction) {
    const userId = interaction.user.id;
    const monName = interaction.options.getString('이름')
    const result = doPoketmonDelete(userId, monName)
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
