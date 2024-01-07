const SpreadsheetDataHandler = require('../sheet.js');
const { minusItem } = require('../userItem.js');
const { getPostposition } = require('../getPostposition.js');
const _ = require('lodash');

function doSell(item, amount, userId) {
  try {
    console.log('doSell 시작::')    
    // 1. 캐릭터 시트 + 판매 중인 아이템 시트 받아오기
    const dataHandler = SpreadsheetDataHandler.getInstance();
    let sheetRecords = _.cloneDeep(dataHandler.sheetRecords);
    const chaRecords = sheetRecords['캐릭터']
    const itemRecords = sheetRecords['아이템']
    let content = null;
    let updateData = {};
    //임베드 만들기    
    const sellEmbed = {
      title: `[판매:: ${item}]`,
      color: 0xC10303,
    };

    // 2. 명령어를 입력한 유저의 아이디 판별
    let chaIdx = null; //캐릭터 찾기
    for (let i = 0; i < chaRecords.length; i++) {
      if ('' + userId === '' + chaRecords[i]['아이디']) {
        chaIdx = i;
        break;
      }
    }

    let chaMoney = chaRecords[chaIdx]['소지금'] //유저 소지금
    console.log('판매 전 소지금:' + chaMoney)
    

    // 3. 유저가 입력한 아이템이 존재하는 아이템인지 확인
    let itemIdx = null
    for (let i = 0; i < itemRecords.length; i++) {
      if (itemRecords[i]['아이템명'].trim() === item.trim()) {
        itemIdx = i
        break        
      }
    }
    if (itemIdx === null) { //아이템이 db에 없을 경우
      content = `${item} :: 올바른 아이템 이름이 아닙니다!`;
      return { 'code': -1, 'content': content }
    }    

    if (isNaN(itemRecords[itemIdx]['판매가']) === true ) { //아이템의 판매가가 숫자가 아닐 경우
      content = `${item} :: 상점에서 취급하지 않는 아이템입니다!`;
      return { 'code': -1, 'content': content }
    }  


    let updateCategoryCol = { '회복': 'H', '볼': 'I', '나무열매': 'J', '도구': 'K', '중요한물건': 'L' } // 아이템 카테고리 칼럼
    let category = itemRecords[itemIdx]['카테고리'] //소지품 카테고리에 맞춰서 추가
    let userItems = chaRecords[chaIdx][category] //유저가 판매하고자 하는 아이템이 소속된 셀 문자열 
    let salePrice = itemRecords[itemIdx]['판매가']
    let price = null;
    if (amount === null || amount === undefined || amount === ''){
      amount = 1
      price = salePrice
    }else {
      price = parseInt(salePrice) * parseInt(amount)
    }
    
    // 4.amount > 가지고있는 아이템 개수 = '아이템이 부족합니다. 판매가 취소되었습니다.'
    let chaItemArray = null;
    if (userItems === null || userItems === undefined || userItems === '') {
      const content = '소지품이 부족합니다.'
      return { 'code': -1, 'content': content }
    } else {
      chaItemArray = userItems.split(',')
    } 
    let remainItem = null;
    for (let i = 0; i < chaItemArray.length; i++) {
      let findIdx = chaItemArray[i].trim().indexOf(item.trim())
      if (findIdx === 0) {
        remainItem = chaItemArray[i].trim().slice(item.length)
      }
    }
    if (parseInt(remainItem) < parseInt(amount)){
      content = `${item} :: 아이템이 부족합니다! 판매가 취소되었습니다.`;
      return { 'code': -1, 'content': content }
    }

    let minusItemCnt = parseInt(remainItem) - parseInt(amount)
    if (minusItemCnt === 0) {
      chaItemArray.splice(i, 1)
    } else {
      chaItemArray[i] = item + ' ' + minusItemCnt
    }
    let resultStr = ''
    for (let i = 0; i < chaItemArray.length; i++) {
      resultStr += ', ' + chaItemArray[i].trim()
    }
    resultStr = resultStr.slice(2) //순회하며 다시 넣기


    // 5. 판매 승인 로직
			// 1. 유저의 '소지금'+ price = 최종 유저의 '소지금'
    chaMoney = parseInt(chaMoney) + parseInt(price)
			// 2. 유저의 item의 수량-amount = 최종 유저의 item 수량
    // let minusReturn = null;
    // for (let i = 0; i <= amount; i++) {
    //   minusReturn = minusItem(item, userItems)
    //   }    
    // if (minusReturn['code'] !== 0) {
    //   return minusReturn
    // }

    let userItemsMinus = minusReturn['content']
    updateData['캐릭터'] = { [updateCategoryCol[category] + (chaIdx + 3)]: resultStr, ['G' + (chaIdx + 3)]: chaMoney }
    chaRecords[chaIdx][category] = userItemsMinus
    chaRecords[chaIdx]['소지금'] = chaMoney

    let itemP = getPostposition(item, '을', '를')
    let sellDesc = `${itemP} ${amount}개 판매했습니다! \n 소지금 : \`${chaMoney} 원\``


    sellEmbed.description = `${sellDesc}`
    content = { embeds: [sellEmbed] };

    return { 'code': 0, 'content': content, 'updateData': updateData, 'sheetRecords': sheetRecords }


  } catch (e) {
    //에러 처리
    const content =
      `doSell 에러. 메시지를 캡처해 서버장에게 문의해 주세요. \nname:${e.name}\nmessage:${e.message}\nstack:${e.stack}`
    return { 'code': -1, 'content': content }
  }
}

module.exports = {
  doSell,
};