// Dependencies
const { MessageEmbed } = require('discord.js'),
	Event = require('../../structures/Event');

module.exports = class GuildCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, guild) {
		// LOG server Join
		bot.logger.log(`[GUILD JOIN] ${guild.name} (${guild.id}) added the bot.`);

		// Apply server settings
		try {
			const newGuild = {
				guildID: guild.id,
				guildName: guild.name,
			};

			// Create guild settings and fetch cache.
			await bot.CreateGuild(newGuild);
			await guild.fetchGuildConfig();
		} catch (err) {
			bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		// Send message to channel that bot has joined a server
		const owner = await guild.members.fetch(guild.ownerID);
		const embed = new MessageEmbed()
			.setTitle(`[GUILD JOIN] ${guild.name}`)
			.setImage(guild.iconURL({ dynamic: true, size: 1024 }))
			.setDescription([
				`Guild ID: ${guild.id}`,
				`Owner: ${owner.user.tag}`,
				`MemberCount: ${guild.memberCount}`,
			].join('\n'));

		// Fetch all members in guild
		try {
			await guild.members.fetch();
		} catch (err) {
			bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		// Find channel and send message
		const modChannel = await bot.channels.fetch(bot.config.SupportServer.GuildChannel).catch(() => bot.logger.error(`Error fetching guild: ${guild.id} logging channel`));
		if (modChannel) bot.addEmbed(modChannel.id, embed);

		// update bot's activity
		bot.SetActivity([`${bot.guilds.cache.size} servers!`, `${bot.users.cache.size} users!`], 'WATCHING');
	}
};
