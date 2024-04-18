// src/utility/roll.js

export const roll = (probability, task, callback) => {
  if (Math.random() <= probability) task();
  else callback();
};
