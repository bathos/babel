import { types as t } from "@babel/core";
import splitExportDeclaration from "@babel/helper-split-export-declaration";

function prop(key, value) {
  return t.objectProperty(t.identifier(key), value);
}

function hasDecorators({ node }) {
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

function extractDecorators({ node }) {
  let result;
  if (node.decorators && node.decorators.length > 0) {
    result = t.arrayExpression(node.decorators.map(n => n.expression));
  }
  node.decorators = undefined;
  return result;
}

function getSingleElementDefinition(path) {
  const { node } = path;
  const properties = [];

  let key;
  if (node.computed) {
    if (!t.isImmutable(node.key)) {
      key = path.scope.maybeGenerateMemoised(node.key);
    }
    if (key) {
      path.set("key", t.assignmentExpression("=", t.cloneNode(key), node.key));
    } else {
      key = t.cloneNode(node.key);
    }
  } else {
    switch (node.key.type) {
      case "Identifier":
        key = t.stringLiteral(node.key.name);
        break;
      case "NumericLiteral":
      case "StringLiteral":
        key = t.stringLiteral(String(node.key.value));
        break;
      default:
        throw new Error("Unexpected id");
    }
  }
  properties.push(prop("key", key));

  const placement = node.static ? "static" : "prototype";
  properties.push(prop("placement", t.stringLiteral(placement)));

  const decorators = extractDecorators(path);
  if (decorators) {
    properties.push(prop("decorators", decorators));
  }

  return t.objectExpression(properties);
}

function getElementsDefinitions(path) {
  const elements = [];
  for (const p of path.get("body.body")) {
    if (
      p.isClassMethod({ static: false, computed: false }) &&
      p.get("key").isIdentifier({ name: "constructor" })
    ) {
      continue;
    }

    elements.push(getSingleElementDefinition(p));
  }

  return t.arrayExpression(elements);
}

export default {
  ClassDeclaration(path) {
    if (!hasDecorators(path)) return;

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
    if (!hasDecorators(path)) return;

    const helper = this.addHelper("decorate");
    const args = [
      path.node,
      extractDecorators(path) || t.arrayExpression([]),
      getElementsDefinitions(path),
    ];

    path.replaceWith(t.callExpression(helper, args));
  },
};
