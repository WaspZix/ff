const roll = (probability, task, callback) => {
  if (Math.random() <= probability) task();
  else callback();
};

module.exports = { roll };
