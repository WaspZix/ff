const { Client, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("./.config.json");
const fs = require("fs");
const { roll } = require("./utility/roll");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);

  if (!(client.user.username === "ff")) client.user.setUsername("ff");
  if (!client.user.avatar) client.user.setAvatar("./ff_pfp.png");
  client.user.setStatus("dnd");
});

let ffCount = 0;
let canLoseFF = true;

const loseFF = (message) => {
  if (!canLoseFF) return;

  console.log(`x fokin d? ${message} ???`);

  let { ffCountProto: ffCount } = JSON.parse(fs.readFileSync("./.config.json"));

  roll(
    1 / 20,
    () => {
      message.channel.send(`the lost ff has been game ${++ffCount} times`);
    },
    () => {
      message.channel.send(`the game has been lost ff ${++ffCount} times`);
    }
  );

  fs.writeFileSync(
    "./.config.json",
    JSON.stringify({ token: token, ffCountProto: ffCount })
  );

  canLoseFF = false;
  setTimeout(() => (canLoseFF = true), 30000);
};

client.on(Events.MessageCreate, (message) => {
  if (message.author.bot) return;

  const words = message.content.split(/\s+/).map((e) => e.toLowerCase());
  console.log(words);

  if (canLoseFF && words.includes("ff")) loseFF(message);
});

client.login(token);
