import { declare } from "@babel/helper-plugin-utils";
import presetStage2 from "@babel/preset-stage-2";

import transformExportDefaultFrom from "@babel/plugin-proposal-export-default-from";
import transformOptionalChaining from "@babel/plugin-proposal-optional-chaining";
import transformPipelineOperator from "@babel/plugin-proposal-pipeline-operator";
import transformNullishCoalescingOperator from "@babel/plugin-proposal-nullish-coalescing-operator";
import transformDoExpressions from "@babel/plugin-proposal-do-expressions";

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
    throw new Error("@babel/preset-stage-1 'loose' option must be a boolean.");
  }
  if (typeof useBuiltIns !== "boolean") {
    throw new Error(
      "@babel/preset-stage-1 'useBuiltIns' option must be a boolean.",
    );
  }
  if (typeof decoratorsLegacy !== "boolean") {
    throw new Error(
      "@babel/preset-stage-1 'decoratorsLegacy' option must be a boolean.",
    );
  }

  return {
    presets: [[presetStage2, { loose, useBuiltIns, decoratorsLegacy }]],
    plugins: [
      transformExportDefaultFrom,
      [transformOptionalChaining, { loose }],
      transformPipelineOperator,
      [transformNullishCoalescingOperator, { loose }],
      transformDoExpressions,
    ],
  };
});
