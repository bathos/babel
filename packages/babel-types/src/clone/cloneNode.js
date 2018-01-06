import { NODE_FIELDS } from "../definitions";

const has = Function.call.bind(Object.prototype.hasOwnProperty);
const isNode = obj => obj && has(NODE_FIELDS, obj.type);

function cloneIfNodeOrArray(obj) {
  if (isNode(obj)) return cloneNode(obj);
  if (Array.isArray(obj)) return obj.map(cloneIfNodeOrArray);
  return obj;
}

export default function cloneNode<T: Object>(node: T): T {
  if (!node) return node;

  const { type } = node;
  const newNode = (({ type }: any): T);

  // Special-case identifiers since they are the most cloned nodes.
  if (type === "Identifier") {
    newNode.name = node.name;
  } else if (!isNode(node)) {
    throw new Error(`Unknown node type: "${type}"`);
  } else {
    for (const field of Object.keys(NODE_FIELDS[type])) {
      if (has(node, field)) {
        newNode[field] = cloneIfNodeOrArray(node[field]);
      }
    }
  }

  if (has(node, "loc")) {
    newNode.loc = node.loc;
  }
  if (has(node, "leadingComments")) {
    newNode.leadingComments = node.leadingComments;
  }
  if (has(node, "innerComments")) {
    newNode.innerComments = node.innerCmments;
  }
  if (has(node, "trailingComments")) {
    newNode.trailingComments = node.trailingComments;
  }
  if (has(node, "extra")) {
    newNode.extra = shallowClone(node.extra);
  }

  return newNode;
}

function shallowClone<T: Object>(obj: T): T {
  const newObj = (({}: any): T);
  for (const key of Object.keys(obj)) newObj[key] = obj[key];
  return newObj;
}
