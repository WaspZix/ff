// src/utility/preventInGeneralChannel.js

const preventInGeneralChannel = (message) => {
  return message.channel.name !== "general";
};

export default preventInGeneralChannel;
