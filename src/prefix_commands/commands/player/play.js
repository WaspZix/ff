// src/prefix_commands/commands/player/play.js

import { DirectoryTrackPlayer } from "../../../player/DirectoryTrackPlayer.js";

const play = (message) => {
  new DirectoryTrackPlayer("static/deezbot", message.guild).interact(message);
};

const aliases = ["p"];

export { play, aliases };
