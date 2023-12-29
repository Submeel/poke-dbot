const { SlashCommandBuilder } = require('discord.js');
const { doPoketmonAdd } = require('../action/doPoketmonAdd');
const SpreadsheetDataHandler = require('../sheet.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('추가')
    .setDescription('포켓몬의 데이터를 추가합니다.')    
    .addStringOption(option =>
      option
        .setName('이름')
        .setDescription('포켓몬이름')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
          .setName('레벨')
          .setDescription('포켓몬 레벨을 기입하세요.')
          .setRequired(true)
    )
    .addIntegerOption(option =>
      option
          .setName('경험치')
          .setDescription('포켓몬 초기 경험치를 기입하세요.')
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
    const monName = interaction.options.getString('이름')
    const monLevel = interaction.options.getInteger('레벨')
    const monExp = interaction.options.getInteger('경험치')
    const monBall = interaction.options.getString('볼')
    const monParty = interaction.options.getString('파티')
    const result = doPoketmonAdd(userId, monName, monLevel, monExp, monBall, monParty)
    if (result.hasOwnProperty('updateData')) {
      // 업데이트
      const dataHandler = SpreadsheetDataHandler.getInstance();
      console.log('전:',dataHandler.sheetRecords['캐릭터'][0] )
      await dataHandler.updateCells(result.updateData)
      dataHandler.sheetRecords = result.sheetRecords
      console.log('후:',dataHandler.sheetRecords['캐릭터'][0] )
    }

    
    console.log('reply:', result.content)
    interaction.reply(result.content)
  },
};
