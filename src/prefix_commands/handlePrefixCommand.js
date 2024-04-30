// src/prefix_commands/handlePrefixCommand.js

import fs from "fs/promises";
import randomOf from "../utility/randomOf.js";
import { EmbedBuilder } from "@discordjs/builders";
import { joinVoiceChannel } from "@discordjs/voice";
import disconnectOnInactivity from "../utility/disconnectOnInactivity.js";
import oeis from "./oeis.js";

let commands = new Map();

// Send "ong" with an emoji
const ong = async (message) => {
  message.channel.send(
    `ong ${randomOf([
      ":skull:",
      ":japanese_goblin:",
      ":ghost:",
      ":man_gesturing_no:",
      ":no_entry:",
    ])}`
  );
};
commands.set("ong", ong);

// Send global ff count
const count = async (message) => {
  const { ffTotalCount: ret } = JSON.parse(await fs.readFile(".config.json"));
  message.channel.send(`mankind has had the game lost ff ${ret} times :skull:`);
};
commands.set("count", count);

// Connect to the member's voice channel
const cum = async (message) => {
  const member = await message.guild.members.fetch(message.author.id);
  const channel = member.voice.channel ?? null;

  if (!channel) {
    const embed = new EmbedBuilder()
      .setColor([180, 99, 122])
      .setDescription(
        `<@${message.author.id}> you are not connected to a voice channel.`
      );
    message.channel.send({ embeds: [embed] });
    return;
  }

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });
  disconnectOnInactivity(connection, channel);

  const embed = new EmbedBuilder()
    .setColor([86, 148, 159])
    .setDescription("womp womp");
  message.channel.send({ embeds: [embed] });
};
commands.set("cum", cum);

// Choose a random member among the tagged
const who = (message) => {
  const mentions = Array.from(message.mentions.users.entries());

  if (!mentions.length) {
    message.channel.send("asked");
    return;
  }

  const mostApe = randomOf(mentions)[1];
  message.channel.send(`<@${mostApe.id}> is the most ape here.`);
};
commands.set("who", who);

// List commands
const listCommands = (message) => {
  const commandsArr = Array.from(commands.entries());
  const desc =
    "commands:\n" +
    commandsArr.map((e) => "- " + e[0]).join("\n") +
    "\n\nauto:\n- type ff\n";
  const embed = new EmbedBuilder()
    .setColor([234, 157, 52])
    .setTitle("ff commands")
    .setDescription(desc)
    .setThumbnail(
      "https://cdn.discordapp.com/avatars/1227524353172836372/75eb8926930190313a00e83bb64068e6?size=1024"
    );

  message.channel.send({ embeds: [embed] });
};
commands.set("help", listCommands);
commands.set("commands", listCommands);

commands.set("oeis", oeis);

// export
const handlePrefixCommand = async (message) => {
  const command = message.words()[2];
  console.log("[prefix_commands/handlePrefixCommand] command:", command);

  if (commands.has(command)) {
    const f = commands.get(command);
    await f(message);
  }
};

export default handlePrefixCommand;
