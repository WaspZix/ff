// src/word_triggers/GenericWordTrigger.js

import { supabase } from "../utility/supabase.js";
import { Events } from "discord.js";

let onGeneralCooldown = false;

export default class GenericWordTrigger {
  constructor(client, words, xd, { id, cooldown, precheck } = {}) {
    this.client = client;
    this.words = Array.isArray(words)
      ? words.map((word) => word.toLowerCase())
      : [words.toLowerCase()];
    this.xd = xd;
    this.precheck = precheck
      ? precheck
      : (message) => {
          return true;
        };

    this.cooldown = cooldown ? cooldown * 1000 : 1200;
    this.id = id ? id : this.words[0];

    this.onCooldown = false;
    this.handle = async (message) => {
      if (message.author.bot) {
        return;
      }

      if (!this.precheck(message)) {
        return;
      }

      if (onGeneralCooldown) {
        console.log(
          "word_triggers/generic: on general cooldown",
          words,
          this.cooldown
        );
        return;
      }
      if (this.onCooldown) {
        console.log("word_triggers/generic: on cooldown", words, this.cooldown);
        return;
      }

      if (this.words.some((word) => message.words().includes(word))) {
        const triggeringWord = this.words.find((word) =>
          message.words().includes(word)
        );
        console.log("word_triggers/generic: triggering word ", triggeringWord);
        onGeneralCooldown = true;
        setTimeout(() => (onGeneralCooldown = false), 1200);
        this.onCooldown = true;
        setTimeout(() => (this.onCooldown = false), this.cooldown);

        const { data, error } = await supabase.rpc("increment_count", {
          id: this.id,
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

        await this.xd({
          message: message,
          count: data.count,
          triggeringWord: triggeringWord,
        });
      }
      return;
    };
  }

  async init() {
    this.client.on(Events.MessageCreate, this.handle);
  }
}
