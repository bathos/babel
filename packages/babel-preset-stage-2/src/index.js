import { declare } from "@babel/helper-plugin-utils";
import presetStage3 from "@babel/preset-stage-3";

import transformDecoratorsLegacy from "@babel/plugin-proposal-decorators";
import transformEnhancedClasses from "@babel/plugin-proposal-enhanced-classes";
import transformFunctionSent from "@babel/plugin-proposal-function-sent";
import transformExportNamespaceFrom from "@babel/plugin-proposal-export-namespace-from";
import transformNumericSeparator from "@babel/plugin-proposal-numeric-separator";
import transformThrowExpressions from "@babel/plugin-proposal-throw-expressions";

export default declare((api, opts) => {
  api.assertVersion(7);

  let loose = false;
  let useBuiltIns = false;
  let decoratorsLegacy = false;

  if (opts !== undefined) {
    if (opts.loose !== undefined) loose = opts.loose;
    if (opts.useBuiltIns !== undefined) useBuiltIns = opts.useBuiltIns;
    if (opts.decoratorsLegacy !== undefined) {
      decoratorsLegacy = opts.decoratorsLegacy;
    }
  }

  if (typeof loose !== "boolean") {
    throw new Error("@babel/preset-stage-2 'loose' option must be a boolean.");
  }
  if (typeof useBuiltIns !== "boolean") {
    throw new Error(
      "@babel/preset-stage-2 'useBuiltIns' option must be a boolean.",
    );
  }
  if (typeof decoratorsLegacy !== "boolean") {
    throw new Error(
      "@babel/preset-stage-2 'decoratorsLegacy' option must be a boolean.",
    );
  }

  const transformDecorators = decoratorsLegacy
    ? transformDecoratorsLegacy
    : [transformEnhancedClasses, { fields: true, decorators: true }];

  return {
    presets: [[presetStage3, { loose, useBuiltIns }]],
    plugins: [
      transformDecorators,
      transformFunctionSent,
      transformExportNamespaceFrom,
      transformNumericSeparator,
      transformThrowExpressions,
    ],
  };
});
