const SpreadsheetDataHandler = require('../sheet.js');
const _ = require('lodash');
const { EmbedBuilder } = require('discord.js');

function doTest(userId) {
  try {
    console.log('doTest 시작::')
    const dataHandler = SpreadsheetDataHandler.getInstance();
    let sheetRecords = _.cloneDeep(dataHandler.sheetRecords);
    const chaRecords = sheetRecords['캐릭터']
    console.log(chaRecords)
    let content = null;
    let updateData = {};

    // 메시지를 보낸 유저의 아이디를 읽어서 시트의 몇 번째 행인지 확인
    let chaIdx = null;
    for (let i = 0; i < chaRecords.length; i++) {
      if ('' + userId === '' + chaRecords[i]['아이디']) {
        chaIdx = i;
        break;
      }
    }
    // 메시지를 보낸 유저의 아이디를 읽어서 시트의 몇 번째 행인지 확인 끝

    //각 항목 읽기 시작
    let chaName = chaRecords[chaIdx]['이름']
    if (chaName === undefined || chaName === '') {
      content = '이름 공란';
      return { 'code': -1, 'content': content }
    } //이름 끝

    let allPkm = chaRecords[chaIdx]['포켓몬'] //포켓몬 열 읽기    
    let allPkmObjs = JSON.parse(allPkm)
    let pokemonStr = ''
    for (let i = 0; i < allPkmObjs.length; i++) {
      let pokeBase = ''
      //볼 종류 이모지로 변환
      let ballEmoji;
      switch (allPkmObjs[i]['볼']) {
        case "몬스터볼":
          ballEmoji = "<:pokeball:1158350172858892358>";
          break;
        case "슈퍼볼":
          ballEmoji = "<:superball:1161877293363376178>";
          break;
        case "하이퍼볼":
          ballEmoji = "<:hyperball:1161877368135225344>";
          break;
        case "마스터볼":
          ballEmoji = "<:masterball:1161877493914026088>";
          break;
        case "레벨볼":
          ballEmoji = "<:levelball:1161877610901536788>";
          break;
        case "문볼":
          ballEmoji = "<:moonball:1161877863692238928>";
          break;
        case "루어볼":
          ballEmoji = "<:lureball:1161877954729623652>";
          break;
        case "프렌드볼":
          ballEmoji = "<:friendball:1161878044777123850>";
          break;
        case "러브러브볼":
          ballEmoji = "<:loveloveball:1161878139069268068>";
          break;
        case "스피드볼":
          ballEmoji = "<:speedball:1161878239552217118>";
          break;
        case "헤비볼":
          ballEmoji = "<:heavyball:1161878319176896572>";
          break;
        case "프리미어볼":
          ballEmoji = "<:premierball:1161878692776124416>";
          break;
        case "네트볼":
          ballEmoji = "<:netball:1161878770316222516>";
          break;
        case "네스트볼":
          ballEmoji = "<:nestball:1161878866969767947>";
          break;
        case "리피트볼":
          ballEmoji = "<:repeatball:1161879020519030906>";
          break;
        case "타이머볼":
          ballEmoji = "<:timerball:1161879114651807767>";
          break;
        case "럭셔리볼":
          ballEmoji = "<:luxuryball:1161879191969599499>";
          break;
        case "다이브볼":
          ballEmoji = "<:diveball:1161879279521505391>";
          break;
        case "힐볼":
          ballEmoji = "<:healball:1161879369556439111>";
          break;
        case "퀵볼":
          ballEmoji = "<:quickball:1161879454293971044>";
          break;
        case "다크볼":
          ballEmoji = "<:darkball:1161879536498131024>";
          break;
      }//볼 종류 이모지로 변환 끝
      if (allPkmObjs[i]['파티'] === 'true') {//지닌 포켓몬
        if (allPkmObjs[i]['이름'].toString().trim() !== allPkmObjs[i]['종류'].toString().trim()) { pokeBase = '(' + allPkmObjs[i]['종류'] + ')' }
        pokemonStr += `${ballEmoji}` + allPkmObjs[i]['이름'] + `${pokeBase}` + ': Lv. ' + allPkmObjs[i]['레벨'] + ' | 경험치: ' + allPkmObjs[i]['경험치'] + ',\n'
      }
    }
    pokemonStr = pokemonStr.slice(0, -2)

    if (allPkm === undefined || allPkm === '') {
      content = '포켓몬 공란';
      return { 'code': -1, 'content': content }
    } //포켓몬 끝

    //임베드 만들기
    const boxEmbed = {
      color: 0x5A95F5,
      title: `:: ${chaName}의 PC`,
      fields: [
        {
          name: ':ballot_box_with_check:지닌 포켓몬',
          value: pokemonStr,
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: '시즌 0. 담청의 파도',
        icon_url: 'https://cdn.discordapp.com/attachments/1158755179823378523/1185900135943770242/bot_p.png',
      },
    };

    //박스 페이지네이션
    let array = JSON.parse(boxPokemonStr);
    array = array.filter(item => item.파티 === false); //파티 false만

    let i, j, boxPkmArray, chunk = 5;
    for (i = 0, j = allPkmObjs.length; i < j; boxPkmIndex += chunk) {
      boxPkmArray = allPkmObjs.slice(i, i + chunk);
      if (i == 0 ){
        content = { embeds: [boxEmbed] }
      } else {
        let boxPkmEmbed = new Discord.MessageEmbed()
        .setTitle(':computer:박스 ' + (i / chunk + 1))
          .setColor('#5A95F5');
        for (let item of tempArray) {//볼 종류 이모지로 변환
          let ballEmoji;
          switch (item.볼) {
            case "몬스터볼":
              ballEmoji = "<:pokeball:1158350172858892358>";
              break;
            case "슈퍼볼":
              ballEmoji = "<:superball:1161877293363376178>";
              break;
            case "하이퍼볼":
              ballEmoji = "<:hyperball:1161877368135225344>";
              break;
            case "마스터볼":
              ballEmoji = "<:masterball:1161877493914026088>";
              break;
            case "레벨볼":
              ballEmoji = "<:levelball:1161877610901536788>";
              break;
            case "문볼":
              ballEmoji = "<:moonball:1161877863692238928>";
              break;
            case "루어볼":
              ballEmoji = "<:lureball:1161877954729623652>";
              break;
            case "프렌드볼":
              ballEmoji = "<:friendball:1161878044777123850>";
              break;
            case "러브러브볼":
              ballEmoji = "<:loveloveball:1161878139069268068>";
              break;
            case "스피드볼":
              ballEmoji = "<:speedball:1161878239552217118>";
              break;
            case "헤비볼":
              ballEmoji = "<:heavyball:1161878319176896572>";
              break;
            case "프리미어볼":
              ballEmoji = "<:premierball:1161878692776124416>";
              break;
            case "네트볼":
              ballEmoji = "<:netball:1161878770316222516>";
              break;
            case "네스트볼":
              ballEmoji = "<:nestball:1161878866969767947>";
              break;
            case "리피트볼":
              ballEmoji = "<:repeatball:1161879020519030906>";
              break;
            case "타이머볼":
              ballEmoji = "<:timerball:1161879114651807767>";
              break;
            case "럭셔리볼":
              ballEmoji = "<:luxuryball:1161879191969599499>";
              break;
            case "다이브볼":
              ballEmoji = "<:diveball:1161879279521505391>";
              break;
            case "힐볼":
              ballEmoji = "<:healball:1161879369556439111>";
              break;
            case "퀵볼":
              ballEmoji = "<:quickball:1161879454293971044>";
              break;
            case "다크볼":
              ballEmoji = "<:darkball:1161879536498131024>";
              break;
          }//볼 종류 이모지로 변환 끝
          embed.addField(`${ballEmoji}` + item.이름 + '(' + item.종류 + ': Lv. ' + item.레벨 + ' | 경험치: ' + item.경험치);
        }
        content = { embeds: [boxPkmEmbed] };

      }

    }


    content = { embeds: [boxEmbed] };


    let pkmLvSum = 0;

    for (let pkm of allPkmObjs) {
      if (pkm["파티"] === "true") {
        pkmLvSum += pkm["레벨"];
      }
    }

    let chaNowMaxHp = pkmLvSum * 6;
    console.log('chaNowMaxHp:', chaNowMaxHp)

    let chaNowHp = parseInt(chaRecords[chaIdx]['현재 체력'])
    if (chaNowHp > chaNowMaxHp) {
      chaNowHp = chaNowMaxHp
    }

    updateData['캐릭터'] = { ['E' + (chaIdx + 3)]: chaNowMaxHp, ['F' + (chaIdx + 3)]: chaNowHp }
    chaRecords[chaIdx]['최대 체력'] = chaNowMaxHp // 캐릭터 최대체력 업데이트
    chaRecords[chaIdx]['현재 체력'] = chaNowHp // 캐릭터 현재체력 업데이트

    return { 'code': 0, 'content': content, 'updateData': updateData, 'sheetRecords': sheetRecords }

  } catch (e) {
    //에러 처리
    const content =
      `doTest 에러. 메시지를 캡처해 서버장에게 문의해 주세요. \nname:${e.name}\nmessage:${e.message}\nstack:${e.stack}`
    return { 'code': -1, 'content': content }
  }
}

module.exports = {
  doTest,
};