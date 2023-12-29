const SpreadsheetDataHandler = require('../sheet.js');
const { minusItem } = require('../userItem.js');
const { getPostposition } = require('../getPostposition.js');
const _ = require('lodash');

function doBall(item, userId) {
  try {
    console.log('doBall 시작::')
    const dataHandler = SpreadsheetDataHandler.getInstance();
    let sheetRecords = _.cloneDeep(dataHandler.sheetRecords);
    const itemRecords = sheetRecords['아이템']
    const chaRecords = sheetRecords['캐릭터']
    let content = null;
    let updateData = {};

    let name = null;
    for (let i = 0; i < chaRecords.length; i++) {
      if ('' + userId === '' + chaRecords[i]['아이디']) {
        name = getPostposition(chaRecords[i]['이름'], '은', '는');
        break;
      }
    }

    // 임베드
    const ballEmbed = {
      title: `▶ ${name} ${item}을 던졌다!`,
      color: 0xFF5A5A,
      footer: {
        text: `[포획에 성공했다면 \`/추가\` 명령어로 포켓몬을 파티에 추가하자.]`,
      },
    };

    // 1. 사용하려는 아이템이 db에 실존하는지 확인
    let itemIdx = null
    let itemDesc = null
    for (let i = 0; i < itemRecords.length; i++) {
      if (itemRecords[i]['아이템명'].trim() === item.trim()) {
        itemIdx = i
        itemDesc = itemRecords[i]['설명']
        break
      }
    }

    //1-1. 아이템이 db에 없을 경우
    if (itemIdx === null) {
      content = `${item} :: 올바른 아이템 이름이 아닙니다!`;
      return { 'code': -1, 'content': content }
    }

    // 아이템 카테고리 칼럼
    let updateCategoryCol = { '회복': 'H', '볼': 'I', '나무열매': 'J', '도구': 'K', '중요한물건': 'L' }    

    // 2. 소지품 카테고리에 맞춰서 추가
    let category = itemRecords[itemIdx]['카테고리']
    if (category !== '볼') {
      console.log('현재 지정된 카테고리', category)
      content = `${item} :: 카테고리가 [볼]인 아이템만 사용 가능합니다!`;
      return { 'code': -1, 'content': content }
    }

    let chaIdx = null; //캐릭터 찾기
    for (let i = 0; i < chaRecords.length; i++) {
      if ('' + userId === '' + chaRecords[i]['아이디']) {
        chaIdx = i;
        break;
      }
    }

    if (chaIdx === null) {
      content = '스프레드 시트에 정보가 존재하지 않습니다!'; //나중에 다시보기
      return { 'code': -1, 'content': content }
    }


    let userItems = chaRecords[chaIdx][category]

    let minusReturn = minusItem(item, userItems)
    if (minusReturn['code'] !== 0) {
      return minusReturn
    }

    let userItemsMinus = minusReturn['content']
    chaRecords[chaIdx][category] = userItemsMinus
    updateData['캐릭터'] = { [updateCategoryCol[category] + (chaIdx + 3)]: userItemsMinus }
    
    //주사위 굴리기
    let diceSum = 0;
    let diceArray = [];
    for (let i = 0; i < 3; i++) {
      let tmpDice = Math.floor(Math.random() * 6) + 1;
      diceSum = diceSum + tmpDice
      diceArray.push(tmpDice);
    }
    let dice = `\n▶굴림: [${diceArray}]   ▶결과: ${diceSum}`
    //주사위 굴리기 끝

    let MainDesc = `**${item}** : \`${itemDesc}\`\n……\n${dice}`


    ballEmbed.description = `${MainDesc}` 
    content = { embeds: [ballEmbed] };

    return { 'code': 0, 'content': content, 'updateData': updateData, 'sheetRecords': sheetRecords }


  } catch (e) {
    //에러 처리
    const content =
      `doBall 에러. 메시지를 캡처해 서버장에게 문의해 주세요. \nname:${e.name}\nmessage:${e.message}\nstack:${e.stack}`
    return { 'code': -1, 'content': content }
  }
}

module.exports = {
  doBall,
};