// src/prefix_commands/commands/player/skip.js

import { getTrackPlayer } from "../../../player/TrackPlayer.js";

const skip = (message) => {
  const tp = getTrackPlayer(message.guildId);

  if (
    !(
      tp?.channel?.members.has(message.author.id) &&
      tp?.player.state.status === "playing"
    )
  ) {
    // TODO: error msg
    message.reply("nada");
    return;
  }

  const { path, member } = tp.queue[tp.npIndex];
  if (member.id === message.author.id) {
    tp.loop = false;
    tp.player.stop();
    message.react("👍");
  }
};

const aliases = [];

export { skip, aliases };
