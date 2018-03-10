// Fork of https://github.com/loganfsmyth/babel-plugin-proposal-decorators-legacy

import { declare } from "@babel/helper-plugin-utils";
import syntaxDecorators from "@babel/plugin-syntax-decorators";
import visitor from "./visitor";
import legacyVisitor from "./legacy-transformer";

export default declare((api, options) => {
  api.assertVersion(7);

  const { legacy = true } = options;
  if (typeof legacy !== "boolean") {
    throw new Error("'legacy' must be a boolean.");
  }

  return {
    inherits: syntaxDecorators,

    visitor: legacy ? legacyVisitor : visitor,
  };
});
