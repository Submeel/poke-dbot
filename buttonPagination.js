const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = async (interaction, pages, time = 30 * 1000) => {
	try {
		// interaction, pages, time 매개변수의 유효성을 검사합니다.
		if (!interaction || !pages || !pages.length > 0) throw new Error('Invalid arguments');

		// 사용자의 상호작용에 대한 응답을 지연
		await interaction.deferReply();

		// 페이지가 하나만 있는 경우, 버튼 없이 해당 페이지를 보여줍니다.
		if (pages.length === 1) {
			return await interaction.editReply({
				embeds: pages,
				components: [],
				fetchReply: true,
			});
		}

		// 이전, 홈, 다음 버튼을 생성
		const prev = new ButtonBuilder().setCustomId('prev').setEmoji('⬅️').setStyle(ButtonStyle.Primary).setDisabled(true);

		const home = new ButtonBuilder().setCustomId('home').setEmoji('🏠').setStyle(ButtonStyle.Secondary).setDisabled(true);

		const next = new ButtonBuilder().setCustomId('next').setEmoji('➡️').setStyle(ButtonStyle.Primary);

		// 버튼을 한 줄에 추가
		const buttons = new ActionRowBuilder().addComponents([prev, home, next]);
		let index = 0;

		// 메시지를 편집하고 첫 번째 페이지를 보여줍니다.
		const msg = await interaction.editReply({
			embeds: [pages[index]],
			components: [buttons],
			fetchReply: true,
		});

		// 버튼 클릭을 수집하는 메시지 컴포넌트 수집기를 생성
		const mc = await msg.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time,
		});

		// 버튼이 클릭될 때마다 실행되는 이벤트 핸들러
		mc.on('collect', async (i) => {
			// 클릭한 사용자의 ID가 원래 상호작용을 시작한 사용자의 ID와 일치하는지 확인
			if (i.user.id !== interaction.user.id) return i.reply({ content: '남의 페이지를 넘기면 안 돼!', ephemeral: true });

			// 응답을 지연시킵니다.
			await i.deferUpdate({});

			// 클릭된 버튼의 customId를 확인하여 페이지 인덱스를 업데이트
			if (i.customId === 'prev') {
				if (index > 0) index--;
			} else if (i.customId === 'home') {
				index = 0;
			} else if (i.customId === 'next') {
				if (index < pages.length - 1) index++;
			}

			// 첫 페이지나 마지막 페이지에서는 이전 버튼과 다음 버튼을 비활성화합니다.
			if (index === 0) {
				prev.setDisabled(true);
				home.setDisabled(true);
			} else {
				prev.setDisabled(false);
				home.setDisabled(false);
			}

			if (index === pages.length - 1) {
				next.setDisabled(true);
			} else {
				next.setDisabled(false);
			}

			// 메시지를 편집하여 새로운 페이지를 보여줍니다.
			await msg.edit({
				embeds: [pages[index]],
				components: [buttons],
			});

			// 수집기의 타이머를 리셋
			mc.resetTimer();

			// 수집기가 종료될 때 실행되는 이벤트 핸들러. 버튼 제거.
			mc.on('end', async () => {
				await msg.edit({
					embeds: [pages[index]],
					components: [],
				});
			});

			return msg;
		});
	} catch (err) {
		console.log(err);
	}
};