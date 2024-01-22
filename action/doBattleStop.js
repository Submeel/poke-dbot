const SpreadsheetDataHandler = require('../sheet.js');
const { getPostposition } = require('../getPostposition.js');
const _ = require('lodash');

function doBattleStop(userId){
  try {
    console.log('doBattleStop 시작::')
    const dataHandler = SpreadsheetDataHandler.getInstance();
    let sheetRecords = _.cloneDeep(dataHandler.sheetRecords);
    const battleRecords = sheetRecords['승부']
    const chaRecords = sheetRecords['캐릭터']
    let updateData = {};
    let content = null
    

    // 1. 해당 커맨드를 이용한 사용자가 현재 배틀 중인지 확인
    let chaIdx = null; //캐릭터 찾기
    for (let i = 0; i < chaRecords.length; i++) {
      if ('' + userId === '' + chaRecords[i]['아이디']) {
        chaIdx = i;
        break;
      }
    }

    // 1-1. 시트 내에서 사용자  id를 찾지 못한 경우
    if (chaIdx === null) {
      content = '스프레드 시트에 정보가 존재하지 않습니다!'; 
      return { 'code': -1, 'content': content }
    }
    
    // 1-2. 시트에 배틀 대상이 누락된 경우 -> 하고 있는 배틀이 없음
    if (chaRecords[chaIdx]['승부 대상'] == '' || chaRecords[chaIdx]['승부 대상'] == undefined){
      content = '진행중인 승부가 없습니다.'
      return { 'code': -1, 'content': content }
    }


    
    // 2. 배틀 탭에서 사용자가 전투중인 대상 있나 확인
    let battleIdx = null 
    for (let i = 0; i < battleRecords.length; i++) {
      if (''+userId === '' + battleRecords[i]['승부 대상']) {
        battleIdx = i;
        break;
      }
    }

    // 2-1. 사용자와 전투중인 트레이너가 없는 경우
    if (battleIdx == null){
      content = '진행중인 승부가 없습니다.'
      return { 'code': -1, 'content': content }
    }


    // 3. 강제종료(리셋) 처리
    battleRecords[battleIdx]['체력'] = battleRecords[battleIdx]['최대 체력']
    battleRecords[battleIdx]['승부 대상'] = ''
    updateData['승부'] = {['D'+(battleIdx+3)]:battleRecords[battleIdx]['체력'], // 현재 체력 리셋
                          ['I'+(battleIdx+3)]:battleRecords[battleIdx]['승부 대상']} // 승부 대상 셀을 비워줘야 다음 승부 가능

    chaRecords[chaIdx]['승부 대상'] = ''
    updateData['캐릭터'] = {
                            ['T'+(chaIdx+3)]:chaRecords[chaIdx]['승부 대상'] // 승부 대상 셀을 비워줘야 다음 승부 가능
                          } 
    
    content = `${chaRecords[chaIdx]['이름']}와/과 ${battleRecords[battleIdx]['이름']}의 승부를 종료합니다.`
    return { 'code': 0, 'content': content, 'updateData': updateData, 'sheetRecords': sheetRecords}


  } catch (e) {
    //에러 처리
    const content =
      `doBattleStop 에러. 메시지를 캡처해 서버장에게 문의해 주세요. \nname:${e.name}\nmessage:${e.message}\nstack:${e.stack}`
    return { 'code': -1, 'content': content }
  }
}

module.exports = {
  doBattleStop,
};