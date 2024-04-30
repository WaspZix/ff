// src/word_triggers/ff.js

import { Events } from "discord.js";
import fs from "fs";
import { roll } from "../utility/roll.js";
import { supabase } from "../utility/supabase.js";

const ffsTableExists = async (guild) => {
  const { data: tableExists, error } = await supabase.rpc("ffs_table_exists", {
    guild_id: guild.id,
  });

  if (error) {
    console.error(
      "[word_triggers/ff] Error checking for table:",
      error.message
    );
    return false;
  }

  return tableExists;
};

const createFFsTable = async (guild) => {
  const { error } = await supabase.rpc("create_ffs_table", {
    guild_id: guild.id,
  });

  if (error) {
    console.error("[word_triggers/ff] Error creating table:", error.message);
    return false;
  }

  console.log(`[word_triggers/ff] Table created for guild with id ${guild.id}`);
  return true;
};

let canLoseFF = true;
const loseFF = async (message) => {
  if (!canLoseFF) return;

  console.log(`[word_triggers/ff] ff waive detected ${message} ???`);

  const row = await (async () => {
    try {
      const row = {
        author_id: parseInt(message.author.id),
        author_handle: `${message.author.username}#${message.author.discriminator}`,
        time: new Date(), // You may adjust the timestamp as needed
        message: message.content,
        channel: parseInt(message.channelId),
        message_id: parseInt(message.id),
      };
      console.log(row);

      const { data, error } = await supabase
        .from(`ffs_${message.guild.id}`)
        .insert([row])
        .select();

      if (error) {
        console.error(
          "[word_triggers/ff] Error inserting message into ffs table:",
          error.message
        );
        return null;
      }

      console.log("[word_triggers/ff] Message inserted into ffs table:", data);
      return data[0];
    } catch (error) {
      console.error(
        "[word_triggers/ff] Error inserting message into ffs table:",
        error.message
      );
      return null;
    }
  })();

  if (Math.floor(row.ordinal / 10) % 10 === row.ordinal % 10) {
    message.channel.send(
      `the game has been lost ff ${row.ordinal} times GO NEXT`
    );
  } else {
    roll(
      1 / 20,
      () => {
        message.channel.send(`the lost ff has been game ${row.ordinal} times`);
      },
      () => {
        message.channel.send(`the game has been lost ff ${row.ordinal} times`);
      }
    );
  }

  let { ffTotalCount } = JSON.parse(fs.readFileSync(".config.json"));
  fs.writeFileSync(
    ".config.json",
    JSON.stringify({ ffTotalCount: ffTotalCount + 1 })
  );

  canLoseFF = false;
  setTimeout(() => (canLoseFF = true), 20000);
};

export default async function initFF(client) {
  for (const guild of client.guilds.cache.values()) {
    const alreadyExists = await ffsTableExists(guild);
    if (!alreadyExists) {
      await createFFsTable(guild);
    } else {
      console.log(
        `[word_triggers/ff] Table already exists for guild ${guild.name} with id ${guild.id}`
      );
    }
  }

  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return; // ignore bot messages

    const words = message.content.split(/\s+/).map((e) => e.toLowerCase());
    // console.log(words);

    if (canLoseFF && words.includes("ff")) await loseFF(message);
  });
}
