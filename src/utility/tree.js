// src/utility/tree.js

import { readdirSync, statSync } from "fs";
import { basename, join } from "path";

const tree = (dirPath) => {
  let children;
  try {
    children = readdirSync(dirPath);
  } catch (error) {
    console.error(
      `[utility/tree] error opening directory ${dirPath}`,
      error.message
    );
  }

  let files = [];
  let directories = [];
  let map = {};
  const ret = {
    path: dirPath,
    dirname: basename(dirPath),
    files: files,
    directories: directories,
    map: map,

    subtreeSize: 0,
    maxDepth: 1,
  };

  children.forEach((child) => {
    const childPath = join(dirPath, child);
    const stat = statSync(childPath);

    if (stat.isDirectory()) {
      const childTree = tree(childPath);
      directories.push(childTree);
      map[child] = childTree;

      ret.subtreeSize += childTree.subtreeSize;
      ret.maxDepth = Math.max(ret.maxDepth, childTree.maxDepth);

      childTree.parent = ret;
      childTree.map[".."] = childTree.parent;
    } else files.push(child);
  });

  directories.sort();
  files.sort();
  ret.subtreeSize += files.length;

  // console.log(ret);
  return ret;
};

export { tree };
