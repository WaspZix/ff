// src/prefix_commands/commands/rosepine.js

import { RosePineColors, RosePineEmbed } from "../../utility/embeds.js";

const rosepine = async (message) => {
  for (const color in RosePineColors) {
    message.channel.send({
      embeds: [
        new RosePineEmbed(RosePineColors[color]).setDescription(`${color}`),
      ],
    });
    await new Promise((resolve) => setTimeout(() => resolve(), 2000));
  }
};

export { rosepine };
