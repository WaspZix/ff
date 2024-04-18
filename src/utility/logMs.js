// src/utility/logMs.js

export const logMs = async (label, code) => {
  console.time(label);
  const ret = await code();
  console.timeEnd(label);
  return ret;
};
