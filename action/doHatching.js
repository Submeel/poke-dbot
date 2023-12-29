const SpreadsheetDataHandler = require('../sheet.js');
const _ = require('lodash');

function doHatching(userId, monName){
    try {
      console.log('doHatching 시작::')
      const dataHandler = SpreadsheetDataHandler.getInstance();
      let sheetRecords = _.cloneDeep(dataHandler.sheetRecords);
      const chaRecords = sheetRecords['캐릭터']
      const monRecords = sheetRecords['포켓몬']
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


      if (chaIdx === null) {
        content = '스프레드 시트에 캐릭터 정보가 존재하지 않습니다!';
        return { 'code': -1, 'content': content }
      }

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
        content = `${monName} 이름의 알을 가지고 있지 않습니다.`
        return { 'code': -1, 'content': content }
      }

      let targetPkmObj = allPkmObjs[monIdx]
      

      if (targetPkmObj['종류'] !== '알'){
        content = '알이 아니면 부화시킬 수 없습니다.'
        return { 'code': -1, 'content': content }
      }

      if (targetPkmObj['레벨'] < 1){
        content = `레벨 1이 되지 않은 알은 부화시킬 수 없습니다.`
        return { 'code': -1, 'content': content }
      }

      let randomIdx = Math.floor(Math.random() * monRecords.length - 1) + 1
      let randomName = monRecords[randomIdx]['이름']

      targetPkmObj['종류'] = randomName

      let isExist = false
      let cnt = 0
      for (let i = 0 ; i<allPkmObjs.length;i++){
        if (allPkmObjs[i]['종류'] === monName){
          isExist = true
          cnt += 1
        }
      }

      if (isExist){
        targetPkmObj['이름'] = randomName + cnt
      } else {
        targetPkmObj['이름'] = randomName
      }

      allPkmObjs[monIdx] = targetPkmObj
      

      let toBe = JSON.stringify(allPkmObjs)
      updateData['캐릭터'] = {['M'+(chaIdx+3)]:toBe}
      chaRecords[chaIdx]['포켓몬'] = toBe

      content = '포켓몬 부화 완료'

      return { 'code': 0, 'content': content, 'updateData' : updateData , 'sheetRecords' : sheetRecords}        

    } catch (e) {
        //에러 처리
        const content =
            `doHatching 에러. 메시지를 캡처해 서버장에게 문의해 주세요. \nname:${e.name}\nmessage:${e.message}\nstack:${e.stack}`
        return { 'code': -1, 'content': content }
    }
}

module.exports = {
  doHatching,
};