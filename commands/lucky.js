const { SlashCommandBuilder } = require('discord.js');
const { doLucky } = require('../action/doLucky');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('운세')
    .setDescription('운세를 뽑아봅니다.')
  ,
  async execute(interaction) {
    let result = doLucky()
    interaction.reply(result.content)
  },
};