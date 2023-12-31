const { ThreadAutoArchiveDuration, SlashCommandBuilder } = require('discord.js');
const { doAdv } = require('../action/doAdv');
const SpreadsheetDataHandler = require('../sheet.js');
const { writeJson } = require('../jsonFile.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('모험')
    .setDescription('주변을 둘러봅시다….')    
    .addStringOption(option =>
      option
        .setName('키워드')
        .setDescription('모험의 키워드를 입력해 주세요.')
        .setRequired(true)
    )
  ,
  async execute(interaction) {
    const userId = interaction.user.id;
    const keyword = interaction.options.getString('키워드')
    const result = doAdv(keyword, userId)
    if (result.hasOwnProperty('updateData')) {
      // 업데이트
      const dataHandler = SpreadsheetDataHandler.getInstance();
      await dataHandler.updateCells(result.updateData)
      dataHandler.sheetRecords = result.sheetRecords
    }

    if (result.hasOwnProperty('isNeedThread') && result.isNeedThread === true){
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
      let makeThread = await thread.send(result.threadDesc);
      writeJson(makeThread.channelId)
    }
    interaction.reply(result.content)
  },
};