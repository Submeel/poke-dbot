const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ActivityType } = require('discord.js');
const { token } = require('./config.json'); //
const SpreadsheetDataHandler = require('./sheet.js');
const _ = require('lodash');


const client = new Client({ intents: [GatewayIntentBits.Guilds] });


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
            await dataHandler.clearCells("모험", "F3:F");
            for (const userId in chaRecords) {
                chaRecords[userId]['모험횟수'] = null;
                chaRecords[userId]['탐색횟수'] = null;
            }
            for (const keyword in advRecords) {
                advRecords[keyword]['발견자'] = null;
            }
            dataHandler.sheetRecords = sheetRecords
        }
    }, 1000)
});



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


(async () => {
    try {
        await dataHandler.getAllSheetDataAsDictionaries();
        console.log('Sheet data load 완료:', dataHandler.sheetRecords);
        client.login(token);
    } catch (e) {
        console.log('e:', e);
    }
}
)();