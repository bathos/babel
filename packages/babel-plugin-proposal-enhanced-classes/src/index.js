import splitExportDeclaration from "@babel/helper-split-export-declaration";
import ReplaceSupers from "@babel/helper-replace-supers";

export default function({ types: t, template }, options) {
  const features = {};
  ({
    decorators: features.decorators = true,
    fields: features.fields = true,
  } = options);

  if (typeof features.decorators !== "boolean") {
    throw new Error("'decorators' must be a boolean.");
  }
  if (typeof features.fields !== "boolean") {
    throw new Error("'fields' must be a boolean.");
  }

  function hasFields({ node }) {
    return node.body.body.some(element => t.isClassProperty(element));
  }

  function hasDecorators({ node }) {
    if (node.decorators && node.decorators.length > 0) return true;

    return node.body.body.some(
      element => element.decorators && element.decorators.length > 0,
    );
  }

  function prop(key, value) {
    return t.objectProperty(t.identifier(key), value);
  }

  function extractDecorators(path) {
    let result;
    if (path.node.decorators && path.node.decorators.length > 0) {
      if (!features.decorators) {
        throw path.buildCodeFrameError(
          'To use decorators, you must pass the `"decorators": true` option' +
            " to @babel/plugin-proposal-enhanced-classes",
        );
      }
      result = t.arrayExpression(path.node.decorators.map(n => n.expression));
    }
    path.node.decorators = undefined;
    return result;
  }

  function getSingleElementDefinition(path, superRef, classRef, file) {
    const { node } = path;
    const properties = [];

    if (path.isClassMethod()) {
      properties.push(prop("kind", t.stringLiteral(node.kind)));
    } else {
      if (!features.fields) {
        throw path.buildCodeFrameError(
          'To use class fields, you must pass the `"fields": true` option' +
            " to @babel/plugin-proposal-enhanced-classes",
        );
      }
      properties.push(prop("kind", t.stringLiteral("field")));
    }

    const decorators = extractDecorators(path);
    if (decorators) {
      properties.push(prop("decorators", decorators));
    }

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

    if (path.isClassMethod()) {
      properties.push(
        t.objectMethod("method", t.identifier("value"), node.params, node.body),
      );
    } else {
      properties.push(
        t.objectMethod(
          "method",
          t.identifier("value"),
          [],
          t.blockStatement([t.returnStatement(node.value)]),
        ),
      );
    }

    return t.objectExpression(properties);
  }

  function getElementsDefinitions(path, internalSlotsId, extractMethods, file) {
    const superRef = path.node.superClass || t.identifier("Function");
    const classRef = t.memberExpression(
      t.cloneNode(internalSlotsId),
      t.identifier("F"),
    );

    const elements = [];
    for (const p of path.get("body.body")) {
      const shouldNotExtract = extractMethods
        ? p.isClassMethod({ kind: "constructor" })
        : p.isClassMethod();
      if (!shouldNotExtract) {
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
            t.blockStatement([
              t.expressionStatement(initializeInstanceElements),
            ]),
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

  return {
    manipulateOptions(opts, parserOpts) {
      if (features.decorators) parserOpts.plugins.push("decorators2");
      if (features.fields) parserOpts.plugins.push("classProperties");
    },
    visitor: {
      ClassDeclaration(path) {
        if (!hasDecorators(path) && !hasFields(path)) return;

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
        const usedFeatures = {
          decorators: hasDecorators(path),
          fields: hasFields(path),
        };
        if (!usedFeatures.decorators && !usedFeatures.fields) return;

        const internalSlotsId = path.scope.generateUidIdentifier(
          "internalSlots",
        );
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
          usedFeatures.decorators,
          this.file,
        );

        insertInitializeInstanceElements(path, initializeInstanceId);

        const h = name => this.addHelper(name);

        if (usedFeatures.decorators) {
          const classDecorators = extractDecorators(path);

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
        } else {
          path.replaceWith(template.ast`
            ${h("enhanceClass")}(function (
              ${defineClassId},
              ${initializeClassId},
              ${initializeInstanceId}
            ) {
              ${defineClassId}(${path.node}, ${definitions});
              ${initializeClassId}();
            });
          `);
        }
      },
    },
  };
}
