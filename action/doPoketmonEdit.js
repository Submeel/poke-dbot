const SpreadsheetDataHandler = require('../sheet.js');
const _ = require('lodash');

function doPoketmonEdit(userId, asIsMonName, toBeMonName, monKind, monLevel, monExp, monBall, monParty) {
    try {
      console.log('doPoketmonEdit 시작::')
      const dataHandler = SpreadsheetDataHandler.getInstance();
      let sheetRecords = _.cloneDeep(dataHandler.sheetRecords);
      const chaRecords = sheetRecords['캐릭터']
      const monRecords = sheetRecords['포켓몬']
      const itemRecords = sheetRecords['아이템']
      console.log(chaRecords)
      let content = null;
      let updateData = {};

      let chaIdx = null;
      for (let i = 0; i < chaRecords.length; i++) {
          if ('' + userId === '' + chaRecords[i]['아이디']) {
              chaIdx = i;
              break;
          }
      }

      let pokeIdx = null; //포켓몬 시트에서 포켓몬 찾기
      for (let i = 0; i < monRecords.length; i++) {
        if ('' + monKind === '' + monRecords[i]['이름']) {
          pokeIdx = i;
          break;
        }
      }

      let itemIdx = null
      for (let i = 0; i < itemRecords.length; i++) {
        if (itemRecords[i]['아이템명'].trim() === monBall.trim()) {
          itemIdx = i
          break
        }
      }
      
      if (chaIdx === null) {
        content = '스프레드 시트에 캐릭터 정보가 존재하지 않습니다!';
        return { 'code': -1, 'content': content }
      }

      if (pokeIdx === null) {
        content = '스프레드 시트에 포켓몬 정보가 존재하지 않습니다!';
        return { 'code': -1, 'content': content }
      }

      if (itemRecords[itemIdx]['카테고리'].trim() !== '볼') {
        content = `${monBall} :: 볼에는 카테고리가 [볼]인 아이템만 사용 가능합니다!`;
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

      let isParty = 'false'
      if (monParty === 'Y'){isParty='true'}

      let allPkm = chaRecords[chaIdx]['포켓몬']
      let allPkmObjs = JSON.parse(allPkm)

      let monIdx = null
      for (let i = 0 ; i<allPkmObjs.length;i++){
        if (allPkmObjs[i]['이름'] === asIsMonName){
          monIdx = i
          break;
        }
      }
      

      if (monIdx === null) {
        content = `${asIsMonName} 이름의 포켓몬을 가지고 있지 않습니다.`
        return { 'code': -1, 'content': content }
      }

      const beforeMonName = allPkmObjs[monIdx]['이름']
      const beforeMonKind = allPkmObjs[monIdx]['종류']
      const beforeMonLevel = allPkmObjs[monIdx]['레벨']
      const beforeMonExp = allPkmObjs[monIdx]['경험치']
      const beforeMonBall = allPkmObjs[monIdx]['볼']

      allPkmObjs[monIdx]['이름'] = toBeMonName
      allPkmObjs[monIdx]['종류'] = monKind
      allPkmObjs[monIdx]['레벨'] = monLevel
      allPkmObjs[monIdx]['경험치'] = monExp
      allPkmObjs[monIdx]['볼'] = monBall
      allPkmObjs[monIdx]['파티'] = isParty

      let toBe = JSON.stringify(allPkmObjs)
      updateData['캐릭터'] = {['M'+(chaIdx+3)]:toBe}
      chaRecords[chaIdx]['포켓몬'] = toBe

      let wherePkm = null;
      if (isParty === 'true') {
        wherePkm = '지닌 포켓몬'
      } else {
        wherePkm = '박스'
      }


      const monEditEmbed = {
        color: 0xFF5A5A,
        title: `포켓몬 변경`,
        fields: [
          {
            name: `\`포켓몬을 ${wherePkm}로 옮겼다!\``,
            value: `이름:${beforeMonName} (${beforeMonBall}) | 종류:${beforeMonKind} | Lv.${beforeMonLevel}(경험치:${beforeMonExp})\n\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800🔻\n 이름:${toBeMonName} (${monBall})| 종류:${monKind} | Lv.${monLevel}(경험치:${monExp})`,
            inline: false,
          },
        ],
      };
      content = { embeds: [monEditEmbed] };


      return { 'code': 0, 'content': content, 'updateData' : updateData , 'sheetRecords' : sheetRecords}        

    } catch (e) {
        //에러 처리
        const content =
            `doPoketmonEdit 에러. 메시지를 캡처해 서버장에게 문의해 주세요. \nname:${e.name}\nmessage:${e.message}\nstack:${e.stack}`
        return { 'code': -1, 'content': content }
    }
}

module.exports = {
  doPoketmonEdit,
};