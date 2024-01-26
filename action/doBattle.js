const SpreadsheetDataHandler = require('../sheet.js');
const _ = require('lodash');
const { getPostposition } = require('../getPostposition.js');

function doBattle(targetName, userId) {
  try {
    console.log('doBattle 시작::')
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
    
    // 1-2. 시트에 배틀 대상이 누락된 경우 -> 배틀을 시작할 수 없음
    if (chaRecords[chaIdx]['승부 대상'] === '' || chaRecords[chaIdx]['승부 대상'] === null || chaRecords[chaIdx]['승부 대상'] === undefined){
      content = '배틀이 가능한 상대가 없습니다!'
      return { 'code': -1, 'content': content }
    }


    
    // 2. 배틀 탭에서 데이터 찾기
    let battleIdx = null 
    for (let i = 0; i < battleRecords.length; i++) {
      if (targetName === '' + battleRecords[i]['이름']) {
        battleIdx = i;
        break;
      }
    }

    // 2-1. 배틀 탭에서 배틀 대상을 찾지 못한 경우
    if (battleIdx === null) {
      content = `${targetName}:: 스프레드 시트에 정보가 존재하지 않습니다!`;
      return { 'code': -1, 'content': content }
    }

    // 2-2. 배틀 대상이 다른 유저와 배틀 중인 경우
    // 모험에서 선택지를 통해 배틀이 시작됐을 경우, 한 트레이너에게 여러명이 할당되어 있을 수 있다.
    if (battleRecords[battleIdx]['승부 대상'] != '' && battleRecords[battleIdx]['승부 대상'] != undefined ){
      content = `${targetName}:: 누군가와 승부를 진행중입니다. 잠시 기다려주세요.`
      return { 'code': -1, 'content': content }
    }

    
    // 3. 배틀 대상(트레이너) 데이터에 id 넣어서 배틀 선점 처리.
    battleRecords[battleIdx]['승부 대상'] = ''+userId
    updateData['승부'] = {['I'+(battleIdx+3)]:battleRecords[battleIdx]['승부 대상']}

    let targetNameP = getPostposition(targetName, '이', '가')
    const battleEmbed = {
      title: `▶${targetNameP} 승부를 걸어왔다!`,
      color: 0xFF5A5A,
      footer: {
        text: `[포획에 성공했다면 \`/추가\` 명령어로 포켓몬을 파티에 추가하자.]`,
      },
    };

    // 4. 응답 문구 
    targetScript = battleRecords[battleIdx]['등장대사']
    targetMaxHp = '' + battleRecords[battleIdx]['최대 체력']
    battleEmbed.description = `\`\`\`“${targetScript}”\`\`\`\n▶${targetName}의 체력: ${targetMaxHp}`
    content = { embeds: [battleEmbed] };

    return { 'code': 0, 'content': content, 'updateData': updateData, 'sheetRecords': sheetRecords, 'isNeedThread': true}



  } catch (e) {
    //에러 처리
    const content =
      `doBattle 에러. 메시지를 캡처해 서버장에게 문의해 주세요. \nname:${e.name}\nmessage:${e.message}\nstack:${e.stack}`
    return { 'code': -1, 'content': content }
  }
}

module.exports = {
  doBattle,
};