import { parse } from "@babel/core";
import syntaxDecorators from "../lib";

describe("legacy option", function() {
  const oldSyntax = "@dec export class Foo {}";
  const newSyntax = "export @dec class Foo {}";

  function makeParser(code, options) {
    return () =>
      parse(code, {
        babelrc: false,
        plugins: [[syntaxDecorators, options]],
      });
  }

  test("must be boolean", function() {
    expect(makeParser("", { legacy: "legacy" })).toThrow();
  });

  describe("default", function() {
    test("parses legacy syntax", function() {
      expect(makeParser(oldSyntax, {})).not.toThrow();
    });

    test("doesn't parse new syntax", function() {
      expect(makeParser(newSyntax, {})).toThrow();
    });
  });

  describe("true", function() {
    test("parses legacy syntax", function() {
      expect(makeParser(oldSyntax, { legacy: true })).not.toThrow();
    });

    test("doesn't parse new syntax", function() {
      expect(makeParser(newSyntax, { legacy: true })).toThrow();
    });
  });

  describe("false", function() {
    test("doesn't parses legacy syntax", function() {
      expect(makeParser(oldSyntax, { legacy: false })).toThrow();
    });

    test("parses new syntax", function() {
      expect(makeParser(newSyntax, { legacy: false })).not.toThrow();
    });
  });
});
