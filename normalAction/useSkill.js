const _ = require('lodash');
const SpreadsheetDataHandler = require('../sheet.js');
const { getPostposition } = require('../getPostposition.js');

async function useSkill(keywords, userId){
  try{
    console.log('###### useSkill start:::', keywords)
    const dataHandler = SpreadsheetDataHandler.getInstance();
    let sheetRecords = _.cloneDeep(dataHandler.sheetRecords);
    const battleRecords = sheetRecords['승부']
    const chaRecords = sheetRecords['캐릭터']
    let updateData = {};
    let content = null
    
    // 1. 키워드 형식 [기술사용/포켓몬] -> 두개인지 확인
    if (keywords.length !== 2){
      content = '키워드 양식을 확인해주세요.'
      return { 'code': -1, 'content': content }
    }

    // 2. 해당 커맨드를 이용한 사용자가 현재 배틀 중인지 확인
    let chaIdx = null; //캐릭터 찾기
    for (let i = 0; i < chaRecords.length; i++) {
      if ('' + userId === '' + chaRecords[i]['아이디']) {
        chaIdx = i;
        break;
      }
    }

    // 2-1. 시트 내에서 사용자  id를 찾지 못한 경우
    if (chaIdx === null) {
      content = '스프레드 시트에 정보가 존재하지 않습니다!'; 
      return { 'code': -1, 'content': content }
    }
    
    // 3. 배틀 탭에서 사용자가 전투중인 대상 있나 확인
    let battleIdx = null 
    for (let i = 0; i < battleRecords.length; i++) {
      if (''+userId === '' + battleRecords[i]['승부 대상']) {
        battleIdx = i;
        break;
      }
    }

    // 3-1. 사용자와 전투중인 트레이너가 없는 경우
    if (battleIdx == null){
      content = '진행중인 승부가 없습니다.'
      return { 'code': -1, 'content': content }
    }



    // 4. 유저가 그 포켓몬 가지고 있나 확인
    let monName = keywords[1]

    let allPkm = chaRecords[chaIdx]['포켓몬']
    let allPkmObjs = JSON.parse(allPkm)

    let monIdx = null
    for (let i = 0 ; i<allPkmObjs.length;i++){
      if (allPkmObjs[i]['이름'] === monName){
        monIdx = i
        break;
      }
    }

    if (monIdx === null) {
      content = `${monName} 이름의 포켓몬을 가지고 있지 않습니다.`
      return { 'code': -1, 'content': content }
    }

    // 4-1. 그 포켓몬이 파티 포켓몬인지 확인
    if (allPkmObjs[monIdx]['파티'] == 'false'){
      content = `${monName} 이름의 포켓몬은 현재 파티 중이 아닙니다.`
      return { 'code': -1, 'content': content }
    }

    // 5. 전투 계산 및 content에 필요한 데이터 셀렉

    const chaHp = chaRecords[chaIdx]['현재 체력'] // 유저 현재체력
    const targetHp = battleRecords[battleIdx]['체력'] // 적 현재체력
    const monLevel = allPkmObjs[monIdx]['레벨'] // 포켓몬 레벨

    const targetDiceN = parseInt(battleRecords[battleIdx]['공격력'])
    const targetDicePlus = parseInt(battleRecords[battleIdx]['공격력:상수'])
    
    const chaName = chaRecords[chaIdx]['이름']
    const targetName = battleRecords[battleIdx]['이름']        
    
    let desc = ''
    // 임베드
    const vsEmbed = {
      color: 0xFF5A5A,
      description: `${desc}`,
    };

    // 6. 유저 -> 적
    
    // 6-1. 러너 포켓몬의 다이스 계산 (레벨D6)
    let monDamage = 0;
    for (let i=0; i<monLevel ; i++){
      monDamage += Math.floor(Math.random() * 6) + 1;
    }

    // 6-2. 적 체력 감소
    let targetHpTobe = targetHp - monDamage
    if (targetHpTobe <= 0 ) targetHpTobe = 0
    
    let monNameP = getPostposition(monName, '이', '가')
    desc = `▶${chaRecords[chaIdx]['이름']}의 ${monNameP} 기술을 사용했다!\n ${targetName}의 포켓몬에게 ${monDamage}만큼 피해를 입혔다! 
    ${targetName}의 남은 체력: ${targetHpTobe}`
    // 6-2-1. 유저->적 단계에서 적 hp가 0이 되면 이후 스텝 밟지 않고 바로 전투 종료처리한다.
    // 러너와 적의 hp 리셋. 각자의 누구와 전투 중이었는지 기록하는 셀 리셋.
    // 러너 승리이므로 경험치, 누적 경험치, 소지금 획득(증가)
    if (targetHpTobe <= 0){
      battleRecords[battleIdx]['체력'] = battleRecords[battleIdx]['최대 체력']
      battleRecords[battleIdx]['승부 대상'] = ''
      updateData['승부'] = {['D'+(battleIdx+3)]:battleRecords[battleIdx]['체력'], // 현재 체력 리셋
                            ['I'+(battleIdx+3)]:battleRecords[battleIdx]['승부 대상']} // 승부 대상 셀을 비워줘야 다음 승부 가능

      const addExp = parseInt(battleRecords[battleIdx]['경험치'])
      const addMoney = parseInt(battleRecords[battleIdx]['용돈'])

      
      chaRecords[chaIdx]['누적 경험치'] = parseInt(chaRecords[chaIdx]['누적 경험치']) + addExp
      chaRecords[chaIdx]['경험치'] = parseInt(chaRecords[chaIdx]['경험치']) + addExp
      // chaRecords[chaIdx]['현재 체력'] = chaRecords[chaIdx]['최대 체력']
      chaRecords[chaIdx]['소지금'] = parseInt(chaRecords[chaIdx]['소지금']) + addMoney
      chaRecords[chaIdx]['승부 대상'] = ''

      updateData['캐릭터'] = {['C'+(chaIdx+3)]:chaRecords[chaIdx]['누적 경험치'],
                              ['D'+(chaIdx+3)]:chaRecords[chaIdx]['경험치'],
                              // ['F'+(chaIdx+3)]:chaRecords[chaIdx]['현재 체력'],
                              ['G'+(chaIdx+3)]:chaRecords[chaIdx]['소지금'],
                              ['T'+(chaIdx+3)]:chaRecords[chaIdx]['승부 대상'] // 승부 대상 셀을 비워줘야 다음 승부 가능
                            } 
      
      
      desc += `\n\n${chaRecords[chaIdx]['이름']}의 승리! \n경험치를 ${addExp} 획득했다! \n용돈을 ${addMoney}원 획득했다! \n▶승부 종료.`
      content = { embeds: [vsEmbed] }; 
      return { 'code': 0, 'content': content, 'updateData': updateData, 'sheetRecords': sheetRecords}
    } 

    // 7. 적 -> 유저
    
    // 7-1. 적의 다이스 계산
    let targetDamage = 0;
    for (let i=0; i<targetDiceN ; i++){
      targetDamage += Math.floor(Math.random() * 6) + 1;
    }
    targetDamage += targetDicePlus

    // 7-2. 유저 체력 감소
    let chaHpTobe = chaHp - targetDamage
    if (chaHpTobe <= 0) chaHpTobe = 0

    desc += `\n▶${targetName}의 포켓몬이 기술을 사용했다!\n${chaRecords[chaIdx]['이름']}의 포켓몬에게 ${targetDamage}만큼 피해를 입혔다! 
    ${chaName}의 남은 체력: ${chaHpTobe}`
    
    // 7-2-1. 적 -> 유저 단계에서 유저 hp가 0이 되어 유저 패배.
    if (chaHpTobe <= 0){
      battleRecords[battleIdx]['체력'] = battleRecords[battleIdx]['최대 체력']
      battleRecords[battleIdx]['승부 대상'] = ''
      updateData['승부'] = {['D'+(battleIdx+3)]:battleRecords[battleIdx]['체력'], // 현재 체력 리셋
                            ['I'+(battleIdx+3)]:battleRecords[battleIdx]['승부 대상']} // 승부 대상 셀을 비워줘야 다음 승부 가능
      
      chaRecords[chaIdx]['현재 체력'] = chaRecords[chaIdx]['최대 체력']
      chaRecords[chaIdx]['승부 대상'] = ''

      updateData['캐릭터'] = {
                              ['F'+(chaIdx+3)]:chaRecords[chaIdx]['현재 체력'],
                              ['T'+(chaIdx+3)]:chaRecords[chaIdx]['승부 대상'] // 승부 대상 셀을 비워줘야 다음 승부 가능
                            } 
      
      
      desc += `\n\n${chaRecords[chaIdx]['이름']}의 패배. 승부를 종료합니다.`
      content = { embeds: [vsEmbed] };
      return { 'code': 0, 'content': content, 'updateData': updateData, 'sheetRecords': sheetRecords}
    } 


    // 8. hp 0 되지 않았다면 다음 턴 진행
    battleRecords[battleIdx]['체력'] = targetHpTobe
    chaRecords[chaIdx]['현재 체력'] = chaHpTobe

    updateData['승부'] = {['D'+(battleIdx+3)]:battleRecords[battleIdx]['체력']}
    updateData['캐릭터'] = {['F'+(chaIdx+3)]:chaRecords[chaIdx]['현재 체력']}

    desc += `\n\n▶다음 턴을 진행합니다. 기술을 사용할 포켓몬을 선택해주세요.`

    content = { embeds: [vsEmbed] };
    return { 'code': 0, 'content': content, 'updateData': updateData, 'sheetRecords': sheetRecords}

  } catch (e){
    const content = `useSkill 에러. 메세지를 캡쳐하여 총괄에게 문의하세요. name:${e.name}, message:${e.message}, stack:${e.stack}`
    return {'code': -1, 'content': content};
  }
}

module.exports = {
  useSkill,
};