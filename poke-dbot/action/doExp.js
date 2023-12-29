const SpreadsheetDataHandler = require('../sheet.js');
const _ = require('lodash');

function doExp(sign, amount, userId) {
    try {
      console.log('doExp 시작::')
      const dataHandler = SpreadsheetDataHandler.getInstance();
      let sheetRecords = _.cloneDeep(dataHandler.sheetRecords);
      const chaRecords = sheetRecords['캐릭터']
      console.log(chaRecords)
      let content = null;
      let updateData = {};
      // 임베드
      const expEmbed = {
        color: 0x5A95F5,
      };
      let chaIdx = null;
      for (let i = 0; i < chaRecords.length; i++) {
          if ('' + userId === '' + chaRecords[i]['아이디']) {
              chaIdx = i;
              break;
          }
      }

      chaName = chaRecords[chaIdx]['이름']

      if (chaIdx === null) {
            content = '스프레드 시트에 정보가 존재하지 않습니다!';
            return { 'code': -1, 'content': content }
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
        if (nowExp === undefined || nowExp === ''){
          content = '경험치 공란';
          return { 'code': -1, 'content': content }
        }
          try {
            nowExp = parseInt(nowExp)
          } catch (e) {
            content = '시트에 숫자가 아닌 다른 것이 들어가 있습니다';
            return { 'code': -1, 'content': content }
          }
        
        if (sign === '+'){
          console.log('더하기 전:', nowExp, totalExp) 
          totalExp = totalExp + amount
          nowExp = nowExp + amount
          console.log('더한 후:', nowExp, totalExp)           
          expEmbed.description = `${chaName}의 경험치가 \`${amount}\` 증가했다! \n▶현재 경험치 [ ${nowExp} / ${totalExp} ]`
        } else{//sine === '-'
          //totalExp = totalExp - amount
          nowExp = nowExp - amount
          expEmbed.description = `${chaName}의 경험치가 \`${amount}\` 감소했다! \n▶현재 경험치 [ ${nowExp} / ${totalExp} ]`
          if(nowExp < 0){
            content = '경험치는 음수가 될 수 없습니다';
            return { 'code': -1, 'content': content }
          }
        }

        updateData['캐릭터'] = { ['C' + (chaIdx + 3)]: totalExp, ['D' + (chaIdx + 3)]: nowExp }
        chaRecords[chaIdx]['누적 경험치'] = totalExp
        chaRecords[chaIdx]['경험치'] = nowExp

      content = { embeds: [expEmbed] };

        return { 'code': 0, 'content': content, 'updateData' : updateData , 'sheetRecords' : sheetRecords}        

    } catch (e) {
        //에러 처리
        const content =
            `doExp 에러. 메시지를 캡처해 서버장에게 문의해 주세요. \nname:${e.name}\nmessage:${e.message}\nstack:${e.stack}`
        return { 'code': -1, 'content': content }
    }
}

module.exports = {
  doExp,
};