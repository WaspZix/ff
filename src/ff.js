// src/ff.js

import { Client, Events, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import initFF from "./word_triggers/ff.js";
import GenericWordTrigger from "./word_triggers/generic_word_trigger.js";

// Load .env
dotenv.config();

// Initialize bot client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.MessageContent,
  ],
});

const wawa = new GenericWordTrigger(
  client,
  "wawa",
  (message, count) => {
    message.channel.send(`the wawa has been lost ff ${count} times GO NEXT`);
  },
  10
);
const gg = new GenericWordTrigger(
  client,
  "gg",
  (message, count) => {
    message.channel.send(
      `the game has been won gg ${count} times :sunglasses:`
    );
  },
  10
);

const fer = new GenericWordTrigger(client, "fer", (message, count) => {
  if (count % 10 == 0)
    message.channel.send(`ransom cuando fer x${count} :cold_face:`);
  else message.channel.send(`dariam cuando fer x${count}`);
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Client ready. Logged in as ${readyClient.user.tag}`);

  if (!(client.user.username === "ff")) client.user.setUsername("ff");
  if (!client.user.avatar) client.user.setAvatar("static/ff_pfp.png");
  client.user.setStatus("dnd");

  await initFF(client);
  await wawa.init();
  await gg.init();
  await fer.init();
});

client.login(process.env.BOT_TOKEN);
