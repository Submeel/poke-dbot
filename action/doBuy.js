const SpreadsheetDataHandler = require('../sheet.js');
const { getPostposition } = require('../getPostposition.js');
const _ = require('lodash');

function doBuy(item, amount, userId) {
  try {
    console.log('doBuy 시작::')    
    // 1. 캐릭터 시트 + 판매 중인 아이템 시트 받아오기
    const dataHandler = SpreadsheetDataHandler.getInstance();
    let sheetRecords = _.cloneDeep(dataHandler.sheetRecords);
    const chaRecords = sheetRecords['캐릭터']
    const itemRecords = sheetRecords['아이템']
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

    let chaMoney = parseInt(chaRecords[chaIdx]['소지금']) //유저 소지금
    console.log('구매 전 소지금:' + chaMoney)
    

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

    if (isNaN(itemRecords[itemIdx]['구매가']) === true ) { //아이템의 판매가가 숫자가 아닐 경우
      content = `${item} :: 상점에서 취급하지 않는 아이템입니다!`;
      return { 'code': -1, 'content': content }
    }  


    let updateCategoryCol = { '회복': 'H', '볼': 'I', '나무열매': 'J', '도구': 'K', '중요한물건': 'L' } // 아이템 카테고리 칼럼
    let category = itemRecords[itemIdx]['카테고리'] //소지품 카테고리에 맞춰서 추가
    let userItems = chaRecords[chaIdx][category] //유저가 판매하고자 하는 아이템이 소속된 셀 문자열 
    let buyPrice = itemRecords[itemIdx]['구매가']
    let price = null;
    if (amount === null || amount === undefined || amount === ''){
      amount = 1
      price = buyPrice
    }else {
      price = parseInt(buyPrice) * parseInt(amount)
    }

    // 4. price > 가지고 있는 소지금 = '소지금이 부족합니다. 판매가 취소되었습니다.'
        if (parseInt(price) > chaMoney) {
      content = `${item} :: 소지금이 부족합니다! 구매가 취소되었습니다.`;
      return { 'code': -1, 'content': content }
    } else {
      chaMoney = chaMoney - parseInt(price)
    } 

    // 아이템 더하기 로직 복붙 돌리기
    if (userItems === null || userItems === undefined || userItems === '') { // split 안함
      chaItemArray = []
    } else {
      chaItemArray = userItems.split(',')
    } 
    
    let findFlag = false
    for (let i = 0; i < chaItemArray.length; i++) {
      let findIdx = chaItemArray[i].trim().indexOf(item.trim())
      if (findIdx === 0) {
        let remainItem = chaItemArray[i].trim().slice(item.length)
        if (remainItem[0] === ' ' && isNaN(parseInt(remainItem)) === false) {
          chaItemArray[i] = item + ' ' + (parseInt(remainItem) + parseInt(amount))
          findFlag = true
          break
        }
      }
    }

    if (findFlag == false) {
      chaItemArray.push(`${item} ${amount}`)
    }

    // let resultStr = ''
    // for (let i = 0; i < chaItemArray.length; i++) {
    //   resultStr += ', ' + chaItemArray[i].trim()
    // }
    // resultStr = resultStr.slice(2)

    let bonusDesc = '';
    if(item === '몬스터볼' && amount >= 10){ //프리미어볼 amount/10 소숫점버림만큼 추가로 줌
      console.log('프리미어볼 추가 지급 시작 ::') 
      const preAmount = Math.floor(amount / 10);
      bonusDesc = `\n\`\`\`"프리미어볼 ${preAmount}개를 서비스로 드리겠습니다!"\`\`\` ` //멘트추가
      //유저아이템 복붙 시작
      let findFlag = false
      const premierBall = '프리미어볼'
      for (let i = 0; i < chaItemArray.length; i++) {
        let findIdx = chaItemArray[i].trim().indexOf(premierBall.trim())
        if (findIdx === 0) {
          let remainItem = chaItemArray[i].trim().slice(premierBall.length)
          if (remainItem[0] === ' ' && isNaN(parseInt(remainItem)) === false) {
            chaItemArray[i] = premierBall + ' ' + (parseInt(remainItem) + parseInt(preAmount))
            findFlag = true
            break
          }
        }
      }
      if (findFlag == false) {
        chaItemArray.push(`프리미어볼 ${preAmount}`)
      }
      console.log('chaItemArray', chaItemArray)
      // resultStr에 다시 돌려줌
      }   
      // // 말이쉽지
      // if (findFlag == false) {
      //   console.log('프리미어볼 새로 지급 시작 ::')
      //   chaItemArray.push(`프리미어볼 ${preAmount}`)
      // }

    let resultStr = ''
    for (let i = 0; i < chaItemArray.length; i++) {
      resultStr += ', ' + chaItemArray[i].trim()
    }
    resultStr = resultStr.slice(2)
      
      //유저아이템 복붙 끝
    
    console.log('resultStr2:', resultStr)

    updateData['캐릭터'] = { [updateCategoryCol[category] + (chaIdx + 3)]: resultStr, ['G' + (chaIdx + 3)]: chaMoney }
    chaRecords[chaIdx][category] = resultStr
    chaRecords[chaIdx]['소지금'] = chaMoney

    //임베드 만들기    
    const buyEmbed = {
      title: `[구매:: ${item}]`,
      color: 0x5A95F5,
      footer: {
        text: `▶${chaRecords[chaIdx]['이름']}의 잔여 소지금 : ${chaMoney} 원`,
      },
    };

    let itemP = getPostposition(item, '을', '를')
    let buyDesc = `${itemP} ${amount}개 구매했습니다!`
    buyEmbed.description = `${buyDesc}`+`${bonusDesc}`
    content = { embeds: [buyEmbed] };

    return { 'code': 0, 'content': content, 'updateData': updateData, 'sheetRecords': sheetRecords }


  } catch (e) {
    //에러 처리
    const content =
      `doBuy 에러. 메시지를 캡처해 서버장에게 문의해 주세요. \nname:${e.name}\nmessage:${e.message}\nstack:${e.stack}`
    return { 'code': -1, 'content': content }
  }
}

module.exports = {
  doBuy,
};