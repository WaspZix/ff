// src/player/DirectoryTrackPlayer.js

import {
  ActionRowBuilder,
  Guild,
  GuildMember,
  Message,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { tree } from "../utility/tree.js";
import { statSync } from "fs";
import { basename, relative, resolve } from "path";
import { okEmbed } from "../utility/embeds.js";
import { getOrCreateTrackPlayer } from "./TrackPlayer.js";
import { CodeError } from "../utility/CodeError.js";
import randomOf from "../utility/randomOf.js";

let cache = new Map();

class Menu {
  /**
   * Initialize interactive menu for choosing a file given a directory.
   *
   * @param {string} dirPath - The directory from where files will be chosen.
   * @param {GuildMember} member - The guild member who is allowed to interact with this menu.
   * @param {Message} invokerMessage - The message that invoked this Menu.
   */
  constructor(dirPath, member, invokerMessage) {
    this.dirPath = dirPath;
    this.member = member;
    this.invokerMessage = invokerMessage;

    this.channel = invokerMessage.channel;
    this.tree = tree(dirPath);
    this.indexEmbed = okEmbed(this.#generateMdIndex());

    this.actionRow = new ActionRowBuilder();
    this.menuMessage = null;
    this.interactionCount = 0;
    this.maxInteractions = this.tree.maxDepth * 3 + 5;
  }

  #segmentFilename(filename, defaultIndex) {
    const match = filename.match(/^(\d+\.)?\s*(.*?)(\.\w+)?$/);
    const index = match[1] ? Number(match[1].slice(0, -1)) : defaultIndex;
    const name = match[2] || filename;
    const extension = match[3] ? match[3].slice(1).toUpperCase() : "";
    return { index: index, name: name, extension: extension };
  }

  // Markdown index stuff
  #mdIndexFileDisplayName(segmented) {
    const { index: i, name, extension: ext } = segmented;
    return `${i.toString()}. \`[${ext.length ? ext : "N/A"}]\` ${name}`;
  }
  #exploreChild(node, indentation, lines) {
    lines.push(" ".repeat(indentation) + "- **" + node.dirname + "**");
    if (node.files.length) {
      indentation += indentation == 0 ? 2 : 3;
      node.files.forEach((filename, i) => {
        const segmented = this.#segmentFilename(filename, i + 1);
        const displayName = this.#mdIndexFileDisplayName(segmented);
        lines.push(" ".repeat(indentation) + displayName);
      });
    }
    node.directories.forEach((directory) => {
      this.#exploreChild(directory, indentation + 2, lines);
    });
  }
  #generateMdIndex() {
    const mdIndexLines = [];
    this.tree.files.forEach((filename, i) => {
      const segmented = this.#segmentFilename(filename, i + 1);
      const displayName = this.#mdIndexFileDisplayName(segmented);
      mdIndexLines.push(displayName);
    });
    this.tree.directories.forEach((directory) => {
      this.#exploreChild(directory, 2, mdIndexLines);
    });
    return (this.mdIndex = mdIndexLines.join("\n"));
  }

  // StringSelectMenu stuff
  #generateFolderSelectMenu(node, basePath = "") {
    const ret = new StringSelectMenuBuilder()
      .setCustomId("directory_track_selector_menu")
      .setPlaceholder(
        "i " +
          randomOf([
            "wonder",
            randomOf([
              "ponder",
              "sunder",
              "blunder",
              "thunder",
              "plumber",
              "lumber",
            ]),
          ])
      );

    if (node.parent) {
      ret.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(`⤴ ${node.parent.dirname}`)
          .setDescription("parent directory")
          .setValue(`${basePath}/..`)
          .setEmoji({ name: "📁" })
      );
    }
    node.files.forEach((filename, i) => {
      const { index, name, extension } = this.#segmentFilename(filename, i + 1);
      console.log(
        "attempting to set value for menu option",
        `${basePath}/${filename}`
      );
      ret.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(`${index}. ${name}`)
          .setDescription(extension.length ? extension : "no file extension")
          .setValue(`${basePath}/${filename}`)
          .setEmoji({ name: "🎵" })
      );
    });
    node.directories.forEach((directory) => {
      let desc = `${directory.files.length} files`;
      if (directory.directories.length)
        desc += ` and ${directory.directories.length} folders with ${
          directory.stsz - directory.files.length
        } files`;
      ret.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(`↪ ${directory.dirname}`)
          .setDescription(desc)
          .setValue(`${basePath}/${directory.dirname}`)
          .setEmoji({ name: "📁" })
      );
    });
    return ret;
  }

  async ask(
    basePath = this.dirPath,
    node = this.tree,
    invokingInteraction = null
  ) {
    this.actionRow.setComponents(
      this.#generateFolderSelectMenu(node, basePath)
    );

    if (!this.menuMessage)
      this.menuMessage = await this.channel.send({
        embeds: [this.indexEmbed],
        components: [this.actionRow],
      });
    if (invokingInteraction) {
      invokingInteraction.update({ components: [this.actionRow] });
    }

    try {
      const interaction = await this.menuMessage.awaitMessageComponent({
        filter: (interaction) => interaction.user.id === this.member.id,
        time: 1000 * Math.max(15, node.directories.length + node.files.length),
      });

      if (this.interactionCount++ > this.maxInteractions)
        throw CodeError(
          "INTERACTION_LIMIT_REACHED",
          "Interaction limit reached."
        );

      const [unresolvedPath] = interaction.values;
      const chosenTrackPath = relative(".", resolve(unresolvedPath));
      console.log(
        unresolvedPath,
        chosenTrackPath,
        resolve(unresolvedPath),
        resolve(".")
      );
      const stat = statSync(chosenTrackPath);

      if (stat.isDirectory())
        return this.ask(
          chosenTrackPath,
          node.map[basename(chosenTrackPath)],
          interaction
        );

      if (stat.isFile()) {
        this.menuMessage.delete();
        const { name, extension } = this.#segmentFilename(
          basename(chosenTrackPath)
        );
        return {
          chosenTrackPath,
          name: `${name} \`[${extension}]\``,
        };
      }

      throw CodeError(
        "INVALID_CHOICE",
        "Neither a file nor a directory was chosen."
      );
    } catch (error) {
      this.menuMessage.delete();

      if (
        error?.code === "InteractionCollectorError" &&
        error.message ===
          "Collector received no interactions before ending with reason: time"
      ) {
        const uSlow = await this.invokerMessage.reply("omg u slow?");
        setTimeout(() => uSlow.delete(), 5_000);
      } else if (
        error?.code === "INVALID_CHOICE" ||
        error?.code === "INTERACTION_LIMIT_REACHED"
      ) {
        const uRaterd = await this.invokerMessage.reply("omg u raterd?");
        setTimeout(() => uRaterd.delete(), 5_000);
      }

      console.error(
        "[prefix_commands/DirectoryTrackPlayer Menu::getUserChoice]:",
        error.message
      );
      return null;
    }
  }
}

