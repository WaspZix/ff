// src/utility/embeds.js

import { EmbedBuilder } from "discord.js";

export const RosePineColors = {
  Love: [235, 111, 146],
  Gold: [246, 193, 119],
  Rose: [234, 154, 151],
  Pine: [62, 143, 176],
  Foam: [156, 207, 216],
  Iris: [196, 167, 231],
};

const okColor = RosePineColors.Pine;
const ffColor = RosePineColors.Love;

export class RosePineEmbed extends EmbedBuilder {
  constructor(color = okColor) {
    super();
    this.setColor(color);
  }
}

export const okEmbed = (description = undefined) => {
  const ret = new RosePineEmbed().setColor(okColor);
  if (description) ret.setDescription(description);
  return ret;
};
export const ffEmbed = (description = undefined) => {
  const ret = new RosePineEmbed().setColor(ffColor);
  if (description) ret.setDescription(description);
  return ret;
};

export const embedMsg = (...embeds) => {
  return {
    embeds: [...embeds],
  };
};

export const okEmbedMsg = (description) => {
  return {
    embeds: [new RosePineEmbed().setColor(okColor).setDescription(description)],
  };
};
export const ffEmbedMsg = (description) => {
  return {
    embeds: [new RosePineEmbed().setColor(ffColor).setDescription(description)],
  };
};
