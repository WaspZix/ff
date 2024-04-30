// src/ff.js

import { Client, Events, GatewayIntentBits, Message } from "discord.js";
import dotenv from "dotenv";
import initFF from "./word_triggers/ff.js";
import initWordTriggers from "./word_triggers/initTriggers.js";
import isPrefixCommand from "./prefix_commands/isPrefixCommand.js";
import handlePrefixCommand from "./prefix_commands/handlePrefixCommand.js";
import { getWords } from "./utility/getWords.js";

// Create Message.words() function
Message.prototype.words = function () {
  if (this.wordsCache) {
    return this.wordsCache;
  }

  if (!this.content) {
    return (this.wordsCache = []);
  }

  return (this.wordsCache = getWords(this.content));

  // return (this.wordsCache = this.content
  //   .split(/\s+/)
  //   .map((e) => e.toLowerCase()));
};

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
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.on(Events.MessageCreate, async (message) => {
  if (message.content) {
    console.log("[ff.js] new message:", message.content, message.words());
  } else
    console.log(
      "[ff.js] new weird message:",
      message.embeds,
      message.attachments
    );
  if (isPrefixCommand(message)) {
    await handlePrefixCommand(message);
  }
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Client ready. Logged in as ${readyClient.user.tag}`);

  // Set username if not already
  if (!(client.user.username === "ff")) client.user.setUsername("ff");
  // Set avatar if not already
  if (!client.user.avatar) client.user.setAvatar("static/ff_pfp.png");
  // Set dnd status
  client.user.setStatus("dnd");
  // Initialize FF trigger
  await initFF(client);
  // Initialize other word triggers
  await initWordTriggers(client);
});

client.login(process.env.BOT_TOKEN);
