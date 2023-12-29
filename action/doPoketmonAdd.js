const SpreadsheetDataHandler = require('../sheet.js');
const _ = require('lodash');

function doPoketmonAdd(userId, monName, monLevel, monExp, monBall, monParty) {
    try {
      console.log('doPoketmonAdd 시작::')
      const dataHandler = SpreadsheetDataHandler.getInstance();
      let sheetRecords = _.cloneDeep(dataHandler.sheetRecords);
      const chaRecords = sheetRecords['캐릭터']
      const monRecords = sheetRecords['포켓몬']
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

      let monIdx = null; //포켓몬 시트에서 포켓몬 찾기
      for (let i = 0; i < monRecords.length; i++) {
        if ('' + monName === '' + monRecords[i]['이름']) {
          monIdx = i;
          break;
        }
      }
      


      if (chaIdx === null) {
        content = '스프레드 시트에 캐릭터 정보가 존재하지 않습니다!';
        return { 'code': -1, 'content': content }
      }

      if (monIdx === null) {
        content = '스프레드 시트에 포켓몬 정보가 존재하지 않습니다!';
        return { 'code': -1, 'content': content }
      }
      
      if (monLevel < 0){
        content = '포켓몬 레벨은 음수일 수 없습니다.'
        return { 'code': -1, 'content': content }
      }

      if (monLevel >= 1 && monExp < 0){
        content = '부화 상태의 포켓몬 경험치는 음수일 수 없습니다.'
        return { 'code': -1, 'content': content }
      }

      if (monLevel === 0 && monExp > 0) {
        content = '부화하지 않은 포켓몬의 경험치는 양수일 수 없습니다.'
        return { 'code': -1, 'content': content }
      }

      let isParty = false
      if (monParty === 'Y') isParty=true

      let allPkm = chaRecords[chaIdx]['포켓몬'] //캐릭터 포켓몬 불러오기
      let allPkmObjs = JSON.parse(allPkm) //JSON으로 파싱

    
      let addPkmObj = { //오브젝트 내용 저장
        "이름":monName,
        "종류":monName,
        "레벨":monLevel,
        "경험치": monExp,
        "볼": monBall,
        "파티": '' + isParty
      } 

      if (allPkmObjs === null || allPkmObjs=== undefined || allPkmObjs === ''){
        allPkmObjs = [addPkmObj] 
      } else { //포켓몬 찾기
        isExist = false
        let cnt = 0
        let partyCnt = 0
        for (let i = 0 ; i<allPkmObjs.length;i++){
          if (allPkmObjs[i]['종류'] === monName){
            isExist = true
            cnt += 1
          }
          if (allPkmObjs[i]['파티'] === 'true'){ 
            partyCnt += 1 //파티에 있는 포켓몬 카운팅
          }
        }
        

        if (isExist){
          addPkmObj['이름'] = monName + cnt //중복되는 포켓몬 이름 변경
        }

        if (partyCnt >= 6){
          addPkmObj['파티'] = 'false' //이미 파티에 포켓몬 6마리 있으면 자동으로 박스로 보냄
        }
        allPkmObjs.push(addPkmObj) //배열에 포켓몬 객체 추가
      }
      let wherePkm = null;
      if (addPkmObj['파티'] === 'true') {
        wherePkm = '지닌 포켓몬'
      } else {
        wherePkm = '박스'
      }

      let toBe = JSON.stringify(allPkmObjs)
      updateData['캐릭터'] = {['M'+(chaIdx+3)]:toBe}
      chaRecords[chaIdx]['포켓몬'] = toBe

      //볼 종류 이모지로 변환
      let ballEmoji;
      switch (monBall) {
        case "몬스터볼":
          ballEmoji = "<:pokeball:1158350172858892358>";
          break;
        case "슈퍼볼":
          ballEmoji = "<:superball:1161877293363376178>";
          break;
        case "하이퍼볼":
          ballEmoji = "<:hyperball:1161877368135225344>";
          break;
        case "마스터볼":
          ballEmoji = "<:masterball:1161877493914026088>";
          break;
        case "레벨볼":
          ballEmoji = "<:levelball:1161877610901536788>";
          break;
        case "문볼":
          ballEmoji = "<:moonball:1161877863692238928>";
          break;
        case "루어볼":
          ballEmoji = "<:lureball:1161877954729623652>";
          break;
        case "프렌드볼":
          ballEmoji = "<:friendball:1161878044777123850>";
          break;
        case "러브러브볼":
          ballEmoji = "<:loveloveball:1161878139069268068>";
          break;
        case "스피드볼":
          ballEmoji = "<:speedball:1161878239552217118>";
          break;
        case "헤비볼":
          ballEmoji = "<:heavyball:1161878319176896572>";
          break;
        case "프리미어볼":
          ballEmoji = "<:premierball:1161878692776124416>";
          break;
        case "네트볼":
          ballEmoji = "<:netball:1161878770316222516>";
          break;
        case "네스트볼":
          ballEmoji = "<:nestball:1161878866969767947>";
          break;
        case "리피트볼":
          ballEmoji = "<:repeatball:1161879020519030906>";
          break;
        case "타이머볼":
          ballEmoji = "<:timerball:1161879114651807767>";
          break;
        case "럭셔리볼":
          ballEmoji = "<:luxuryball:1161879191969599499>";
          break;
        case "다이브볼":
          ballEmoji = "<:diveball:1161879279521505391>";
          break;
        case "힐볼":
          ballEmoji = "<:healball:1161879369556439111>";
          break;
        case "퀵볼":
          ballEmoji = "<:quickball:1161879454293971044>";
          break;
        case "다크볼":
          ballEmoji = "<:darkball:1161879536498131024>";
          break; 
          default:
          content = `${monBall}:: 볼 이름이 올바르지 않습니다!!`;
          return { 'code': -1, 'content': content };
      }


      const monAddEmbed = {
        color: 0xFF5A5A,
        title: `포켓몬 등록`,
        fields: [
          {
            name: `\`포켓몬을 ${wherePkm}에 추가했다!\``,
            value: `${ballEmoji} 이름:${addPkmObj['이름']} | 종류:${monName} | Lv.${monLevel}(경험치:${monExp})`, 
            inline: false,
          },
        ],
      };
      content = { embeds: [monAddEmbed] };

      return { 'code': 0, 'content': content, 'updateData' : updateData , 'sheetRecords' : sheetRecords}        

    } catch (e) {
        //에러 처리
        const content =
            `doPoketmonAdd 에러. 메시지를 캡처해 서버장에게 문의해 주세요. \nname:${e.name}\nmessage:${e.message}\nstack:${e.stack}`
        return { 'code': -1, 'content': content }
    }
}

module.exports = {
  doPoketmonAdd,
};