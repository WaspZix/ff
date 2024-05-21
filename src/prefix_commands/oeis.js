// src/prefix_commands/oeis.js

import { EmbedBuilder } from "discord.js";
import randomOf from "../utility/randomOf.js";

const oeis = async (message) => {
  const numbers = message
    .words()
    .slice(1)
    .filter((word) => /^-?\d+$/.test(word));

  console.log("oeis:", numbers);

  if (!numbers.length) {
    const embed = new EmbedBuilder()
      .setColor([180, 99, 122])
      .setDescription(
        `<@${message.author.id}> are u ${randomOf(["ape", "not human"])}`
      );
    message.channel.send({ embeds: [embed] });
    return;
  }

  const embed = new EmbedBuilder();

  const query = numbers.join(", ");
  const oeisResponse = await (
    await fetch(`https://oeis.org/search?fmt=json&q=${query}`)
  ).json();

  let desc = "";
  desc += `query: ${query}\n`;

  if (oeisResponse.count > 0) {
    oeisResponse.results.forEach((seq, i) => {
      const Aid = "A" + String(seq.number).padStart(6, "0");
      desc += `### ${i + 1}. [\[${Aid}\]](https://oeis.org/${Aid}): ${
        seq.name
      }\n${seq.data.split(",").join(", ")}\n`;
    });
    embed.setColor([86, 148, 159]);
  } else {
    desc += "## your sequence dumb af niga.\n";
    embed.setColor([180, 99, 122]);
  }

  embed.setDescription(desc.slice(0, 4000));
  message.channel.send({ embeds: [embed] });
};

export default oeis;
