const SpreadsheetDataHandler = require('../sheet.js');
const { minusItem } = require('../userItem.js');
const { addItem } = require('../userItem.js');
const { getPostposition } = require('../getPostposition.js');
const _ = require('lodash');

function doGift(toUserId , item, userId) {
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

    let fromChaIdx = null; //선물 주는 캐릭터 찾기
    for (let i = 0; i < chaRecords.length; i++) {
      if ('' + userId === '' + chaRecords[i]['아이디']) {
        fromChaIdx = i;
        break;
      }
    }
    
    let toChaIdx = null; // 선물 받는 캐릭터 찾기
    for (let i = 0; i < chaRecords.length; i++) {
      if ('' + toUserId === '' + chaRecords[i]['아이디']) {
        toChaIdx = i;
        break;
      }
    }

    if (fromChaIdx === null || toChaIdx === null) {
      content = '스프레드 시트에 정보가 존재하지 않습니다!'; //나중에 다시보기
      return { 'code': -1, 'content': content }
    }


    let fromUserItems = chaRecords[fromChaIdx][category] //주는사람템창
    let toUserItems = chaRecords[toChaIdx][category] //받는사람템창

    let minusReturn = minusItem(item, fromUserItems)
    if (minusReturn['code'] !== 0) {
      return minusReturn
    } //주는사람에게서 템 빼기
    let fromUseItemsMinus = minusReturn['content']
    chaRecords[fromChaIdx][category] = fromUseItemsMinus 
    updateData['캐릭터'] = { [updateCategoryCol[category] + (fromChaIdx + 3)]: userItemsMinus }
    //뺀 템 업뎃 끝

    let addReturn = addItem(item, toUserItems)
    if (addReturn['code'] !== 0) {
      return addReturn    
    } //받는사람에게 템 넣기
    let userItemsAdd = addReturn['content']
    chaRecords[toChaIdx][category] = userItemsAdd
    updateData['캐릭터'] = { [updateCategoryCol[category] + (toChaIdx + 3)]: userItemsAdd }
    //더한 템 업뎃 끝
    
    let itemP = getPostposition(item, '을', '를');
    let MainDesc = `${chaRecords[toChaIdx]['이름']}에게 ${itemP} 선물했다!`

    useEmbed.description = `${MainDesc}`
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