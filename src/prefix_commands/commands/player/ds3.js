// src/prefix_commands/commands/player/ds3.js

import { DirectoryTrackPlayer } from "../../../player/DirectoryTrackPlayer.js";

const ds3 = (message) => {
  new DirectoryTrackPlayer("static/ds3", message.guild).interact(message);
};

const aliases = ["darksouls3"];

export { ds3, aliases };
