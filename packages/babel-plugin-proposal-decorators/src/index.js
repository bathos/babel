// Fork of https://github.com/loganfsmyth/babel-plugin-proposal-decorators-legacy

import { declare } from "@babel/helper-plugin-utils";
import visitor from "./transformer";
import legacyVisitor from "./legacy-transformer";

export default declare((api, options) => {
  api.assertVersion(7);

  const { legacy = false } = options;
  if (typeof legacy !== "boolean") {
    throw new Error("'legacy' must be a boolean.");
  }

  return {
    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("decorators", "classProperties");
    },

    visitor: legacy ? legacyVisitor : visitor,
  };
});
