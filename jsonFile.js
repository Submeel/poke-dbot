const fs = require('fs')

async function makeJson(channelId){

  const fileName = 'thread_' + channelId + '.json'
  const data = {}
  const dataJsonString = JSON.stringify(data, null, 2)

  fs.writeFileSync(fileName, dataJsonString, 'utf-8');


}

async function openJson(fileName){
  try {
    const jsonString = fs.readFileSync(fileName, 'utf-8');
    const jsonData = JSON.parse(jsonString)
    return {'code': 0, 'jsonData': jsonData}
  } catch(err){
    const reply = `openJson에서 에러가 발생했습니다. 해당 채널/스레드에 필요한 json 파일이 존재하지 않습니다.`
    return {'code':-1, 'reply':reply}
  }
}

async function writeJson(fileName, data){
  const jsonString = fs.readFileSync(fileName, 'utf-8');
  console.log('jsonString:', jsonString)
  const updateJonString = JSON.stringify(data, null, 2)
  console.log('updateJonString:', updateJonString)
  fs.writeFileSync(fileName, dataJsonString, 'utf-8');
}

async function deleteJson(fileName){
  fs.unlinkSync(fileName)
}

module.exports = {
  makeJson,
  openJson,
  writeJson,
  deleteJson
};