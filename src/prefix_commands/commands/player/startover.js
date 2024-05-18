// src/prefix_commands/commands/player/startover.js

import { getTrackPlayer } from "../../../player/TrackPlayer.js";

const startover = (message) => {
  const tp = getTrackPlayer(message.guildId);

  if (!tp?.channel?.members.has(message.author.id)) {
    // TODO: error msg
    message.reply("nada");
    return;
  }

  const st = tp.player.state.status;
  if (["playing", "paused", "idle"].includes(st)) {
    tp.startover();
    message.react("✅");
  }
};

const aliases = ["so"];

export { startover, aliases };
