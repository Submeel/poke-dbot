const SpreadsheetDataHandler = require('../sheet.js');
const { minusItem } = require('../userItem.js');
const { addItem } = require('../userItem.js');
const { getPostposition } = require('../getPostposition.js');
const _ = require('lodash');

function doGacha(userId) {
  try {
    console.log('doGacha 시작::')
    // 1. 시트 받아오기
    const dataHandler = SpreadsheetDataHandler.getInstance();
    let sheetRecords = _.cloneDeep(dataHandler.sheetRecords);
    const chaRecords = sheetRecords['캐릭터']
    const itemRecords = sheetRecords['아이템']
    const gachaRecords = sheetRecords['가챠']
    let content = null;
    let updateData = {};

    // 2. 명령어를 입력한 유저의 아이디 판별
    let chaIdx = null; //캐릭터 찾기
    for (let i = 0; i < chaRecords.length; i++) {
      if ('' + userId === '' + chaRecords[i]['아이디']) {
        chaIdx = i;
        break;
      }
    }

    // 유실물 확인
    let item = '포켓몬의 유실물'
    let lostIdx = null
    for (let i = 0; i < itemRecords.length; i++) {
      if (itemRecords[i]['아이템명'].trim() === item.trim()) {
        lostIdx = i
        break
      }
    }

    let userToolItems = chaRecords[chaIdx]['도구']
    let minusReturn = minusItem(item, userToolItems) //유실물 하나 납품
    if (minusReturn['code'] !== 0) {
      return minusReturn
    }

    // 가중치에 따른 아이템 하나 뽑기
    let totalWeight = 0;
    for (let i = 0; i < gachaRecords.length; i++) {
      totalWeight += parseInt(gachaRecords[i]['가중치'])
      }

    let pickWeight = Math.floor(Math.random() * totalWeight);
    
    console.log('totalWeight:', totalWeight)
    console.log('pickWeight:', pickWeight)

    let tmpWeight = 0;
    let pickIdx = null;
    for (let i = 0; i < gachaRecords.length; i++) {
      tmpWeight += parseInt(gachaRecords[i]['가중치'])
      console.log('지나가는 가중치들:', gachaRecords[i]['가중치'])
      if (tmpWeight >= pickWeight) {
        pickIdx = i
        break;
      }
    }
    console.log('tmpWeight:', tmpWeight)
    console.log('pickIdx:', pickIdx)
    console.log(gachaRecords[pickIdx]['아이템'])
    let gacha = gachaRecords[pickIdx]['아이템']

    // 해당 아이템의 카테고리 확인
    let itemIdx = null
    for (let i = 0; i < itemRecords.length; i++) {
      if (itemRecords[i]['아이템명'].trim() === gacha.trim()) {
        itemIdx = i
        break
      }
    }

    let updateCategoryCol = { '회복': 'H', '볼': 'I', '나무열매': 'J', '도구': 'K', '중요한물건': 'L' }
    let category = itemRecords[itemIdx]['카테고리']

    // 유저 인벤에 넣어주기
    let userItems = chaRecords[chaIdx][category]

    let addReturn = addItem(gacha, userItems)
    if (addReturn['code'] !== 0) {
      return addReturn
    }

    let userItemsMinus = minusReturn['content']
    let userItemsAdd = addReturn['content']
    chaRecords[chaIdx]['도구'] = userItemsMinus
    chaRecords[chaIdx][category] = userItemsAdd
    updateData['캐릭터'] = { ['K' + (chaIdx + 3)]: userItemsMinus, [updateCategoryCol[category] + (chaIdx + 3)]: userItemsAdd }


    //임베드 만들기    
    const sellEmbed = {
      title: `[납품::]`,
      color: 0x5A95F5,
    };

    let gachaP = getPostposition(gacha, '을', '를')
    let sellDesc = `연구를 도와준 답례로 ${gachaP} 받았다!`
    sellEmbed.description = `${sellDesc}`
    content = { embeds: [sellEmbed] };

    return { 'code': 0, 'content': content, 'updateData': updateData, 'sheetRecords': sheetRecords }


  } catch (e) {
    //에러 처리
    const content =
      `doGacha 에러. 메시지를 캡처해 서버장에게 문의해 주세요. \nname:${e.name}\nmessage:${e.message}\nstack:${e.stack}`
    return { 'code': -1, 'content': content }
  }
}

module.exports = {
  doGacha,
};