const SpreadsheetDataHandler = require('../sheet.js');
const { minusItem } = require('../userItem.js');
const { addItem } = require('../userItem.js');
const { getPostposition } = require('../getPostposition.js');
const _ = require('lodash');

function doGift(toUserId , money, item, userId) {
  try {
    console.log('doGift 시작::')
    const dataHandler = SpreadsheetDataHandler.getInstance();
    let sheetRecords = _.cloneDeep(dataHandler.sheetRecords);
    const itemRecords = sheetRecords['아이템']
    const chaRecords = sheetRecords['캐릭터']
    let content = null;
    let updateData = {};

    // 임베드
    const useEmbed = {
      title: `[선물:: ${item}]`,
      color: 0xC10303,
    };

    // 1. 선물하려는 아이템이 db에 실존하는지 확인
    let itemIdx = null
    for (let i = 0; i < itemRecords.length; i++) {
      if (itemRecords[i]['아이템명'].trim() === item.trim()) {
        itemIdx = i
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

    let chaIdx = null; //선물 선언한 캐릭터 찾기
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
    let itemP = getPostposition(item, '을', '를');
    let MainDesc = `${itemP} 사용했다!`


    // 사용시 스탯 증감이 있는 경우 + 누적 경험치
    if (itemRecords[itemIdx]['스탯'].trim() === '경험치' || itemRecords[itemIdx]['스탯'].trim() === '체력') {
      if (itemRecords[itemIdx]['증가'] === null || itemRecords[itemIdx]['증가'] === undefined || itemRecords[itemIdx]['증가'] === '') {
        content = '스프레드 시트에 증감치 정보가 존재하지 않습니다! 서버장에게 문의해 주세요.'; //나중에 다시보기
        return { 'code': -1, 'content': content }
      }

      let statName = '경험치'
      let updateCol = 'D'
      if (itemRecords[itemIdx]['스탯'].trim() === '체력') {
        statName = '현재 체력'
        updateCol = 'F'
      }

      // statName이 '현재 체력'일 경우 증가값이 최대 체력을 넘지 못하게
      let increase = parseInt(itemRecords[itemIdx]['증가'])
      let asIs = parseInt(chaRecords[chaIdx][statName])
      let toBe = asIs + increase
      if (statName === '현재 체력') {
        let maxHp = chaRecords[chaIdx]['최대 체력']
        if (maxHp < toBe) {
          toBe = maxHp
        }
      }

      // statName이 '경험치'일 경우 '누적 경험치' 갱신
      let totalExp = parseInt(chaRecords[chaIdx]['누적 경험치'])
      if (statName === '경험치') {
        totalExp = parseInt(totalExp + increase)
        chaRecords[chaIdx]['누적 경험치'] = totalExp
      }

      chaRecords[chaIdx][statName] = toBe

      updateData['캐릭터'] = { [updateCategoryCol[category] + (chaIdx + 3)]: userItemsMinus, [updateCol + (chaIdx + 3)]: toBe, ['C' + (chaIdx + 3)]: totalExp }
    }

    // 체력이 더해지는 아이템일 경우
    let hpDesc = ''
    if (itemRecords[itemIdx]['스탯'].trim() === '체력') {
      let name = null;
      for (let i = 0; i < chaRecords.length; i++) {
        if ('' + userId === '' + chaRecords[i]['아이디']) {
          name = chaRecords[i]['이름'];
          break;
        }
      }
      hpDesc = `\nHP가 ${itemRecords[itemIdx]['증가']}만큼 회복되었다! \n ▶${name}의 현재 HP : ${chaRecords[chaIdx]['현재 체력']}`
    }

    // 경험치가 더해지는 아이템일 경우
    let expDesc = ''
    if (itemRecords[itemIdx]['스탯'].trim() === '경험치') {
      let name = null;
      for (let i = 0; i < chaRecords.length; i++) {
        if ('' + userId === '' + chaRecords[i]['아이디']) {
          name = chaRecords[i]['이름'];
          break;
        }
      }
      expDesc = `\n경험치가 ${itemRecords[itemIdx]['증가']}만큼 증가했다! \n ▶${name}의 현재 경험치 : ${chaRecords[chaIdx]['경험치']}`
    }


    useEmbed.description = `${MainDesc}` + `${hpDesc}` + `${expDesc}`
    content = { embeds: [useEmbed] };

    return { 'code': 0, 'content': content, 'updateData': updateData, 'sheetRecords': sheetRecords }


  } catch (e) {
    //에러 처리
    const content =
      `doGift 에러. 메시지를 캡처해 서버장에게 문의해 주세요. \nname:${e.name}\nmessage:${e.message}\nstack:${e.stack}`
    return { 'code': -1, 'content': content }
  }
}

module.exports = {
  doGift,
};