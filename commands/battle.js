const { ThreadAutoArchiveDuration, SlashCommandBuilder } = require('discord.js');
const { doBattle } = require('../action/doBattle');
const SpreadsheetDataHandler = require('../sheet.js');
const { writeJson } = require('../jsonFile.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('승부')
    .setDescription('트레이너가 승부를 걸어왔다!')
    .addStringOption(option =>
      option
        .setName('이름')
        .setDescription('승부를 할 대상의 이름을 장성해 주세요')
        .setRequired(true)
    )
  ,
  async execute(interaction) {
    const channelId = interaction.channel.id;
    const userId = interaction.user.id;
    const targetName = interaction.options.getString('이름')
    const result = doBattle(targetName, userId, channelId)
    if (result.hasOwnProperty('updateData')) {
      // 업데이트
      const dataHandler = SpreadsheetDataHandler.getInstance();
      await dataHandler.updateCells(result.updateData)
      dataHandler.sheetRecords = result.sheetRecords
    }

    if (result.hasOwnProperty('isNeedThread') && result.isNeedThread === true) {
      console.log('스레드를 만듭니다.')
      const now = new Date();
      let yy = now.getFullYear()
      let hh = now.getMonth() + 1
      let dd = now.getDate()
      let HH = now.getHours()
      let mm = now.getMinutes()
      let ss = now.getSeconds()

      let name = `[배틀] ${yy}.${hh}.${dd}-${HH}:${mm}:${ss}`
      const thread = await interaction.channel.threads.create({
        name: name,
        autoArchiveDuration: ThreadAutoArchiveDuration.OneHour, // 1시간 후 아카이빙
      });

      //스레드에 메시지 전송
      let makeThread = await thread.send('스레드 생성 테스트');
      writeJson(makeThread.channelId)
    }
    interaction.reply(result.content)
  },
};