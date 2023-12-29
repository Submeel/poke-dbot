const SpreadsheetDataHandler = require('../sheet.js');
const _ = require('lodash');

function doLucky() {
  try {
    console.log('doLucky 시작::')
    const dataHandler = SpreadsheetDataHandler.getInstance();
    let sheetRecords = _.cloneDeep(dataHandler.sheetRecords);
    const luckyRecords = sheetRecords['운세']
    const randomIdx = Math.floor(Math.random() * luckyRecords.length);
    let script = luckyRecords[randomIdx]['내용']   
    
    // 임베드 만들기
    const luckEmbed ={
      color: 0xD3D3D3,
      title: ':: 오늘의 운세',
      description:`${script}`,
    }
    
    
    content = { embeds: [luckEmbed] };

    return { 'code': 0, 'content': content }

  } catch (e) {
    //에러 처리
    const content =
      `doLucky 에러. 메시지를 캡처해 서버장에게 문의해 주세요. \nname:${e.name}\nmessage:${e.message}\nstack:${e.stack}`
    return { 'code': -1, 'content': content }
  }
}

module.exports = {
  doLucky,
};
