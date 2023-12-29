function addItem(item, chaItemStr){
  try{
    console.log('addItem 시작:::')
    if (chaItemStr === null || chaItemStr === undefined || chaItemStr === ''){ // split 안함
      chaItemArray = []
    } else{
      chaItemArray = chaItemStr.split(',')
    }

    let findFlag = false
    for(let i=0; i < chaItemArray.length; i++){
      let findIdx = chaItemArray[i].trim().indexOf(item.trim())
      if (findIdx===0){
        let remainItem = chaItemArray[i].trim().slice(item.length)
        if(remainItem[0] === ' ' && isNaN(parseInt(remainItem)) === false){
          chaItemArray[i] = item + ' ' + (parseInt(remainItem) + 1)
          findFlag = true
          break
        }
      }
    }

    if (findFlag == false){
      chaItemArray.push(`${item} 1`)
    }

    let resultStr = ''
    for (let i=0; i < chaItemArray.length; i++){
      resultStr += ', ' + chaItemArray[i].trim()
    }
    resultStr = resultStr.slice(2)

    return { 'code': 0, 'content': resultStr }
    
  }catch (e){
    //에러 처리
    const content =
      `addItem 에러. 메시지를 캡처해 서버장에게 문의해 주세요. \nname:${e.name}\nmessage:${e.message}\nstack:${e.stack}`
    return { 'code': -1, 'content': content }
  }
}

function minusItem(item, chaItemStr){
  try {
    console.log('minusItem 시작:::')
    let chaItemArray = null;
    if (chaItemStr === null || chaItemStr === undefined || chaItemStr === '') {
      const content = '소지품이 부족합니다.'
      return { 'code': -1, 'content': content }
    } else {
      chaItemArray = chaItemStr.split(',')
    }

    let findFlag = false
    for (let i = 0; i < chaItemArray.length; i++) {
      let findIdx = chaItemArray[i].trim().indexOf(item.trim())
      if (findIdx === 0) {
        let remainItem = chaItemArray[i].trim().slice(item.length)
        if (remainItem[0] === ' ' && isNaN(parseInt(remainItem)) === false) {
          let minusItemCnt = parseInt(remainItem) - 1
          if (minusItemCnt === 0){
            chaItemArray.splice(i, 1)
          } else {
            chaItemArray[i] = item + ' ' + minusItemCnt
          }
          findFlag = true
          break
        }
      }
    }

    if (findFlag == false) {
      const content = '소지품이 부족합니다.'
      return { 'code': -1, 'content': content }
    } 

    let resultStr = ''
    for (let i = 0; i < chaItemArray.length; i++) {
      resultStr += ', ' + chaItemArray[i].trim()
    }
    resultStr = resultStr.slice(2)

    return { 'code': 0, 'content': resultStr }

  } catch (e) {
    //에러 처리
    const content =
      `minusItem 에러. 메시지를 캡처해 서버장에게 문의해 주세요. \nname:${e.name}\nmessage:${e.message}\nstack:${e.stack}`
    return { 'code': -1, 'content': content }
  }
}


module.exports = {
  addItem,
  minusItem,
};