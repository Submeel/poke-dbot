const SpreadsheetDataHandler = require('../sheet.js');
const _ = require('lodash');
const { EmbedBuilder } = require('discord.js');

function doProfile(userId, userPic) {
  try {
    console.log('doProfile 시작::')
    const dataHandler = SpreadsheetDataHandler.getInstance();
    let sheetRecords = _.cloneDeep(dataHandler.sheetRecords);
    const chaRecords = sheetRecords['캐릭터']
    console.log(chaRecords)
    let content = null; 

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
    let chaMaxHp = chaRecords[chaIdx]['최대 체력']
    if (chaMaxHp === undefined || chaMaxHp === '') {
      content = '최대 체력 공란';
      return { 'code': -1, 'content': content }
    } //최대 체력 끝
    let chaNowHp = chaRecords[chaIdx]['현재 체력']
    if (chaNowHp === undefined || chaNowHp === '') {
      content = '현재 체력 공란';
      return { 'code': -1, 'content': content }
    } //현재 체력 끝
    let totalExp = chaRecords[chaIdx]['누적 경험치']
    if (totalExp === undefined || totalExp === '') {
      content = '누적 경험치 공란';
      return { 'code': -1, 'content': content }
    } //누적 경험치 끝
    let nowExp = chaRecords[chaIdx]['경험치']
    if (nowExp === undefined || nowExp === '') {
      content = '경험치 공란';
      return { 'code': -1, 'content': content }
    } //경험치 끝
    let chaMoney = chaRecords[chaIdx]['소지금']
    if (chaMoney === undefined || chaMoney === '') {
      content = '소지금 공란';
      return { 'code': -1, 'content': content }
    } //소지금 끝
    let chaFrom = chaRecords[chaIdx]['출신지']
    if (chaFrom === undefined || chaFrom === '') {
      content = '출신지 공란';
      return { 'code': -1, 'content': content }
    } //캐릭터 출신지 끝
    let chaDiscordProfile = chaRecords[chaIdx]['프로필']
    if (chaDiscordProfile === undefined || chaDiscordProfile === '') {
      content = '프로필 공란';
      return { 'code': -1, 'content': content }
    } //프로필 링크 불러오기 끝

    //가방
    let inPotion = chaRecords[chaIdx]['회복']
    if (inPotion === undefined || inPotion === '') {
      invPotion = '없음';
    }
    let inBall = chaRecords[chaIdx]['볼']
    if (inBall === undefined || inBall === '') {
      inBall = '없음';
    }
    let inBerry = chaRecords[chaIdx]['나무열매']
    if (inBerry === undefined || inBerry === '') {
      inBerry = '없음';
    }
    let inTool = chaRecords[chaIdx]['도구']
    if (inTool === undefined || inTool === '') {
      inTool = '없음';
    }
    let inImp = chaRecords[chaIdx]['중요한물건']
    if (inImp === undefined || inImp === '') {
      inImp = '없음';
    } 
    //가방 뒤적 끝

    let allPkm = chaRecords[chaIdx]['포켓몬'] //포켓몬 열 읽기
    let allPkmObjs = JSON.parse(allPkm) //포켓몬 열을 JSON으로 바뀐다=pase
    let pokemonStr = ''
    
    
    for (let i=0; i < allPkmObjs.length ; i++){
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
      if (allPkmObjs[i]['파티'] === 'true') {
        if (allPkmObjs[i]['이름'].toString().trim() !== allPkmObjs[i]['종류'].toString().trim()) { pokeBase = '(' + allPkmObjs[i]['종류'] + ') ' } 
        pokemonStr += `${ballEmoji}`+ allPkmObjs[i]['이름'] + `(${pokeBase}` + 'Lv. ' + allPkmObjs[i]['레벨'] + ')' + ', '
      }
    }
    pokemonStr = pokemonStr.slice(0, -2)

    if (allPkm === undefined || allPkm === '') {
      content = '포켓몬 공란';
      return { 'code': -1, 'content': content }
    } //데리고 있는 포켓몬 끝

    //HP바 모양 만들기
    function createProgressBar(total, current) {
      const barLength = 20; //바 길이를 20칸으로
      const progress = Math.round((current / total) * barLength);
      const progressBar = '▰'.repeat(progress) + '▱'.repeat(barLength - progress);
      return `\`${progressBar}\``; // 00% 넣고싶으면 ${Math.round((current / total) * 100)}% 추가하면 됨
    }
    let hpProgressBar = createProgressBar(chaMaxHp, chaNowHp);
    //HP바 모양 만들기 종료

    //임베드 만들기
    const profileEmbed = {
      color: 0x5A95F5,
      title: `${chaFrom} ${chaName}의 트레이너 카드`, 
      url: `${chaDiscordProfile}`,       
      // thumbnail: {
      //   url: 'https://cdn.discordapp.com/attachments/1167127549990666331/1169657956422402058/null.png',
      // }, 
      description: 
        `\n### 체력 \n **HP** ${hpProgressBar}\n\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800[ ${chaNowHp} / ${chaMaxHp} ]
        **경험치** \n **잔여 경험치** [ ${nowExp} ]  / **누적 경험치** [ ${totalExp} ] 
        \n\u2015\u2015\u2015\u2015\u2015\n### 가방`, 	
      fields: [
        // 가방 내용 , 소지금 
        {
          name: '<:icon1:1168875710933381160> 회복',
          value: `${inPotion}`,
          inline: true,
        },
        {
          name: '<:icon2:1168875725621833738> 볼',
          value: `${inBall}`,
          inline: true,
        },
        {
          name: '<:icon3:1168875739555315772> 나무열매',
          value: `${inBerry}`,
          inline: true,
        },
        {
          name: '<:icon4:1168875753643970690> 도구',
          value: `${inTool}`,
          inline: true,
        },
        {
          name: '<:icon5:1168875770605731840> 중요한 물건',
          value: `${inImp}`,
          inline: true,
        },
        {
          name: '소지금',
          value: `${chaMoney} 원`,
          inline: true,
        },
        // 포켓몬
        {
          name: '\u200b',
          value: '\u2015\u2015\u2015\u2015\u2015\n\u200b',
          inline: false,
        },
        {
          name: '포켓몬',
          value: pokemonStr,
          inline: false,
        },
        {
          name: '\u200b',
          value: '\u2015\u2015\u2015\u2015\u2015\n\u200b',
          inline: false,
        },
        // // 배지같은거?
        // {
        //   name: '콜렉팅',
        //   value: '콘텐츠 추가 이후에 이 항목 넣어야 함',
        //   inline: false,
        // },
        // {
        //   name: '\u200b',
        //   value: '\u200b',
        //   inline: false,
        // },
        ],
          timestamp: new Date().toISOString(),
          footer: {
            text: '시즌 0. 담청의 파도 :: 트레이너 카드',
            icon_url: 'https://cdn.discordapp.com/attachments/1158755179823378523/1185900135943770242/bot_p.png',
          },
};
    content = { embeds: [profileEmbed] };

    return { 'code': 0, 'content': content }

  } catch (e) {
    //에러 처리
    const content =
      `doProfile 에러. 메시지를 캡처해 서버장에게 문의해 주세요. \nname:${e.name}\nmessage:${e.message}\nstack:${e.stack}`
    return { 'code': -1, 'content': content }
  }
}

module.exports = {
  doProfile,
};