// src/prefix_commands/commands/player/pause.js

import { AudioPlayerStatus } from "@discordjs/voice";
import { getTrackPlayer } from "../../../player/TrackPlayer.js";
import {
  embedMsg,
  ffEmbedMsg,
  okEmbedMsg,
  RosePineColors as C,
  RosePineEmbed as RPE,
} from "../../../utility/embeds.js";

const pause = (message) => {
  const tp = getTrackPlayer(message.guildId);

  if (!tp || !tp.channel || !tp.channel.members.has(message.author.id)) {
    // TODO: error msg
    message.reply("nada");
    return;
  }

  if (tp.player.state.status === AudioPlayerStatus.Paused)
    message.channel.send(
      embedMsg(new RPE(C.Iris).setDescription("Already paused."))
    );
  else {
    console.log(tp.player.state);
    if (tp.player.pause()) {
      // message.channel.send(okEmbedMsg("Paused."));
      message.react("✅");
    } else message.channel.send(ffEmbedMsg("xd couldn't pause"));
  }
};

export { pause };
