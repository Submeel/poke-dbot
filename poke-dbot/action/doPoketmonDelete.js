const SpreadsheetDataHandler = require('../sheet.js');
const { getPostposition } = require('../getPostposition.js');
const _ = require('lodash');

function doPoketmonDelete(userId, monName){
    try {
      console.log('doPoketmonDelete 시작::')
      const dataHandler = SpreadsheetDataHandler.getInstance();
      let sheetRecords = _.cloneDeep(dataHandler.sheetRecords);
      const chaRecords = sheetRecords['캐릭터']
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
        content = `${monName} 이름의 포켓몬을 가지고 있지 않습니다.`
        return { 'code': -1, 'content': content }
      }

      
      allPkmObjs.splice(monIdx, 1)

      let toBe = JSON.stringify(allPkmObjs)
      updateData['캐릭터'] = {['M'+(chaIdx+3)]:toBe}
      chaRecords[chaIdx]['포켓몬'] = toBe

      function isAlphabet(char) {
        return /^[a-zA-Z]$/.test(char);
      }

      let monNameP = getPostposition(monName, '을', '를')
      if (isAlphabet(monName.slice(-1))) {
        monNameP = monName
      }

      const monDeleteEmbed = {
        color: 0xFF5A5A,
        title: `::놓아주기`,
        description: `${monNameP} 놓아주었다. 바이바이, ${monName}!`,
      };
      content = { embeds: [monDeleteEmbed] };

      //content = ``

      return { 'code': 0, 'content': content, 'updateData' : updateData , 'sheetRecords' : sheetRecords}        

    } catch (e) {
        //에러 처리
        const content =
            `doPoketmonDelete 에러. 메시지를 캡처해 서버장에게 문의해 주세요. \nname:${e.name}\nmessage:${e.message}\nstack:${e.stack}`
        return { 'code': -1, 'content': content }
    }
}

module.exports = {
  doPoketmonDelete,
};