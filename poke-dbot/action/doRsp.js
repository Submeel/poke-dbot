const SpreadsheetDataHandler = require('../sheet.js');
const _ = require('lodash');

// 은는이가 코드 시작
function getPostposition(word, first, second) {
    const lastChar = word[word.length - 1];
    const lastCharCode = lastChar.charCodeAt(0);

    if (lastCharCode < 0xAC00 || lastCharCode > 0xD7A3) {
        return word + first;
    }

    const finalConsonant = (lastCharCode - 0xAC00) % 28;

    if (finalConsonant === 0) {
        return word + second;
    }

    return word + first;
}
//은는이가 코드 종료

function doRsp(subCommand, userId) {
    try {
        console.log('doRsp 시작::')
        const dataHandler = SpreadsheetDataHandler.getInstance();
        let sheetRecords = _.cloneDeep(dataHandler.sheetRecords);
        const chaRecords = sheetRecords['캐릭터']
        console.log(chaRecords)
        let content = null;

        let name = null; 
        for (let i = 0; i < chaRecords.length; i++) {
            if ('' + userId === '' + chaRecords[i]['아이디']) {
                name = chaRecords[i]['이름'];
                break;
            }
        }
        let postposition = getPostposition(name, '은', '는'); // 은,는 붙이기

        if (name === null || name == '' || name === undefined) {
            content = '스프레드 시트에 정보가 존재하지 않습니다!';
            return { 'code': -1, 'content': content }
        }

        const botSelectArray = ['가위', '바위', '보']
        const selectIdx = Math.floor(Math.random() * 3); // 0, 1, 2
        const botSelect = botSelectArray[selectIdx]
        

        let result = null;
        let script = null;
        let c = null;
        if (botSelect === subCommand) {
            script = '치열한 승부 끝에…\n…… 끝에…\n………\n왜 끝이 안 나지?\n\n \`배틀 중단. ▶무승부\`';
            c = 0xB2B2B2;
            result = '무승부';
        } else if ((botSelect === '가위' && subCommand === '바위') || (botSelect === '바위' && subCommand === '보') || (botSelect === '보' && subCommand === '가위')) {
            script = `치열한 승부 끝에…\n${postposition} 배틀에서 승리했다!\n\n \`배틀 종료. ▶승리\``;
            c = 0x47CE49;
            result = '승리';
        } else {
            script = `치열한 승부 끝에…\n${name}의 곁에는 싸울 수 있는 포켓몬이 없다!\n${postposition} 눈앞이 깜깜해졌다!\n\n \`배틀 종료. ▶패배\``;
            c = 0xC10303;
            result = '패배';
        }

        // 임베드 만들기
        const rspEmbed = {
            title: `[약식 배틀] ::${result}`,
            description: `${script}`,
            color: `${c}`,
        };

        content = { embeds: [rspEmbed] };
        return { 'code': 0, 'content': content }

    } catch (e) {
        //에러 처리
        const content =
            `doRsp 에러. 메시지를 캡처해 서버장에게 문의해 주세요. \nname:${e.name}\nmessage:${e.message}\nstack:${e.stack}`
        return { 'code': -1, 'content': content }
    }
}

module.exports = {
    doRsp,
};