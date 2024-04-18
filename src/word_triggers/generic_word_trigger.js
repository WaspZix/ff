// src/word_triggers/generic_word_trigger.js

import { supabase } from "../utility/supabase.js";
import { Events } from "discord.js";

let onGeneralCooldown = false;

export default class GenericWordTrigger {
  constructor(client, word, xd, cooldown = 2) {
    this.client = client;
    this.word = word.toLowerCase();
    this.xd = xd;
    this.cooldown = cooldown ? cooldown * 1000 : 1200;

    this.onCooldown = false;
    this.handle = async (message) => {
      if (message.author.bot) {
        return;
      }

      if (onGeneralCooldown) {
        console.log(
          "word_triggers/generic: on general cooldown",
          word,
          this.cooldown
        );
        return;
      }
      if (this.onCooldown) {
        console.log("word_triggers/generic: on cooldown", word, this.cooldown);
        return;
      }

      if (!message.words) {
        message.words = message.content
          .split(/\s+/)
          .map((e) => e.toLowerCase());
        console.log("word_triggers/generic:", message.words);
      }

      if (message.words.includes(this.word)) {
        onGeneralCooldown = true;
        setTimeout(() => (onGeneralCooldown = false), 1200);
        this.onCooldown = true;
        setTimeout(() => (this.onCooldown = false), this.cooldown);

        const { data, error } = await supabase.rpc("increment_count", {
          id: word,
          guild_id: message.guild.id,
        });

        if (error) {
          console.error(
            "word_triggers/generic: Error with function increment_count:",
            error.message
          );
          return null;
        }

        console.log("word_triggers/generic:", data);

        await xd(message, data.count);
      }
      return;
    };
  }

  async init() {
    this.client.on(Events.MessageCreate, this.handle.bind(this));
  }
}
