const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { doBox } = require('../action/doBox');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('박스')
    .setDescription('PC에 보관된 포켓몬의 정보를 확인합니다.')
  ,

  async execute(interaction) {
    const userId = interaction.user.id;
    let result = doBox(userId) 
    interaction.reply(result.content)
  },
};