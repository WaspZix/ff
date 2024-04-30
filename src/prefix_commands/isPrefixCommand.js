// src/prefix_commands/isPrefixCommand.js

import { prefix } from "./consts.js";

const isPrefixCommand = (message) => {
  return message.content.length >= 3 && message.content.slice(0, 3) === prefix;
};

export default isPrefixCommand;
