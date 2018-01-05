// @flow

import cloneNode from "./cloneNode";

export default function clone<T: Object>(node: T): T {
  console.trace("t.clone is deprecated; use t.cloneNode instead.");
  return cloneNode(node);
}
