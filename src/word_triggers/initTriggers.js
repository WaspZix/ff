// src/word_triggers/initWordTriggers.js

import preventInGeneralChannel from "../utility/preventInGeneralChannel.js";
import GenericWordTrigger from "./GenericWordTrigger.js";

const initWordTriggers = async (client) => {
  const wawa = new GenericWordTrigger(
    client,
    "wawa",
    ({ message, count }) => {
      message.channel.send(`the wawa has been lost ff ${count} times GO NEXT`);
    },
    { cooldown: 10 }
  );

  const gg = new GenericWordTrigger(
    client,
    "gg",
    ({ message, count }) => {
      message.channel.send(
        `the game has been won gg ${count} times :sunglasses:`
      );
    },
    { cooldown: 10 }
  );

  let fer = new GenericWordTrigger(
    client,
    "fer",
    ({ message, count }) => {
      if (count % 10 == 0)
        message.channel.send(`ransom cuando fer x${count} :cold_face:`);
      else message.channel.send(`dariam cuando fer x${count}`);
    },
    {
      precheck: preventInGeneralChannel,
    }
  );

  const animals = new GenericWordTrigger(
    client,
    ["apes", "pigs", "dogs"],
    ({ message, count, triggeringWord }) => {
      message.channel.send(`fokin animals x${count}`);
    },
    { id: "animals" }
  );

  const animal = new GenericWordTrigger(
    client,
    ["ape", "pig", "dog"],
    ({ message, count, triggeringWord }) => {
      const tag = message.words().find((word) => word.match(/<@\d+>/));
      if (tag) {
        message.channel.send(
          `${tag} u ${triggeringWord} beyond measurement x${count}`
        );
      } else {
        message.channel.send(
          `fokin ${triggeringWord} indeed not human x${count}`
        );
      }
    },
    { id: "ape_pig_dog" }
  );

  await wawa.init();
  await gg.init();
  await fer.init();
  await animals.init();
  await animal.init();
};

export default initWordTriggers;
