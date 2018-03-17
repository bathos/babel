import { types as t, template } from "@babel/core";
import splitExportDeclaration from "@babel/helper-split-export-declaration";
import ReplaceSupers from "@babel/helper-replace-supers";

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

function getSingleElementDefinition(path, superRef, classRef, file) {
  const { node } = path;
  const properties = [prop("kind", t.stringLiteral(node.kind))];

  const decorators = extractDecorators(path);
  if (decorators) properties.push(prop("decorators", decorators));

  if (node.static) properties.push(prop("static", t.booleanLiteral(true)));

  let key;
  if (node.computed) {
    key = node.key;
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

  new ReplaceSupers(
    {
      methodPath: path,
      methodNode: node,
      objectRef: classRef,
      superRef: superRef,
      isStatic: node.static,
      scope: path.scope,
      file: file,
    },
    true,
  ).replace();

  properties.push(
    t.objectMethod(node.kind, t.identifier("value"), node.params, node.body),
  );

  return t.objectExpression(properties);
}

function getElementsDefinitions(path, internalSlotsId, file) {
  const superRef = path.node.superClass || t.identifier("Function");
  const classRef = t.memberExpression(
    t.cloneNode(internalSlotsId),
    t.identifier("F"),
  );

  const elements = [];
  for (const p of path.get("body.body")) {
    if (!p.isClassMethod({ kind: "constructor" })) {
      elements.push(getSingleElementDefinition(p, superRef, classRef, file));
      p.remove();
    }
  }

  return t.arrayExpression(elements);
}

function getConstructorPath(path) {
  return path
    .get("body.body")
    .find(path => path.isClassMethod({ kind: "constructor" }));
}

function insertInitializeInstanceElements(path, initializeInstanceId) {
  const isBase = !path.node.superClass;
  const initializeInstanceElements = t.callExpression(initializeInstanceId, [
    t.thisExpression(),
  ]);

  const constructorPath = getConstructorPath(path);
  if (constructorPath) {
    if (isBase) {
      constructorPath
        .get("body")
        .unshiftContainer("body", [
          t.expressionStatement(initializeInstanceElements),
        ]);
    } else {
      constructorPath.traverse(bareSupersVisitor, {
        initializeInstanceElements,
      });
    }
  } else {
    const constructor = isBase
      ? t.classMethod(
          "constructor",
          t.identifier("constructor"),
          [],
          t.blockStatement([t.expressionStatement(initializeInstanceElements)]),
        )
      : t.classMethod(
          "constructor",
          t.identifier("constructor"),
          [t.restElement(t.identifier("args"))],
          t.blockStatement([
            t.expressionStatement(
              t.callExpression(t.Super(), [
                t.spreadElement(t.identifier("args")),
              ]),
            ),
            t.expressionStatement(initializeInstanceElements),
          ]),
        );
    path.node.body.body.push(constructor);
  }
}

const bareSupersVisitor = {
  CallExpression(path, { initializeInstanceElements }) {
    if (path.get("callee").isSuper()) {
      path.insertAfter(t.cloneNode(initializeInstanceElements));
    }
  },
  Function(path) {
    if (!path.isArrowFunctionExpression()) path.skip();
  },
};

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

    const classDecorators = extractDecorators(path);
    const internalSlotsId = path.scope.generateUidIdentifier("internalSlots");
    const defineClassId = path.scope.generateUidIdentifier("defineClass");
    const initializeClassId = path.scope.generateUidIdentifier(
      "initializeClass",
    );
    const initializeInstanceId = path.scope.generateUidIdentifier(
      "initializeInstance",
    );

    const definitions = getElementsDefinitions(
      path,
      internalSlotsId,
      this.file,
    );

    insertInitializeInstanceElements(path, initializeInstanceId);

    const h = name => this.addHelper(name);

    path.replaceWith(template.ast`
      ${h("enhanceClass")}(function (
        ${internalSlotsId},
        ${defineClassId},
        ${initializeClassId},
        ${initializeInstanceId}
      ) {
        ${defineClassId}(${path.node}, ${definitions});
        ${h("decorateStart")}(${internalSlotsId}, ${classDecorators});
        ${initializeClassId}();
        ${h("decorateEnd")}(${internalSlotsId});
      });
    `);
  },
};
