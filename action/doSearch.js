const SpreadsheetDataHandler = require('../sheet.js');
const _ = require('lodash'); //시트 데이터 가져오는 코드

// 은는이가 코드 시작
function getPostposition(word, first, second) {
  const lastChar = word[word.length - 1];
  const lastCharCode = lastChar.charCodeAt(0);

  if (lastCharCode < 0xAC00 || lastCharCode > 0xD7A3) {
    return word + first;
  }

  const finalConsonant = (lastCharCode - 0xAC00) % 28;

  if (finalConsonant === 0) {
    return word + second;
  }

  return word + first;
}
//은는이가 코드 종료

function doSearch(target, userId) {
  try {
    console.log('doSearch 시작::')
    const dataHandler = SpreadsheetDataHandler.getInstance();
    let sheetRecords = _.cloneDeep(dataHandler.sheetRecords); //윗줄부터 여기까지 시트 데이터 가져오는 코드
    const pkmRecords = sheetRecords['탐색'] //전체 시트 중 '탐색'탭 시트
    const chaRecords = sheetRecords['캐릭터']
    const diceRoll = Math.floor(Math.random() * 100) + 1; //포켓몬 등장 확률 비교용 난수
    let wantedPkmName = null; //target이 시트에 있는 포켓몬이다
    let chaIdx = null;
    let content = null;
    

    for (let i = 0; i < chaRecords.length; i++) {
      if ('' + userId === '' + chaRecords[i]['아이디']) {
        chaIdx = i;
        break;
      }
    }

    if (chaIdx === null) {
      content = '스프레드시트에 캐릭터 정보가 존재하지 않습니다!';
      return { 'code': -1, 'content': content };
    }

    let count = chaRecords[chaIdx]['탐색횟수'] || 0;
    count = parseInt(count)
  
    if (count >= 5) {
      content = '*▶오늘의 탐색이 종료되었다. 내일 다시 오자!*';
      return { 'code': -1, 'content': content };
    }

    const updateData = {
      '캐릭터': { ['S' + (chaIdx + 3)]: count + 1 }
    };
    chaRecords[chaIdx]['탐색횟수'] = count + 1

    for (let i = 0; i < pkmRecords.length; i++) {
      if ('' + target === '' + pkmRecords[i]['이름']) {
        wantedPkmName = pkmRecords[i]['이름'];
        break;
      }
    }
    let pkmProbability = null; //wantedPkmName이 등장할 확률
    for (let i = 0; i < pkmRecords.length; i++) {
      if ('' + target === '' + pkmRecords[i]['이름']) {
        pkmProbability = pkmRecords[i]['확률'];
        break;
      }
    }

    console.log(diceRoll)
    console.log(wantedPkmName)

    // 임베드
    const searchEmbed = {
      title: `[탐색:: ${target}]`,
      color: 0x5A95F5,
      footer: {
        text: `:: 일일 탐색 횟수 [ ${count + 1} / 5 ]회`,
      },
    };
    //임베드 끝 
    if (target.trim() === '포켓몬') {
      const randomIdx = Math.floor(Math.random() * pkmRecords.length);
      let randomPkmName = pkmRecords[randomIdx]['이름'];
      let pkm = getPostposition(randomPkmName, '이', '가');
      searchEmbed.description = `앗! 야생 ${pkm} 튀어나왔다!\n ▶\`/볼던지기 볼:&&\` ▶\`도망친다 (새로운 명령어 입력)\``
      console.log(randomIdx)
      console.log(randomPkmName)
    } else if ((diceRoll <= pkmProbability) && (target.trim() === wantedPkmName)) {
      let pkm = getPostposition(wantedPkmName, '이', '가');
      searchEmbed.description = `앗! 야생 ${pkm} 튀어나왔다!\n ▶\`/볼던지기 볼:&&\` ▶\`도망친다 (새로운 명령어 입력)\``
    } else {
      let pkm = getPostposition(target, '은', '는');
      searchEmbed.description = `어라… ${pkm} 보이지 않는다.`
    }
    content = { embeds: [searchEmbed] };
    return { 'code': 0, 'content': content, 'updateData': updateData, 'sheetRecords': sheetRecords }
    //return { 'code': 0, 'content': `${content}\n\n오늘은 ${4 - count}회 더 탐색을 진행할 수 있습니다.`, 'updateData': updateData, 'sheetRecords': sheetRecords }
  } catch (e) {
    //에러 처리
    const content =
      `doSearch 에러. 메시지를 캡처해 서버장에게 문의해 주세요. \nname:${e.name}\nmessage:${e.message}\nstack:${e.stack}`
    return { 'code': -1, 'content': content }
  }
}

module.exports = {
  doSearch,
};