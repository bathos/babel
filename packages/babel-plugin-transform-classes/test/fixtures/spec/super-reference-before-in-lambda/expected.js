var Foo =
/*#__PURE__*/
function (_Bar) {
  babelHelpers.inherits(Foo, _Bar);

  function Foo() {
    var _this;

    babelHelpers.classCallCheck(this, Foo);

    var t = () => babelHelpers.get(Foo.prototype.__proto__ || Object.getPrototypeOf(Foo.prototype), "test", babelHelpers.assertThisInitialized(_this)).call(_this);

    return _this = babelHelpers.possibleConstructorReturn(this, babelHelpers.constructSuperInstance(Foo, [], this));
  }

  return Foo;
}(Bar);
