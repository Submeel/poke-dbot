const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ActivityType } = require('discord.js');
const config = require('./config.json');
const token = process.env.BOT_TOKEN || config.token;
const SpreadsheetDataHandler = require('./sheet.js');
const _ = require('lodash');
const { useSkill } = require('./normalAction/useSkill');


// 해당 권한들이 있어야 일반 메세지를 인식합니다
const client = new Client({ intents: [GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.MessageContent] });


client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const file of commandFolders) {
    const filePath = path.join(foldersPath, file);
    // console.log('filepath:', filePath);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        // console.log('data, execute 있음')
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

const dataHandler = SpreadsheetDataHandler.getInstance();
dataHandler.doAuth();

client.on(Events.ClientReady, () => {
    console.log('Ready!');  
    client.user.setActivity('담청군도를 모험', { type: ActivityType.Playing });
    setInterval(async () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        let sheetRecords = _.cloneDeep(dataHandler.sheetRecords);
        const chaRecords = sheetRecords['캐릭터']
        const advRecords = sheetRecords['모험']
        if (hours === 0 && minutes === 0 && seconds === 0) {
            await dataHandler.clearCells("캐릭터", "R3:R");
            await dataHandler.clearCells("캐릭터", "S3:S");
            await dataHandler.clearCells("캐릭터", "T3:T");
            await dataHandler.clearCells("모험", "F3:F");
            for (const userId in chaRecords) {
                chaRecords[userId]['모험횟수'] = null;
                chaRecords[userId]['탐색횟수'] = null;
                chaRecords[userId]['승부 대상'] = null;
            }
            for (const keyword in advRecords) {
                advRecords[keyword]['발견자'] = null;
            }
            dataHandler.sheetRecords = sheetRecords
        }
    }, 1000)
});


// Slash 커맨드일 경우 반응
client.on(Events.InteractionCreate, async interaction => {
    console.log('Events.InteractionCreate');

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }   

});



// 일반 메세지에 [] 가 있을 경우 반응
client.on(Events.MessageCreate, async message => {
    // 봇 자신의 메시지는 무시
    if (message.author == client.user) return;

    // 메시지 내의 대괄호 [] 순서 확인
    const keywords = getBracketContents(message.content);

    if (keywords.length > 0) {
        if (keywords[0] === '') return
        
        let result = await checkKeywords(keywords, message.author.id)
        if (result!= '' && result.content !== null && result.content !== '' && result.content !== undefined){
            try{
                message.reply(result.content)
                if (result.hasOwnProperty('updateData')) {
                    // 업데이트
                    const dataHandler = SpreadsheetDataHandler.getInstance();
                    await dataHandler.updateCells(result.updateData)
                    dataHandler.sheetRecords = result.sheetRecords
                }
            } catch (e){
                const content = `예기치 못한 오류가 발생했습니다. 총괄에게 문의하세요. name:${e.name}, message:${e.message}, stack:${e.stack}`
                message.reply(content)
            }
        }
    } 
});


// 대괄호 안의 내용을 가져오는 함수
function getBracketContents(text) {
	const bracketContents = [];
	const regex = /\[([^\]]*)\]/g;

	let match;
	while ((match = regex.exec(text)) !== null) {
		bracketContents.push(match[1].split('/').map(item => item.trim()));
	}

	return bracketContents.flat();
}


async function checkKeywords(keywords, userId){
	
	console.log('###### checkKeywords start:::', keywords)
	let result = ''
	if (keywords[0] === '기술사용'){
		result = await useSkill(keywords, userId)
	}


	return result

}


(async () => {
    try {
        await dataHandler.getAllSheetDataAsDictionaries();
        // console.log('Sheet data load 완료:', dataHandler.sheetRecords);
        client.login(token);
    } catch (e) {
        console.log('e:', e);
    }
}
)();