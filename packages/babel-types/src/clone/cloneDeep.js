// @flow

import cloneNode from "./cloneNode";

export default function cloneDeep<T: Object>(node: T): T {
  console.warn("t.cloneDeep is deprecated; use t.cloneNode instead.");
  return cloneNode(node);
}
