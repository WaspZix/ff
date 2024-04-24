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
  { cooldown: 10 }
);
const gg = new GenericWordTrigger(
  client,
  "gg",
  ({ message, count }) => {
    message.channel.send(
      `the game has been won gg ${count} times :sunglasses:`
    );
  },
  { cooldown: 10 }
);

const fer = new GenericWordTrigger(
  client,
  "fer",
  ({ message, count }) => {
    if (count % 10 == 0)
      message.channel.send(`ransom cuando fer x${count} :cold_face:`);
    else message.channel.send(`dariam cuando fer x${count}`);
  },
  {
    precheck: (message) => {
      return message.channel.name !== "general";
    },
  }
);

const animals = new GenericWordTrigger(
  client,
  ["apes", "pigs", "dogs"],
  ({ message, count, triggeringWord }) => {
    message.channel.send(`fokin animals x${count}`);
  },
  { id: "animals" }
);

const animal = new GenericWordTrigger(
  client,
  ["ape", "pig", "dog"],
  ({ message, count, triggeringWord }) => {
    const tag = message.words.find((word) => word.match(/<@\d+>/));
    if (tag) {
      message.channel.send(
        `${tag} u ${triggeringWord} beyond measurement x${count}`
      );
    } else {
      message.channel.send(
        `fokin ${triggeringWord} indeed not human x${count}`
      );
    }
  },
  { id: "ape_pig_dog" }
);

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Client ready. Logged in as ${readyClient.user.tag}`);

  if (!(client.user.username === "ff")) client.user.setUsername("ff");
  if (!client.user.avatar) client.user.setAvatar("static/ff_pfp.png");
  client.user.setStatus("dnd");

  await initFF(client);
  await wawa.init();
  await gg.init();
  await fer.init();
  await animals.init();
  await animal.init();
});

client.login(process.env.BOT_TOKEN);
