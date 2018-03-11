import { parse } from "@babel/core";
import cases from "jest-in-case";
import proposalDecorators from "../lib";

describe("legacy option", function() {
  const OLD = "@dec export class Foo {}";
  const NEW = "export @dec class Foo {}";

  function makeParser(code, options) {
    return () =>
      parse(code, {
        babelrc: false,
        plugins: [[proposalDecorators, options]],
      });
  }

  test("must be boolean", function() {
    expect(makeParser("", { legacy: "legacy" })).toThrow();
  });

  cases(
    "behavior",
    ({ code, legacy, throws }) => {
      const expectTheParser = expect(makeParser(code, { legacy }));
      throws ? expectTheParser.toThrow() : expectTheParser.not.toThrow();
    },
    [
      { name: "default - old syntax", code: OLD, throws: false, skip: true },
      { name: "default - new syntax", code: NEW, throws: true, skip: true },
      { name: "true - old syntax", code: OLD, legacy: true, throws: false },
      { name: "true - new syntax", code: NEW, legacy: true, throws: true },
      { name: "false - old syntax", code: OLD, legacy: false, throws: true },
      { name: "false - new syntax", code: NEW, legacy: false, throws: false },
    ],
  );
});
