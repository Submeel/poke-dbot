const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { doProfile } = require('../action/doProfile');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('프로필')
    .setDescription('[이름, HP, 경험치, 인벤토리, 데리고 있는 포켓몬]을 확인합니다.')
    .addUserOption(option =>
      option
        .setName('대상')
        .setDescription('확인하고싶은 캐릭터의 이름을 입력해 주세요. 공란일 경우 자신의 프로필을 확인합니다.')
				.setRequired(true)
    )
    ,
  
  async execute(interaction) {
    // const userId = interaction.user.id;
    const userId = interaction.options.getUser('대상')
    let result = doProfile(userId)   //target,  
    interaction.reply(result.content)
  },
};