import { NODE_FIELDS } from "../definitions";

const has = Function.call.bind(Object.prototype.hasOwnProperty);
const isNode = obj => obj && has(NODE_FIELDS, obj.type);

export default function cloneNode<T: Object>(node: T): T {
  if (!node) return node;

  // Special-case identifiers since they are the most cloned nodes.
  if (node.type === "Identifier") {
    return {
      type: "Identifier",
      name: node.name,
    };
  }

  if (!isNode(node)) {
    throw new Error(`Unknown node type: "${node.type}"`);
  }

  const newNode = (({
    type: node.type,
  }: any): T);
  for (const field in NODE_FIELDS[node.type]) {
    if (has(node, field)) {
      newNode[field] = isNode(node[field])
        ? cloneNode(node[field])
        : node[field];
    }
  }

  newNode.loc = node.loc || null;

  return newNode;
}
