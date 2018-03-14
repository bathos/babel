import { types as t } from "@babel/core";
import splitExportDeclaration from "@babel/helper-split-export-declaration";

function hasDecorators(node) {
  if (node.decorators && node.decorators.length > 0) return true;

  const body = node.body.body;
  for (let i = 0; i < body.length; i++) {
    const method = body[i];
    if (!t.isClassMethod(method)) continue;
    if (method.decorators && method.decorators.length > 0) {
      return true;
    }
  }

  return false;
}

function extractDecorators(node) {
  let result;
  if (node.decorators && node.decorators.length > 0) {
    result = t.arrayExpression(node.decorators.map(n => n.expression));
  }
  node.decorators = undefined;
  return result;
}

function prop(key, value) {
  if (typeof key === "string") key = t.identifier(key);
  if (typeof value === "string") value = t.stringLiteral(value);
  return t.objectProperty(key, value);
}

export default {
  ClassDeclaration(path) {
    if (!hasDecorators(path.node)) return;

    if (path.parentPath.isExportDefaultDeclaration()) {
      if (!path.node.id) {
        t.toExpression(path.node);
        path.requeue();
        return;
      } else {
        path = splitExportDeclaration(path.parentPath);
      }
    }

    path.replaceWith(
      t.variableDeclaration("let", [
        t.variableDeclarator(
          t.cloneNode(path.node.id),
          t.toExpression(path.node),
        ),
      ]),
    );
  },

  ClassExpression(path) {
    const { node } = path;
    if (!hasDecorators(node)) return;

    const elements = [];
    for (const d of node.body.body) {
      if (
        t.isClassMethod(d) &&
        !d.static &&
        !d.computed &&
        d.key.name === "constructor"
      ) {
        continue;
      }

      const properties = [];

      const decorators = extractDecorators(d);
      if (decorators) {
        properties.push(prop("decorators", decorators));
      }

      let key;
      if (d.computed) {
        key = d.key;
      } else if (t.isIdentifier(d.key)) {
        key = d.key.name;
      } else if (t.isNumericLiteral(d.key)) {
        key = d.key.value;
      } else {
        throw new Error("Unexpected id");
      }
      properties.push(prop("key", key));

      const placement = d.static ? "static" : "prototype";
      properties.push(prop("placement", placement));

      elements.push(t.objectExpression(properties));
    }

    const helper = this.addHelper("decorate");
    const arr = t.arrayExpression(elements);
    arr._compact = true;
    const args = [node, arr];

    const decorators = extractDecorators(node);
    if (decorators) args.push(decorators);

    path.replaceWith(t.callExpression(helper, args))[0].skip();
  },
};
