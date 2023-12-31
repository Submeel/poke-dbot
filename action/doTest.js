const SpreadsheetDataHandler = require('../sheet.js');
const { minusItem } = require('../userItem.js');
const { getPostposition } = require('../getPostposition.js');
const _ = require('lodash');

function doTest(item, amount, userId) {
  try {
    console.log('doTest 시작::')
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


    // 3. 유저가 입력한 아이템이 판매중인 아이템인지 확인(for문 돌리기이)
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
    let updateCategoryCol = { '회복': 'H', '볼': 'I', '나무열매': 'J', '도구': 'K', '중요한물건': 'L' } // 아이템 카테고리 칼럼
    let category = itemRecords[itemIdx]['카테고리'] //소지품 카테고리에 맞춰서 추가
    let userItems = chaRecords[chaIdx][category] //유저가 판매하고자 하는 아이템이 소속된 셀 문자열 
    let salePrice = itemRecords[itemIdx]['판매가']
    let price = null;
    if (amount === null || amount === undefined || amount === '') {
      amount = 1
      price = salePrice
    } else {
      price = salePrice * amount
    }
    // 4. → 1차 메시지 전송`${item}:: ${amount}개 판매하시겠습니까? [ ${price}원 ]`
    let sellDesc = ``
    if (itemIdx !== null) {
      sellDesc = `${item}:: ${amount}개 판매하시겠습니까? [ ${price}원 ]`
    }
    // 1. 동시에 이모지 ✅`:white_check_mark:` ❌`:x:` 부여  

    // 2. 이모지 체크하기
    // 3. 응답시간 초과일 경우 판매 취소 
    // 5. 판매 승인 로직
    // 1. 유저의 '소지금'+ price = 최종 유저의 '소지금'
    // 2. 유저의 item의 수량-amount = 최종 유저의 item 수량
    // for (let i = 0; i <= amount; i++) {
    //   function minusItem(item, userItems)
    //   }
    // 2-1. 만약 최종 유저의 item 수량 > 0 이 된다면 그냥 아이템+수량 통째로 텍스트를 뺀 것을 최종 유저의 '아이템'으로 변환
    // 2-2. 만약 최종 유저의 item 수량 = 0 이 된다면 해당 item에 "수량"을 뺀 것을 최종 유저의 '아이템'으로 변환
    // 2-3. 그 외의 경우 (최종 유저 item의 수량 < 0 이 된다면) content = '아이템이 부족합니다. 판매가 취소되었습니다.'
    // 3. 최종 유저의 '소지금'과 최종 유저의 '아이템'을 업데이트한다


    sellEmbed.description = `${sellDesc}`
    content = { embeds: [sellEmbed] };

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