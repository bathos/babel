var Outer = function Outer() {
  "use strict";

  babelHelpers.classCallCheck(this, Outer);

  _outer.set(this, {
    writable: true,
    value: void 0
  });

  var Test =
  /*#__PURE__*/
  function (_babelHelpers$classPr) {
    babelHelpers.inherits(Test, _babelHelpers$classPr);

    var _super = babelHelpers.createSuper(Test);

    function Test() {
      babelHelpers.classCallCheck(this, Test);
      return _super.apply(this, arguments);
    }

    return Test;
  }(babelHelpers.classPrivateFieldGet(this, _outer));
};

var _outer = new WeakMap();
