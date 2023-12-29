const { SlashCommandBuilder } = require('discord.js');
const { doRsp } = require('../action/doRsp');

module.exports = {
    data: new SlashCommandBuilder()
		.setName('가위바위보')
		.setDescription('[약식 배틀] 가위바위보로 배틀을 간소화합니다')
		.addStringOption(option =>
			option
				.setName('명령어')
				.setDescription('가위/바위/보 중 하나를 입력하세요')
				.addChoices(
					{name:'가위', value:'가위' },
					{name:'바위', value:'바위' },
					{name:'보', value:'보' }
				)
				.setRequired(true)
			),
	async execute(interaction) {
		const userId = interaction.user.id;
		const subCommand = interaction.options.getString('명령어')
		let result = doRsp(subCommand, userId)
		interaction.reply(result.content)
	},
};