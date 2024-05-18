// src/player/TrackPlayer.js

import {
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  joinVoiceChannel,
  StreamType,
} from "@discordjs/voice";
import {
  ActionRowBuilder,
  EmbedBuilder,
  GuildMember,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextChannel,
} from "discord.js";
import { createReadStream, statSync } from "fs";
import {
  embedMsg,
  ffEmbed,
  okEmbed,
  okEmbedMsg,
  RosePineColors,
  RosePineEmbed,
} from "../utility/embeds.js";
import { CodeError } from "../utility/CodeError.js";

let cache = new Map();

class TrackPlayer {
  /**
   * Initialize player for a server.
   *
   * @param {string} guildId - The server id.
   */
  constructor(guildId) {
    if (cache.has(guildId)) return cache.get(guildId);

    this.guildId = guildId;

    this.player = createAudioPlayer();

    this.playing = false;
    this.npIndex = 0;
    this.queue = [null];
    this.channel = null;
    this.connection = null;

    this.loop = false;

    this.np = null;

    // Handle end of song
    this.player.on("idle", (oldState, newState) => {
      if (oldState.status !== "playing") return;
      this.#handleEndOfSong();
    });

    // Handle resume and start of new song
    this.player.on("playing", () => {
      this.#handlePlaying();
    });

    // Handle pause
    this.player.on("paused", (oldState, newState) => {
      console.log(this.npIndex, this.queue);
      const { name, member, channel } = this.queue[this.npIndex];
      channel.send(okEmbedMsg("Paused."));
    });

    cache.set(guildId, this);
  }

  #playSongAtIndex(index) {
    try {
      const { name, path, member, channel } = this.queue[index];

      const sourceStream = createReadStream(path);
      const audioResource = createAudioResource(sourceStream, {
        inputType: StreamType.Arbitrary,
      });

      console.log(index, audioResource);

      this.player.play(audioResource);
      this.npIndex = index;
    } catch (error) {
      console.error(error.message);
    }
  }

  #handleEndOfSong() {
    if (this.loop) {
      console.log(this.npIndex, this.queue, "playing loop");
      this.#playSongAtIndex(this.npIndex);
    } else if (this.npIndex < this.queue.length - 1) {
      console.log(this.npIndex, this.queue, "playing next");
      this.#playSongAtIndex(++this.npIndex);
    } else {
      this.queue[this.npIndex].channel.send(
        embedMsg(
          new RosePineEmbed(RosePineColors.Iris).setDescription(
            "no more tracks to play"
          )
        )
      );
    }
  }

  #handlePlaying() {
    console.log(this.npIndex, this.queue);
    const { name, member, channel } = this.queue[this.npIndex];
    channel
      .send({
        embeds: [
          new RosePineEmbed(RosePineColors.Foam)
            .setFields({ name: "Now playing", value: `${name}` })
            .setFooter({
              iconURL: `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`,
              text: `requested by ${member.user.username}.`,
            }),
        ],
        flags: [MessageFlags.SuppressNotifications],
      })
      .then((msg) => setTimeout(() => msg.delete(), 30_000));
  }

  enqueue(displayName, path, member, channel) {
    if (this.connection) {
      if (!this.channel.members.has(member.id)) {
        console.error(
          new Error("User not in this TrackPlayer's active voice channel.")
        );
        return false;
      }
    } else this.connect(member);

    this.queue.push({
      name: displayName,
      path: path,
      member: member,
      channel: channel,
    });
    console.log(this.queue);

    channel.send({
      embeds: [
        okEmbed()
          .setTitle("Pushed to queue")
          .setFields(
            { name: "Track", value: `${displayName}` },
            {
              name: "Position in upcoming",
              value: `${this.queue.length - 1 - this.npIndex}`,
            }
          )
          .setFooter({
            iconURL: `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`,
            text: `requested by ${member.user.username}.`,
          }),
      ],
    });

    if (this.player.state.status === "idle") {
      this.#playSongAtIndex(++this.npIndex);
    }
    return true;
  }

  startover() {
    this.#playSongAtIndex(this.npIndex);
  }

  /**
   * Connect to a member's voice channel.
   *
   * @param {GuildMember} member - The member whose voice channel should be connected to.
   * @returns {Boolean} true if process successful, false otherwise.
   */
  connect(member) {
    const channel = member.voice.channel ?? null;
    if (!channel) {
      console.error(
        CodeError("USER_NOT_IN_VC", "User is not connected to a voice channel.")
      );
      return false;
    }

    try {
      if (!this.channel) {
        this.connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
        });
        this.channel = channel;

        this.connection.on("stateChange", (oldState, newState) =>
          console.log("WAWWW STATE CHANGED", oldState, newState)
        );
        this.connection.subscribe(this.player);
      } else if (this.channel !== channel) {
        throw CodeError(
          "ACTIVE_ALREADY",
          "Active already in other voice channel."
        );
      }
    } catch (error) {
      console.error(error);
      return false;
    }

    return true;
  }

  // play() {
  //   if (!this.connection) {
  //     console.error("if (!this.connection) ");
  //     return false;
  //   }

  //   if (this.player.state.status === "playing") {
  //     console.error(" if (this.playing) ");
  //     return true;
  //   }

  //   console.log(this.play);

  //   if (this.npStatus === "FINISHED") {
  //     this.npStatus = "NOT_STARTED";
  //     this.npIndex++;
  //   }

  //   if (this.npIndex >= this.queue.length) {
  //     console.error(new Error("Out of bounds."));
  //     console.log(this);
  //     return false;
  //   }

  //   this.#playSongAtIndex(this.npIndex);
  //   this.playing = true;
  //   this.npStatus = "PLAYING";
  //   return true;
  // }
}

const getTrackPlayer = (guildId) => {
  return cache.has(guildId) ? cache.get(guildId) : undefined;
};

const getOrCreateTrackPlayer = (guildId) => {
  return cache.has(guildId) ? cache.get(guildId) : new TrackPlayer(guildId);
};

export { TrackPlayer, getTrackPlayer, getOrCreateTrackPlayer };