//
//
//
//
//
//
//
//
//
//
class DirectoryTrackPlayer {
  /**
   * Initialize interactive music player for any directory and its tree in the system.
   *
   * @param {string} dirPath - The path to the directory containing audio tracks.
   * @param {Guild} guild - The discord server in which this player will operate.
   * @returns {DirectoryTrackPlayer} - A new instance of the DirectoryTrackPlayer class.
   */
  constructor(dirPath, guild) {
    const guildId = guild.id;
    const key = `${guildId}_${dirPath}`;
    if (cache.has(key)) return cache.get(key);

    this.dirPath = dirPath;
    this.guild = guild;
    this.guildId = guildId;

    this.player = getOrCreateTrackPlayer(guildId);

    this.interact = this.interact.bind(this);

    cache.set(key, this);
  }

  async interact(message) {
    const member = await message.guild.members.fetch(message.author.id);

    if (!this.player.connect(member)) {
      message.reply("I can't see you, where are you?");
      return;
    }

    const menu = new Menu(this.dirPath, member, message);
    const response = await menu.ask();
    console.log(response);

    if (!response) {
      return;
    }

    const { chosenTrackPath, name } = response;

    try {
      this.player.enqueue(name, chosenTrackPath, member, message.channel);
    } catch (error) {
      console.error(error.message);
    }
  }
}

export { DirectoryTrackPlayer };
