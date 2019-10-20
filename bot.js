/*
requires node.js: https://nodejs.org/en/download/
requires discord.js: npm install discord.js
create bot token here: https://discordapp.com/developers/applications/
*/


const config = require('./.config.json');
const Discord = require('discord.js');
const client = new Discord.Client();

const pCompanyId = new RegExp('^.* \\(' + config.companyId + '\\)');
const mentionRole =  (config.mentionRole) ?  config.mentionRole : null;
const ttsRateLimit = 2 * 60 * 1000; // 2 minutes in milliseconds

let lastAlert = null;
      
client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('error', function (err) { console.log('discord.js error:', err); });

client.on('message', msg => {

	// ignores bots (and self)
	if(msg.author.bot)
	{
//		msg.channel.send(`pCompanyId debug: ${pCompanyId}`);	
		if (pCompanyId.test(msg.content))
		{
//			msg.channel.send(`pCompanyId pattern success.`);
			let role = "";
			if (mentionRole)
			{
				role = msg.channel.guild.roles.find(role => role.name === mentionRole);
				if (!role)
					role = "";
			}

//			msg.channel.send(`Role debug: ${role}`);
			const now = +new Date();
			// if this is too greedy then use Your [^\n]* instead of .*
			// TTS: msg.channel.send('message text', {tts: true})
			if (/Your '.*(Swivel|Plank|Stone|Cannon|Puckle|Bed|Sail|Deck).*' was destroyed!/.test(msg.content) ||
			   /Your 'Mortar' was destroyed!/.test(msg.content))
			{
				if (!lastAlert || now - lastAlert > ttsRateLimit)
				{
					let result = msg.content.match(/Your '.*(Swivel|Plank|Stone|Cannon|Puckle|Bed|Sail|Deck|Mortar).*' was destroyed!/);
					if (result && result.length > 1)
					{
						msg.channel.send(`${role} ${result[0]}`, {tts:true});
					}
					else
						msg.channel.send(`${role} 🚨 Possible Attack Detected 🚨`, {tts:true});
				}
				else
					msg.channel.send(`${role} 🚨 Possible Attack Detected 🚨`);
				lastAlert = +new Date();
			}
			
			if (/has become a settler in your Settlement/.test(msg.content))
			{
				if (!lastAlert || now - lastAlert > ttsRateLimit)
					msg.channel.send(`${role} 📢 New settler in log 📢`, {tts:true});
				else
					msg.channel.send(`${role} 📢 New settler in log 📢`);					
				lastAlert = +new Date();
			}
		}
	}
	
  const args = msg.content.trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if (command === "!debug")
  {
    msg.channel.send('Foobar ${pCompanyId} ${mentionRole}');
  }
  
});

client.login(config.token)
	.then(console.log)
	.catch(console.error);