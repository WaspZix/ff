// src/prefix_commands/commands/player/nowplaying.js

import { AttachmentBuilder, basename, EmbedBuilder } from "discord.js";
import { getTrackPlayer } from "../../../player/TrackPlayer.js";
import { okEmbed } from "../../../utility/embeds.js";
import * as mm from "music-metadata";

const PROGRESSBAR_LENGTH = 24;

const nowplaying = async (message) => {
  const tp = getTrackPlayer(message.guildId);

  if (!tp || !["playing", "paused"].includes(tp.player.state.status)) {
    // TODO: error msg
    message.reply("nada");
    return;
  }

  const { path, member } = tp.queue[tp.npIndex];
  console.log("MEMBER", member);

  console.log(path);
  const metadata = await mm.parseFile(path);
  console.log(metadata);

  const playedMillis = tp.player.state.playbackDuration;
  const trackTotalMillis = metadata.format.duration * 1000;

  let progressBar = Array.from({ length: PROGRESSBAR_LENGTH }, () => "-");
  const pbi = Math.min(
    PROGRESSBAR_LENGTH - 1,
    Math.floor((PROGRESSBAR_LENGTH * playedMillis) / trackTotalMillis)
  );
  progressBar[pbi] = "⏺";
  for (let i = 0; i < pbi; i++) progressBar[i] = "=";

  const v1 = fmtSecs(Math.floor(playedMillis / 1000));
  const v2 = fmtSecs(Math.floor(trackTotalMillis / 1000));
  const st = tp.player.state.status;
  let title = `${st[0].toUpperCase() + st.slice(1)} in ${tp.channel}`;
  if (tp.loop) title += " (loop)";
  const embed = okEmbed(
    `> **${metadata.common.title ?? basename(path)}**\n> ${
      metadata.common.artists?.join(", ") ?? "Unknown"
    }\n> \uffa0`
  )
    .setTitle(title)
    .addFields(
      // {
      //   name: `> ${metadata.common.title ?? basename(path)}`,
      //   value: `> ${metadata.common.artist ?? "Unknown"}`,
      // },
      // 2.314
      // {
      //   name: `\uffa0${" ".repeat(14)}${v1} / ${v2}`,
      //   value: `\`${progressBar.join("")}\``,
      // },
      // {
      //   name: `<:clear:1240995566364659772> ${fmtSecs(
      //     Math.floor(playedMillis / 1000)
      //   )} <:clear:1240995566364659772> / <:clear:1240995566364659772> ${fmtSecs(
      //     Math.floor(trackTotalMillis / 1000)
      //   )}`,
      //   value: `\`${progressBar.join("")}\``,
      // },
      {
        name: `> Elapsed ${v1} / ${v2}`,
        value: `\`${progressBar.join("")}\``,
      }
      // {
      //   name: `${fmtSecs(Math.floor(trackTotalMillis / 1000))}`,
      //   value: `\`${Math.floor((playedMillis / trackTotalMillis) * 100)}%\``,
      //   inline: true,
      // }
    )
    .setFooter({
      iconURL: `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`,
      text: `requested by ${member.user.username}`,
    });

  if (!metadata.common.picture?.length) {
    message.channel.send({ embeds: [embed] });
    return;
  }

  const picture = metadata.common.picture[0];
  const buffer = picture.data;
  const imageName = `cover.${picture.format.split("/")[1]}`;

  const attachment = new AttachmentBuilder(buffer).setName(imageName);
  embed.setThumbnail(`attachment://${attachment.name}`);

  message.channel.send({ embeds: [embed], files: [attachment] });
};
function fmtSecs(totalSeconds) {
  const seconds = totalSeconds % 60;
  const minutes = Math.floor((totalSeconds - seconds) / 60) % 60;
  const hours = Math.floor((totalSeconds - 60 * minutes - seconds) / 60) % 60;

  let ret = "";
  if (hours) ret += (ret === "" ? "" : ":") + hours.toString();
  ret += (ret === "" ? "" : ":") + minutes.toString().padStart(2, "0");
  ret += (ret === "" ? "" : ":") + seconds.toString().padStart(2, "0");

  return ret;
}

const aliases = ["np"];

export { nowplaying, aliases };
