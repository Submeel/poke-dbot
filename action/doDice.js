function doDice(diceCnt){
    try{
        console.log('doDice 시작::')
        let diceSum = 0;
        let content = null;

        if (diceCnt <= 0){
            content = `주사위 개수는 1 이상의 정수로 입력해 주세요`
            return { 'code': -1, 'content': content }  
        }

        let diceArray = [];
        for(let i=0; i < diceCnt; i++){
            console.log(diceSum)
            let tmpDice = Math.floor(Math.random() * 6) + 1;
            diceSum = diceSum + tmpDice 
            diceArray.push(tmpDice);
            console.log(diceSum)
        }        
        script = `${diceCnt}개의 주사위를 굴렸다… \n▶굴림: [${diceArray}]\n▶결과: ${diceSum}`

        // 임베드 만들기
        const diceEmbed = {
            color: 0xD3D3D3,
            title: ':: 주사위 굴림 결과',
            description: `${script}`,
        }


        content = { embeds: [diceEmbed] };
        return {'code':0, 'content':content}

    } catch (e){
        //에러 처리
        const content =
        `doDice 에러. 메시지를 캡처해 서버장에게 문의해 주세요. \nname:${e.name}\nmessage:${e.message}\nstack:${e.stack}`
        return {'code':-1 , 'content' : content}
    }
}

module.exports  ={
    doDice,
};
