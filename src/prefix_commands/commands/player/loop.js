// src/prefix_commands/commands/player/loop.js

import { getTrackPlayer } from "../../../player/TrackPlayer.js";
import { okEmbedMsg } from "../../../utility/embeds.js";

const loop = (message) => {
  const tp = getTrackPlayer(message.guildId);

  if (!tp?.channel?.members.has(message.author.id)) {
    // TODO: error msg
    message.reply("nada");
    return;
  }

  tp.loop ^= true;
  message.channel.send(
    okEmbedMsg(`Loop is now **${tp.loop ? "enabled" : "disabled"}**.`)
  );
};

const aliases = [];

export { loop, aliases };
