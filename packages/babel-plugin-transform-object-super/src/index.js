import ReplaceSupers from "@babel/helper-replace-supers";
import { types as t } from "@babel/core";

function replacePropertySuper(path, node, scope, getObjectRef, file) {
  const replaceSupers = new ReplaceSupers({
    getObjectRef: getObjectRef,
    methodNode: node,
    methodPath: path,
    isStatic: true,
    scope: scope,
    file: file,
  });

  replaceSupers.replace();
}

export default function() {
  return {
    visitor: {
      ObjectExpression(path, state) {
        let objectRef;
        const getObjectRef = () =>
          (objectRef = objectRef || path.scope.generateUidIdentifier("obj"));

        path.get("properties").forEach(propertyPath => {
          if (!propertyPath.isMethod()) return;

          const propPaths: Array = path.get("properties");
          for (let propPath of propPaths) {
            if (propPath.isObjectProperty()) propPath = propPath.get("value");
            replacePropertySuper(
              propPath,
              propPath.node,
              path.scope,
              getObjectRef,
              state,
            );
          }
        });

        if (objectRef) {
          path.scope.push({ id: t.clone(objectRef) });
          path.replaceWith(
            t.assignmentExpression("=", t.clone(objectRef), path.node),
          );
        }
      },
    },
  };
}
