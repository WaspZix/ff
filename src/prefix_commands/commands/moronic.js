// src/prefix_commands/commands/moronic.js

const moronic = (message) => {
  const mentions = [...message.mentions.users.keys()].map((e) => `<@${e}>`);
  const s = mentions.length > 1 ? "s" : "";
  message.reply(
    `fokin pig${s} turbo reject dog${s} absolute garbage moronic ape${s} beyond measurement` +
      (mentions.length ? " " + mentions.join(" ") : "")
  );
  console.log(
    Array.from(message.mentions.users).map(([id, e]) => id),
    Array.from(message.mentions.members).map(([id, e]) => id),
    [...message.mentions.users.keys()],
    [...message.mentions.members.keys()]
  );
};

const aliases = ["beyondmeasurement"];

export { moronic, aliases };
