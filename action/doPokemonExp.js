const SpreadsheetDataHandler = require('../sheet.js');
const _ = require('lodash');

function doPokemonExp(monName, amount, userId) {
  try {
    console.log('doPokemonExp 시작::')
    const dataHandler = SpreadsheetDataHandler.getInstance();
    let sheetRecords = _.cloneDeep(dataHandler.sheetRecords);
    const chaRecords = sheetRecords['캐릭터']
    const monRecords = sheetRecords['포켓몬']
    const expRecords = sheetRecords['경험치테이블']
    console.log(chaRecords)
    let content = null;
    let updateData = {};    

    let chaIdx = null; //캐릭터 시트에서 캐릭터 찾기
    for (let i = 0; i < chaRecords.length; i++) {
      if ('' + userId === '' + chaRecords[i]['아이디']) {
        chaIdx = i;
        break;
      }
    } 

    if (chaIdx === null) {
      content = '스프레드 시트에 정보가 존재하지 않습니다!';
      return { 'code': -1, 'content': content }
    }

    let pokeIdx = null; //포켓몬 시트에서 포켓몬 찾기
    for (let i = 0; i < monRecords.length; i++) {
      if ('' + monName === '' + monRecords[i]['이름']) {
        pokeIdx = i;
        break;
      }
    }

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

    // 캐릭터 경험치
    console.log('경험치 부여 전 트레이너:', nowExp, totalExp)
    nowExp = nowExp - amount
    console.log('경험치 부여 후 트레이너:', nowExp, totalExp)
    if (nowExp < 0) {
      content = '캐릭터 경험치는 음수가 될 수 없습니다!';
      return { 'code': -1, 'content': content }
    }
    // 캐릭터 경험치 빼기 끝
    
    // ㅡㅡㅡㅡㅡ 포켓몬 ㅡㅡㅡㅡㅡㅡ
    //포켓몬 Idx 찾기
    let allPkm = chaRecords[chaIdx]['포켓몬']
    let allPkmObjs = JSON.parse(allPkm)

    let monIdx = null
    for (let i = 0; i < allPkmObjs.length; i++) {
      if (allPkmObjs[i]['이름'] === monName) {
        monIdx = i
        break;
      }
    }//포켓몬 Idx 찾기 끝

    if (monIdx === null) {
      content = '포켓몬의 이름을 확인해 주세요!';
      return { 'code': -1, 'content': content }
    }

    monLevel = allPkmObjs[monIdx]['레벨']
    monExp = allPkmObjs[monIdx]['경험치']

    
    //포켓몬 경험치 더하기
    console.log('경험치 부여 전 포켓몬:', monExp)
    toBeMonExp = amount + monExp
    console.log('경험치 부여 후 포켓몬:', toBeMonExp)

    const mainDesc = `${monName}의 경험치가 ${amount}만큼 증가했다!`

    // 포켓몬 경험치랑 경험치테이블의 누적경험치 비교
    let tobeMonLv = '';
    
    for (let i = 0; i < expRecords.length; i++) {
      console.log('레벨시트 누적경험치', parseInt(expRecords[i]['누적 경험치']))
      if (parseInt(expRecords[i]['누적 경험치']) >= parseInt(toBeMonExp) ) {        
        tobeMonLv = parseInt(expRecords[i]['레벨']) - 1
        if (parseInt(expRecords[i]['누적 경험치']) === parseInt(toBeMonExp)){
          tobeMonLv = parseInt(expRecords[i]['레벨'])
        }
        if (tobeMonLv > 20) {
          content = `[시즌 0:-먼지시티-] 현재 포켓몬의 레벨 상한치는 20입니다! \n 경험치 부여 시도 결과 포켓몬의 레벨 :: Lv. ${tobeMonLv}`;
          return { 'code': -1, 'content': content }
        }
        console.log('포켓몬 레벨', expRecords[i]['레벨'])
        break} else (
        tobeMonLv = monLevel
      )
    } // [경험치 테이블의 누적경험치>포켓몬 경험치] 가 되면 그 직전 i가 포켓몬의 레벨

    let chaMaxHp = parseInt(chaRecords[chaIdx]['최대 체력'])
    let chaNowHp = parseInt(chaRecords[chaIdx]['현재 체력'])

    // 현재 포켓몬의 레벨 !== 바뀌는 포켓몬 레벨이면 
    let levelUpDesc = '';
    if (monLevel < tobeMonLv) {
      levelUpDesc = `\n ▶${monName}의 레벨이 ${tobeMonLv} (으)로 올랐다!\n `
      if (allPkmObjs[monIdx]['파티'] === "true"){
        levelUpDesc +=`\n▶HP가 올랐다! [ ${chaMaxHp} → ${chaMaxHp + (tobeMonLv - monLevel) * 6} ]\n ▶HP가 모두 회복되었다!`; //임베드에 레벨업 메시지 보내기
        chaMaxHp = chaMaxHp + (tobeMonLv - monLevel) * 6
        chaNowHp = chaMaxHp //렙업은 최고의 힐이다
        }
      } //포켓몬 레벨에 따른 캐릭터 HP 정산
      
    console.log('포켓몬 파티:', allPkmObjs[monIdx]['파티'])
    allPkmObjs[monIdx]['이름'] = allPkmObjs[monIdx]['이름']
    allPkmObjs[monIdx]['종류'] = allPkmObjs[monIdx]['종류']
    allPkmObjs[monIdx]['레벨'] = tobeMonLv
    allPkmObjs[monIdx]['경험치'] = toBeMonExp
    allPkmObjs[monIdx]['볼'] = allPkmObjs[monIdx]['볼']
    allPkmObjs[monIdx]['파티'] = allPkmObjs[monIdx]['파티']

    

    let toBe = JSON.stringify(allPkmObjs)
    updateData['캐릭터'] = { ['D' + (chaIdx + 3)]: nowExp, ['E' + (chaIdx + 3)]: chaMaxHp, ['F' + (chaIdx + 3)]: chaNowHp, ['M' + (chaIdx + 3)]: toBe }    
    
    chaRecords[chaIdx]['경험치'] = nowExp // 캐릭터 경험치 업데이트
    chaRecords[chaIdx]['최대 체력'] = chaMaxHp // 캐릭터 최대체력 업데이트
    chaRecords[chaIdx]['현재 체력'] = chaNowHp // 캐릭터 현재체력 업데이트
    chaRecords[chaIdx]['포켓몬'] = toBe // 캐릭터 포켓몬 데이터 업데이트
    
    // 임베드
    const useEmbed = {
      title: `[경험치:: ${monName}]`,
      color: 0xFF5A5A,
      footer: {
        text: `▶${chaRecords[chaIdx]['이름']}의 잔여 경험치: ${nowExp}`,
      },
    };

    useEmbed.description = `${mainDesc}` + `${levelUpDesc}`
    content = { embeds: [useEmbed] };


    return { 'code': 0, 'content': content, 'updateData': updateData, 'sheetRecords': sheetRecords }

  } catch (e) {
    //에러 처리
    const content =
      `doPokemonExp 에러. 메시지를 캡처해 서버장에게 문의해 주세요. \nname:${e.name}\nmessage:${e.message}\nstack:${e.stack}`
    return { 'code': -1, 'content': content }
  }
}

module.exports = {
  doPokemonExp,
};