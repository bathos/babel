/* eslint-disable local-rules/plugin-name */

import { declare } from "@babel/helper-plugin-utils";
import syntaxDecorators from "@babel/plugin-syntax-decorators";
import {
  createClassFeaturePlugin,
  FEATURES,
  OPTIONS,
} from "@babel/helper-create-class-features-plugin";
import legacyVisitor from "./transformer-legacy";

export default declare((api, options) => {
  api.assertVersion(7);

  const { legacy = false } = options;
  if (typeof legacy !== "boolean") {
    throw new Error("'legacy' must be a boolean.");
  }

  const { decoratorsBeforeExport } = options;
  if (decoratorsBeforeExport === undefined) {
    if (!legacy) {
      throw new Error(
        "The decorators plugin requires a 'decoratorsBeforeExport' option," +
          " whose value must be a boolean. If you want to use the legacy" +
          " decorators semantics, you can set the 'legacy: true' option.",
      );
    }
  } else {
    if (legacy) {
      throw new Error(
        "'decoratorsBeforeExport' can't be used with legacy decorators.",
      );
    }
    if (typeof decoratorsBeforeExport !== "boolean") {
      throw new Error("'decoratorsBeforeExport' must be a boolean.");
    }
  }

  const { initializers } = options;
  if (initializers !== undefined) {
    if (legacy) {
      throw new Error("'initializers' can't be used with legacy decorators.");
    }
    if (typeof initializers !== "boolean") {
      throw new Error("'initializers' must be a boolean.");
    }
  }

  if (legacy) {
    return {
      name: "proposal-decorators",
      inherits: syntaxDecorators,
      manipulateOptions({ generatorOpts }) {
        generatorOpts.decoratorsBeforeExport = decoratorsBeforeExport;
      },
      visitor: legacyVisitor,
    };
  }

  return createClassFeaturePlugin({
    name: "proposal-decorators",

    feature: FEATURES.decorators,
    // loose: options.loose, Not supported
    options: [[OPTIONS.decorators.initializers, !!initializers]],

    manipulateOptions({ generatorOpts, parserOpts }) {
      parserOpts.plugins.push(["decorators", { decoratorsBeforeExport }]);
      generatorOpts.decoratorsBeforeExport = decoratorsBeforeExport;
    },
  });
});
