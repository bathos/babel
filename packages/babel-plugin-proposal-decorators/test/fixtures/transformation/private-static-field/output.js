let A = babelHelpers.decorate([deco], function (_initialize) {
  "use strict";

  class A {
    constructor() {
      _initialize(this);
    }

  }

  var _foo = new WeakMap();

  return {
    F: A,
    d: [{
      kind: "field",
      static: true,
      key: babelHelpers.privateName(_foo, "foo"),

      value() {
        return 2;
      }

    }, {
      kind: "method",
      key: "test",

      value() {
        babelHelpers.classPrivateFieldGet(A, _foo);
      }

    }]
  };
}, void 0, [babelHelpers.privateName()]);
