const { SlashCommandBuilder } = require('discord.js');
const { doDice } = require('../action/doDice');


module.exports = {
    // /주사위 숫자 -> 숫자d6 다이스 굴리고 -> 그 결과를 답장
    data: new SlashCommandBuilder()
        .setName('주사위')
        .setDescription('주사위를 굴립니다.')
        .addIntegerOption(option =>
            option
                .setName('주사위개수')
                .setDescription('주사위 개수를 숫자로 입력하세요')
                .setRequired(true)
            )
        ,
    async execute(interaction) {
        const diceCnt = interaction.options.getInteger('주사위개수')
        let result = doDice(diceCnt)        
        interaction.reply(result.content)
    },
};