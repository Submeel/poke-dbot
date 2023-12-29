const SpreadsheetDataHandler = require('../sheet.js');
const {addItem} = require('../userItem.js');
const {getPostposition} = require('../getPostposition.js');
const _ = require('lodash');

function doRooting(item, userId) {
  try {
    console.log('doRooting 시작::')
    const dataHandler = SpreadsheetDataHandler.getInstance();
    let sheetRecords = _.cloneDeep(dataHandler.sheetRecords);
    const itemRecords = sheetRecords['아이템']
    const chaRecords = sheetRecords['캐릭터']
    let content = null;
    let updateData = {};

    // 임베드
    const rootingEmbed = {
      title: `[획득:: ${item}]`,
      color: 0x47CE49,
    };

    // 1. 획득하려는 아이템이 db에 실존하는지 확인
    let itemIdx = null
    for(let i=0; i < itemRecords.length; i++){
      if (itemRecords[i]['아이템명'].trim() === item.trim()){
        itemIdx = i
        break
      }
    }

    //1-1. 아이템이 db에 없을 경우
    if(itemIdx === null){
      content = `${item} :: 올바른 아이템 이름이 아닙니다!`;
      return { 'code': -1, 'content': content }
    }

    // 아이템 카테고리 칼럼
    let updateCategoryCol = {'회복': 'H', '볼' : 'I', '나무열매' : 'J', '도구' : 'K', '중요한물건' : 'L'}
    
    // 2. 소지품 카테고리에 맞춰서 추가
    let category = itemRecords[itemIdx]['카테고리']

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

    let addReturn = addItem(item, userItems)
    if (addReturn['code'] !== 0){
      return addReturn
    }

    let userItemsAdd = addReturn['content']
    chaRecords[chaIdx][category] = userItemsAdd
    updateData['캐릭터'] = { [updateCategoryCol[category] + (chaIdx + 3)]: userItemsAdd }

    let itemP = getPostposition(item, '을', '를'); 
    rootingEmbed.description = `${itemP} 획득했다!`
    content = { embeds: [rootingEmbed] };

    return { 'code': 0, 'content': content, 'updateData': updateData, 'sheetRecords': sheetRecords}

  } catch (e) {
    //에러 처리
    const content =
      `doRooting 에러. 메시지를 캡처해 서버장에게 문의해 주세요. \nname:${e.name}\nmessage:${e.message}\nstack:${e.stack}`
    return { 'code': -1, 'content': content }
  }
}

module.exports = {
  doRooting,
};