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
    let desc = result.content//만들어온 임베드
    console.log('desc:',desc)

    //버튼만들기
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

    const msg = await interaction.reply({
      content: `${item}:: ${amount}개 판매하시겠습니까?`, 
      components: [buttons]
      
    });

    // 버튼 클릭을 수집하는 메시지 컴포넌트 수집기를 생성
    const mc = await msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time,
    });

    // 버튼이 클릭될 때마다 실행되는 이벤트 핸들러
    mc.on('collect', async (i) => {
      // 클릭한 사용자의 ID가 원래 상호작용을 시작한 사용자의 ID와 일치하는지 확인
      if (i.user.id !== interaction.user.id) return i.reply({ content: '남의 물건을 훔치면 안 돼!', ephemeral: true });

      // 응답 지연
      await i.deferUpdate({});
      // 클릭된 버튼의 customId를 확인하여 페이지 인덱스를 업데이트
      if (i.customId === 'cancel') { 
        await interaction.reply("구매가 취소되었습니다.")
      } 
      if (i.customId === 'confirm') {
        await interaction.reply("아이템을 구매했습니다!")
      } 


    return msg;
  })
  },
};