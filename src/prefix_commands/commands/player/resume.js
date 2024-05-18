// src/prefix_commands/commands/player/resume.js

import { AudioPlayerStatus } from "@discordjs/voice";
import { getTrackPlayer } from "../../../player/TrackPlayer.js";
import {
  embedMsg,
  ffEmbedMsg,
  okEmbedMsg,
  RosePineColors as C,
  RosePineEmbed as RPE,
} from "../../../utility/embeds.js";

const resume = (message) => {
  const tp = getTrackPlayer(message.guildId);

  if (!tp || !tp.channel || !tp.channel.members.has(message.author.id)) {
    // TODO: error msg
    message.reply("nada");
    return;
  }

  if (
    tp.player.state.status !== AudioPlayerStatus.Paused &&
    tp.player.state.status !== AudioPlayerStatus.AutoPaused
  )
    message.channel.send(
      embedMsg(new RPE(C.Iris).setDescription("Not paused."))
    );
  else {
    console.log(tp.player.state);
    if (tp.player.unpause()) {
      // message.channel.send(okEmbedMsg("Unpaused."));
      message.react("✅");
    } else message.channel.send(ffEmbedMsg("xd couldn't pause"));
  }
};

const aliases = ["unpause"];

export { resume, aliases };
