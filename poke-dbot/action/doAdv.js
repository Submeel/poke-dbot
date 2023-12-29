const SpreadsheetDataHandler = require('../sheet.js');
const { addItem } = require('../userItem.js');
const _ = require('lodash');

function doAdv(keyword, userId) {
  try {
    console.log('doAdv 시작::')
    const dataHandler = SpreadsheetDataHandler.getInstance();
    let sheetRecords = _.cloneDeep(dataHandler.sheetRecords);
    const advRecords = sheetRecords['모험']
    const chaRecords = sheetRecords['캐릭터']
    let content = null;
    let updateData = {};

    
    // 1. 유저가 명령어를 선언한다.
    let chaIdx = null;
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

    let count = chaRecords[chaIdx]['모험횟수'] || 0;
    count = parseInt(count)
  
    if (count >= 20) {
      content = '*▶오늘의 모험이 종료되었다. 내일 다시 오자!*';
      return { 'code': -1, 'content': content };
    }

    // 2. 선언된 명령어에 해당하는 행을 전부 모아온다.
    let selectIdxArray = []
    let totalWeight = 0;
    let authUserStr = null;
    for (let i = 0; i < advRecords.length; i++) {
      if (advRecords[i]['키워드'] === keyword) {
        selectIdxArray.push(i)
        totalWeight += parseInt(advRecords[i]['가중치'])
      }

      if (advRecords[i]['해금'] === keyword) {
        if (authUserStr === null) {
          authUserStr = advRecords[i]['발견자']
        } else {
          authUserStr = '/' + advRecords[i]['발견자']
        }
      }
    }

    if (selectIdxArray.length === 0) {
      content = `${keyword} :: 올바른 명령어가 아닙니다!`;
      return { 'code': -1, 'content': content }
    }

    // 2-1. 해금 조건 따지기
    if (authUserStr !== null) { //채팅 보낸 사람 아이디 확인 후, 해금 조건을 충족한 유저인지 확인/아니면 돌려보냄      
      let findFlag = false
      authUserArray = authUserStr.split('/')
      for (let i = 0; i < authUserArray.length; i++) {
        if (authUserArray[i] === '' + userId) {
          findFlag = true
          break
        }
      }

      if (findFlag === false) {
        content = `${keyword} :: 지금 이용할 수 없는 키워드입니다!`
        return { 'code': -1, 'content': content }
      }
    }

    // 3. 가중치에 따라 하나의 행을 랜덤 선택한다.
    let pickWeight = Math.floor(Math.random() * totalWeight) ;
    console.log('totalWeight:', totalWeight)
    console.log('pickWeight:', pickWeight)
    let tmpWeight = 0;
    let pickIdx = null;
    for (let i = 0; i < selectIdxArray.length; i++) {
      tmpWeight += parseInt(advRecords[selectIdxArray[i]]['가중치'])
      console.log('지나가는 가중치들:', advRecords[selectIdxArray[i]]['가중치'])
      if (tmpWeight >= pickWeight) {
        pickIdx = i
        break;
      }
    }
    console.log('selectIdxArray:', selectIdxArray)
    console.log('tmpWeight:', tmpWeight)
    console.log('pickIdx:', pickIdx) 
    console.log(advRecords[selectIdxArray[pickIdx]]['응답내용'])

    // 4. 그 행의 `응답 내용`을 보낸다

    // 임베드
    const advEmbed = {
      title: `[모험:: ${keyword}]`,
      color: 0x5A95F5,
      footer: {
        text: `:: 일일 모험 횟수 [ ${ count + 1} / 20 ]회`,
      },
    };

    updateData['캐릭터'] = { ['R' + (chaIdx + 3)]: count + 1 }
    chaRecords[chaIdx]['모험횟수'] = count + 1
    advEmbed.description = `${advRecords[selectIdxArray[pickIdx]]['응답내용']}`
    content = { embeds: [advEmbed] };

    //4-1. 배틀은 한 번 사용하면 더 사용할 수 없게 한다! (나무흔들기 등 채집 관련 명령어는 상관 없을듯 하여...)
    if ('배틀' === keyword){
      let unlockKeywordIdx = null;
      for (let i = 0; i < advRecords.length; i++) {
      if ('' + keyword === '' + advRecords[i]['해금']) {
        unlockKeywordIdx = i;
        console.log('배틀 해금 지우는 셀:', unlockKeywordIdx)
        }
      }
      console.log('레코드 행:', advRecords[unlockKeywordIdx]['발견자']) 
      //배틀 커맨드를 해금하는 레코드에 붙어있는 발견자 셀 찾기 끝

      let sendKeywordUserStr = advRecords[unlockKeywordIdx]['발견자']
      let sendKeywordUserArray = sendKeywordUserStr.split('/') 
      let unlockUserId = sendKeywordUserArray.indexOf(userId);
      if (unlockUserId !== -1) {
        sendKeywordUserArray.splice(unlockUserId, 1);
      }
      sendKeywordUserStr = sendKeywordUserArray.join('/'); 
      //유저 아이디 찾아서 하나만 빼기

      // 업데이트
      updateData['모험'] = { ['F' + (unlockKeywordIdx + 3)]: sendKeywordUserStr }
      advRecords[unlockKeywordIdx]['발견자'] = sendKeywordUserStr
    }

    // 5. 만약 `경험치`에 값이 있을 경우엔 유저의 경험치에 추가한다.
    if (advRecords[selectIdxArray[pickIdx]]['경험치'] !== '' && advRecords[selectIdxArray[pickIdx]]['경험치'] !== undefined) {
      //누적 경험치
      let totalExp = chaRecords[chaIdx]['누적 경험치']
      if (totalExp === undefined || totalExp === '') {
        content = '누적 경험치 공란';
        return { 'code': -1, 'content': content }
      }
      try {
        totalExp = parseInt(totalExp)
      } catch (e) {
        content = '시트에 숫자가 아닌 다른 것이 들어가 있습니다';
        return { 'code': -1, 'content': content }
      }

      //캐릭터 경험치
      let nowExp = chaRecords[chaIdx]['경험치']
      if (nowExp === undefined || nowExp === '') {
        content = '경험치 공란';
        return { 'code': -1, 'content': content }
      }
      try {
        nowExp = parseInt(nowExp)
      } catch (e) {
        content = '시트에 숫자가 아닌 다른 것이 들어가 있습니다';
        return { 'code': -1, 'content': content }
      }

      totalExp = totalExp + parseInt(advRecords[selectIdxArray[pickIdx]]['경험치'])
      nowExp = nowExp + parseInt(advRecords[selectIdxArray[pickIdx]]['경험치'])

      updateData['캐릭터'] = { ['C' + (chaIdx + 3)]: totalExp, ['D' + (chaIdx + 3)]: nowExp,  ['R' + (chaIdx + 3)]: count + 1 }
      chaRecords[chaIdx]['누적 경험치'] = totalExp
      chaRecords[chaIdx]['경험치'] = nowExp

    }

    // 6. 만약 '해금'에 값이 있으면, 해당 레코드의 '발견자'에 id를 추가한다.
    //let unlockUserIdStr = null;
    if (advRecords[selectIdxArray[pickIdx]]['해금'] !== '' && advRecords[selectIdxArray[pickIdx]]['해금'] !== undefined) {
      let unlockUserIdStr = advRecords[selectIdxArray[pickIdx]]['발견자']
      if (unlockUserIdStr === '' || unlockUserIdStr === undefined) {
        unlockUserIdStr = '' + userId
      } else {
        unlockUserIdStr += '/' + userId
      }
      let unlockIdx = pickIdx + 3
      if (keyword === '나무흔들기'){
        unlockIdx = pickIdx + 18
      }
      updateData['모험'] = { ['F' + (unlockIdx)]: unlockUserIdStr }
      advRecords[selectIdxArray[pickIdx]]['발견자'] = unlockUserIdStr
    }    

    let isNeedThread = false
    // 7. 만약 `스레드`의 값이 `true`라면 스레드를 만든다.
    if (advRecords[selectIdxArray[pickIdx]]['스레드'] === 'TRUE') { //스프레드시트의 TRUE는 대문자.
      isNeedThread = true
    }
    
    // 8. 만약 `루팅`에 값이 있으면, 해당 유저의 아이템에 아이템을 추가한다.
    const itemRecords = sheetRecords['아이템']  
    let updateCategoryCol = { '회복': 'H', '볼': 'I', '나무열매': 'J', '도구': 'K', '중요한물건': 'L' }  
    if (advRecords[selectIdxArray[pickIdx]]['루팅'] !== '' && advRecords[selectIdxArray[pickIdx]]['루팅'] !== undefined){
      let item = advRecords[selectIdxArray[pickIdx]]['루팅']
      console.log('아이템:'+item) //시트 아이템 제대로 확인 됨
      
      let itemIdx = null //획득하려는 아이템이 db에 실존하는지 확인
      for (let i = 0; i < itemRecords.length; i++) {
        if (itemRecords[i]['아이템명'].trim() === item.trim()) {
          itemIdx = i
          break
        }
      } 
      let chaIdx = null; //캐릭터 찾기
      for (let i = 0; i < chaRecords.length; i++) {
        if ('' + userId === '' + chaRecords[i]['아이디']) {
          chaIdx = i;
          break;
        }
      }

      let category = itemRecords[itemIdx]['카테고리']
      let userItems = chaRecords[chaIdx][category]

      let addReturn = addItem(item, userItems)
      if (addReturn['code'] !== 0) {
        return addReturn
      }

      let userItemsAdd = addReturn['content']
      chaRecords[chaIdx][category] = userItemsAdd
      updateData['캐릭터'] = { [updateCategoryCol[category] + (chaIdx + 3)]: userItemsAdd, ['R' + (chaIdx + 3)]: count + 1  }

    }

    return { 'code': 0, 'content': content, 'updateData': updateData, 'sheetRecords': sheetRecords, 'isNeedThread': isNeedThread }

  } catch (e) {
    //에러 처리
    const content =
      `doAdv 에러. 메시지를 캡처해 서버장에게 문의해 주세요. \nname:${e.name}\nmessage:${e.message}\nstack:${e.stack}`
    return { 'code': -1, 'content': content }
  }
}

module.exports = {
  doAdv,
};