// src/utility/getWords.js

const concat = (arr) => {
  return arr.join("");
};

// own version of [:punct:]
export const punct = concat([
  "\\[" + "\\!" + '\\"' + "\\#" + "\\$",
  "\\%" + "\\&" + "\\'" + "\\(" + "\\)",
  "\\*" + "\\+" + "\\," + "\\\\" + "\\-",
  "\\." + "\\/" + "\\:" + "\\;" + "\\<",
  "\\=" + "\\>" + "\\?" + "\\@" + "\\[",
  "\\]" + "\\^" + "\\_" + "\\`" + "\\{",
  "\\|" + "\\}" + "\\~" + "\\]",
]);

// filter
const re = new RegExp(
  concat([
    // discard possible leading whitespace
    "\\s*",
    // start capture group
    "(",
    // ellipsis (must appear before punct)
    "\\.{3}",
    // alternator
    "|",
    // hyphenated words (must appear before punct)
    "\\w+\\-\\w+",
    // alternator
    "|",
    // compound words (must appear before punct)
    "\\w+'(?:\\w+)?",
    // alternator
    "|",
    // other words
    "\\w+",
    // alternator
    "|",
    // punct
    "[" + punct + "]",
    // end capture group
    ")",
  ])
);

export function getWords(str) {
  if (!str.length) return [];

  //   return str.split(re);
  return str
    .split(re)
    .filter((word) => word.trim() !== "" && word !== " ")
    .map((word) => word.toLowerCase());
}
