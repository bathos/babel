/* eslint max-len: "off" */

import template from "@babel/template";

const helpers = {};
export default helpers;

helpers.typeof = () => template.program.ast`
  export default function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) { return typeof obj; };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype
          ? "symbol"
          : typeof obj;
      };
    }

    return _typeof(obj);
  }
`;

helpers.jsx = () => template.program.ast`
  var REACT_ELEMENT_TYPE;

  export default function _createRawReactElement(type, props, key, children) {
    if (!REACT_ELEMENT_TYPE) {
      REACT_ELEMENT_TYPE = (typeof Symbol === "function" && Symbol.for && Symbol.for("react.element")) || 0xeac7;
    }

    var defaultProps = type && type.defaultProps;
    var childrenLength = arguments.length - 3;

    if (!props && childrenLength !== 0) {
      // If we're going to assign props.children, we create a new object now
      // to avoid mutating defaultProps.
      props = {
        children: void 0,
      };
    }
    if (props && defaultProps) {
      for (var propName in defaultProps) {
        if (props[propName] === void 0) {
          props[propName] = defaultProps[propName];
        }
      }
    } else if (!props) {
      props = defaultProps || {};
    }

    if (childrenLength === 1) {
      props.children = children;
    } else if (childrenLength > 1) {
      var childArray = new Array(childrenLength);
      for (var i = 0; i < childrenLength; i++) {
        childArray[i] = arguments[i + 3];
      }
      props.children = childArray;
    }

    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type: type,
      key: key === undefined ? null : '' + key,
      ref: null,
      props: props,
      _owner: null,
    };
  }
`;

helpers.asyncIterator = () => template.program.ast`
  export default function _asyncIterator(iterable) {
    if (typeof Symbol === "function") {
      if (Symbol.asyncIterator) {
        var method = iterable[Symbol.asyncIterator];
        if (method != null) return method.call(iterable);
      }
      if (Symbol.iterator) {
        return iterable[Symbol.iterator]();
      }
    }
    throw new TypeError("Object is not async iterable");
  }
`;

helpers.AwaitValue = () => template.program.ast`
  export default function _AwaitValue(value) {
    this.wrapped = value;
  }
`;

helpers.AsyncGenerator = () => template.program.ast`
  import AwaitValue from "AwaitValue";

  export default function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null,
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg)
        var value = result.value;
        var wrappedAwait = value instanceof AwaitValue;

        Promise.resolve(wrappedAwait ? value.wrapped : value).then(
          function (arg) {
            if (wrappedAwait) {
              resume("next", arg);
              return
            }

            settle(result.done ? "return" : "normal", arg);
          },
          function (err) { resume("throw", err); });
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({ value: value, done: true });
          break;
        case "throw":
          front.reject(value);
          break;
        default:
          front.resolve({ value: value, done: false });
          break;
      }

      front = front.next;
      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    // Hide "return" method if generator return is not supported
    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () { return this; };
  }

  AsyncGenerator.prototype.next = function (arg) { return this._invoke("next", arg); };
  AsyncGenerator.prototype.throw = function (arg) { return this._invoke("throw", arg); };
  AsyncGenerator.prototype.return = function (arg) { return this._invoke("return", arg); };
`;

helpers.wrapAsyncGenerator = () => template.program.ast`
  import AsyncGenerator from "AsyncGenerator";

  export default function _wrapAsyncGenerator(fn) {
    return function () {
      return new AsyncGenerator(fn.apply(this, arguments));
    };
  }
`;

helpers.awaitAsyncGenerator = () => template.program.ast`
  import AwaitValue from "AwaitValue";

  export default function _awaitAsyncGenerator(value) {
    return new AwaitValue(value);
  }
`;

helpers.asyncGeneratorDelegate = () => template.program.ast`
  export default function _asyncGeneratorDelegate(inner, awaitWrap) {
    var iter = {}, waiting = false;

    function pump(key, value) {
      waiting = true;
      value = new Promise(function (resolve) { resolve(inner[key](value)); });
      return { done: false, value: awaitWrap(value) };
    };

    if (typeof Symbol === "function" && Symbol.iterator) {
      iter[Symbol.iterator] = function () { return this; };
    }

    iter.next = function (value) {
      if (waiting) {
        waiting = false;
        return value;
      }
      return pump("next", value);
    };

    if (typeof inner.throw === "function") {
      iter.throw = function (value) {
        if (waiting) {
          waiting = false;
          throw value;
        }
        return pump("throw", value);
      };
    }

    if (typeof inner.return === "function") {
      iter.return = function (value) {
        return pump("return", value);
      };
    }

    return iter;
  }
`;

helpers.asyncToGenerator = () => template.program.ast`
  export default function _asyncToGenerator(fn) {
    return function () {
      var self = this, args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            Promise.resolve(value).then(_next, _throw);
          }
        }
        function _next(value) { step("next", value); }
        function _throw(err) { step("throw", err); }

        _next();
      });
    };
  }
`;

helpers.classCallCheck = () => template.program.ast`
  export default function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
`;

helpers.createClass = () => template.program.ast`
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i ++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  export default function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }
`;

helpers.defineEnumerableProperties = () => template.program.ast`
  export default function _defineEnumerableProperties(obj, descs) {
    for (var key in descs) {
      var desc = descs[key];
      desc.configurable = desc.enumerable = true;
      if ("value" in desc) desc.writable = true;
      Object.defineProperty(obj, key, desc);
    }

    // Symbols are not enumerated over by for-in loops. If native
    // Symbols are available, fetch all of the descs object's own
    // symbol properties and define them on our target object too.
    if (Object.getOwnPropertySymbols) {
      var objectSymbols = Object.getOwnPropertySymbols(descs);
      for (var i = 0; i < objectSymbols.length; i++) {
        var sym = objectSymbols[i];
        var desc = descs[sym];
        desc.configurable = desc.enumerable = true;
        if ("value" in desc) desc.writable = true;
        Object.defineProperty(obj, sym, desc);
      }
    }
    return obj;
  }
`;

helpers.defaults = () => template.program.ast`
  export default function _defaults(obj, defaults) {
    var keys = Object.getOwnPropertyNames(defaults);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var value = Object.getOwnPropertyDescriptor(defaults, key);
      if (value && value.configurable && obj[key] === undefined) {
        Object.defineProperty(obj, key, value);
      }
    }
    return obj;
  }
`;

helpers.defineProperty = () => template.program.ast`
  export default function _defineProperty(obj, key, value) {
    // Shortcircuit the slow defineProperty path when possible.
    // We are trying to avoid issues where setters defined on the
    // prototype cause side effects under the fast path of simple
    // assignment. By checking for existence of the property with
    // the in operator, we can optimize most of this overhead away.
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
`;

helpers.extends = () => template.program.ast`
  export default function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };

    return _extends.apply(this, arguments);
  }
`;

helpers.objectSpread = () => template.program.ast`
  import defineProperty from "defineProperty";

  export default function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = (arguments[i] != null) ? arguments[i] : {};
      var ownKeys = Object.keys(source);
      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }
      ownKeys.forEach(function(key) {
        defineProperty(target, key, source[key]);
      });
    }
    return target;
  }
`;

helpers.get = () => template.program.ast`
  export default function _get(object, property, receiver) {
    if (object === null) object = Function.prototype;

    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        return _get(parent, property, receiver);
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  }
`;

helpers.inherits = () => template.program.ast`
  export default function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }
`;

helpers.inheritsLoose = () => template.program.ast`
  export default function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }
`;

// Based on https://github.com/WebReflection/babel-plugin-transform-builtin-classes
helpers.wrapNativeSuper = () => template.program.ast`
  function _gPO(o) {
    _gPO = Object.getPrototypeOf || function _gPO(o) { return o.__proto__ };
    return _gPO(o);
  }
  function _sPO(o, p) {
    _sPO = Object.setPrototypeOf || function _sPO(o, p) { o.__proto__ = p; return o };
    return _sPO(o, p);
  }
  function _construct(Parent, args, Class) {
    _construct = (typeof Reflect === "object" && Reflect.construct) ||
      function _construct(Parent, args, Class) {
        var Constructor, a = [null];
        a.push.apply(a, args);
        Constructor = Parent.bind.apply(Parent, a);
        return _sPO(new Constructor, Class.prototype);
      };
    return _construct(Parent, args, Class);
  }

  export default function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }
      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);
        _cache.set(Class, Wrapper);
      }
      function Wrapper() {}
      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true,
        }
      });
      return _sPO(
        Wrapper,
        _sPO(
          function Super() {
            return _construct(Class, arguments, _gPO(this).constructor);
          },
          Class
        )
      );
    }

    return _wrapNativeSuper(Class)
  }
`;

helpers.instanceof = () => template.program.ast`
  export default function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
      return right[Symbol.hasInstance](left);
    } else {
      return left instanceof right;
    }
  }
`;

helpers.interopRequireDefault = () => template.program.ast`
  export default function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
`;

helpers.interopRequireWildcard = () => template.program.ast`
  export default function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};
      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = Object.defineProperty && Object.getOwnPropertyDescriptor
              ? Object.getOwnPropertyDescriptor(obj, key)
              : {};
            if (desc.get || desc.set) {
              Object.defineProperty(newObj, key, desc);
            } else {
              newObj[key] = obj[key];
            }
          }
        }
      }
      newObj.default = obj;
      return newObj;
    }
  }
`;

helpers.newArrowCheck = () => template.program.ast`
  export default function _newArrowCheck(innerThis, boundThis) {
    if (innerThis !== boundThis) {
      throw new TypeError("Cannot instantiate an arrow function");
    }
  }
`;

helpers.objectDestructuringEmpty = () => template.program.ast`
  export default function _objectDestructuringEmpty(obj) {
    if (obj == null) throw new TypeError("Cannot destructure undefined");
  }
`;

helpers.objectWithoutProperties = () => template.program.ast`
  export default function _objectWithoutProperties(source, excluded) {
    if (source == null) return {};

    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }

    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i = 0; i < sourceSymbolKeys.length; i++) {
        key = sourceSymbolKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
        target[key] = source[key];
      }
    }

    return target;
  }
`;

helpers.assertThisInitialized = () => template.program.ast`
  export default function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
  }
`;

helpers.possibleConstructorReturn = () => template.program.ast`
  import assertThisInitialized from "assertThisInitialized";

  export default function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }
    return assertThisInitialized(self);
  }
`;

helpers.set = () => template.program.ast`
  export default function _set(object, property, value, receiver) {
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent !== null) {
        _set(parent, property, value, receiver);
      }
    } else if ("value" in desc && desc.writable) {
      desc.value = value;
    } else {
      var setter = desc.set;

      if (setter !== undefined) {
        setter.call(receiver, value);
      }
    }

    return value;
  }
`;

helpers.taggedTemplateLiteral = () => template.program.ast`
  export default function _taggedTemplateLiteral(strings, raw) {
    if (!raw) { raw = strings.slice(0); }
    return Object.freeze(Object.defineProperties(strings, {
        raw: { value: Object.freeze(raw) }
    }));
  }
`;

helpers.taggedTemplateLiteralLoose = () => template.program.ast`
  export default function _taggedTemplateLiteralLoose(strings, raw) {
    if (!raw) { raw = strings.slice(0); }
    strings.raw = raw;
    return strings;
  }
`;

helpers.temporalRef = () => template.program.ast`
  import undef from "temporalUndefined";

  export default function _temporalRef(val, name) {
    if (val === undef) {
      throw new ReferenceError(name + " is not defined - temporal dead zone");
    } else {
      return val;
    }
  }
`;

helpers.readOnlyError = () => template.program.ast`
  export default function _readOnlyError(name) {
    throw new Error("\\"" + name + "\\" is read-only");
  }
`;

helpers.classNameTDZError = () => template.program.ast`
  export default function _classNameTDZError(name) {
    throw new Error("Class \\"" + name + "\\" cannot be referenced in computed property keys.");
  }
`;

helpers.temporalUndefined = () => template.program.ast`
  export default {};
`;

helpers.slicedToArray = () => template.program.ast`
  import arrayWithHoles from "arrayWithHoles";
  import iterableToArrayLimit from "iterableToArrayLimit";
  import nonIterableRest from "nonIterableRest";

  export default function _slicedToArray(arr, i) {
    return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || nonIterableRest();
  }
`;

helpers.slicedToArrayLoose = () => template.program.ast`
  import arrayWithHoles from "arrayWithHoles";
  import iterableToArrayLimitLoose from "iterableToArrayLimitLoose";
  import nonIterableRest from "nonIterableRest";

  export default function _slicedToArrayLoose(arr, i) {
    return arrayWithHoles(arr) || iterableToArrayLimitLoose(arr, i) || nonIterableRest();
  }
`;

helpers.toArray = () => template.program.ast`
  import arrayWithHoles from "arrayWithHoles";
  import iterableToArray from "iterableToArray";
  import nonIterableRest from "nonIterableRest";

  export default function _toArray(arr) {
    return arrayWithHoles(arr) || iterableToArray(arr) || nonIterableRest();
  }
`;

helpers.toConsumableArray = () => template.program.ast`
  import arrayWithoutHoles from "arrayWithoutHoles";
  import iterableToArray from "iterableToArray";
  import nonIterableSpread from "nonIterableSpread";

  export default function _toConsumableArray(arr) {
    return arrayWithoutHoles(arr) || iterableToArray(arr) || nonIterableSpread();
  }
`;

helpers.arrayWithoutHoles = () => template.program.ast`
  export default function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
      return arr2;
    }
  }
`;

helpers.arrayWithHoles = () => template.program.ast`
  export default function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
`;

helpers.iterableToArray = () => template.program.ast`
  export default function _iterableToArray(iter) {
    if (
      Symbol.iterator in Object(iter) ||
      Object.prototype.toString.call(iter) === "[object Arguments]"
    ) return Array.from(iter);
  }
`;

helpers.iterableToArrayLimit = () => template.program.ast`
  export default function _iterableToArrayLimit(arr, i) {
    // this is an expanded form of \`for...of\` that properly supports abrupt completions of
    // iterators etc. variable names have been minimised to reduce the size of this massive
    // helper. sometimes spec compliancy is annoying :(
    //
    // _n = _iteratorNormalCompletion
    // _d = _didIteratorError
    // _e = _iteratorError
    // _i = _iterator
    // _s = _step

    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;
    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
`;

helpers.iterableToArrayLimitLoose = () => template.program.ast`
  export default function _iterableToArrayLimitLoose(arr, i) {
    var _arr = [];
    for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
      _arr.push(_step.value);
      if (i && _arr.length === i) break;
    }
    return _arr;
  }
`;

helpers.nonIterableSpread = () => template.program.ast`
  export default function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }
`;

helpers.nonIterableRest = () => template.program.ast`
  export default function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }
`;

helpers.skipFirstGeneratorNext = () => template.program.ast`
  export default function _skipFirstGeneratorNext(fn) {
    return function () {
      var it = fn.apply(this, arguments);
      it.next();
      return it;
    }
  }
`;

helpers.toPropertyKey = () => template.program.ast`
  export default function _toPropertyKey(key) {
    if (typeof key === "symbol") {
      return key;
    } else {
      return String(key);
    }
  }
`;

/**
 * Add a helper that will throw a useful error if the transform fails to detect the class
 * property assignment, so users know something failed.
 */
helpers.initializerWarningHelper = () => template.program.ast`
    export default function _initializerWarningHelper(descriptor, context){
        throw new Error(
          'Decorating class property failed. Please ensure that ' +
          'proposal-class-properties is enabled and set to use loose mode. ' +
          'To use proposal-class-properties in spec mode with decorators, wait for ' +
          'the next major version of decorators in stage 2.'
        );
    }
`;

/**
 * Add a helper to call as a replacement for class property definition.
 */
helpers.initializerDefineProperty = () => template.program.ast`
    export default function _initializerDefineProperty(target, property, descriptor, context){
        if (!descriptor) return;

        Object.defineProperty(target, property, {
            enumerable: descriptor.enumerable,
            configurable: descriptor.configurable,
            writable: descriptor.writable,
            value: descriptor.initializer ? descriptor.initializer.call(context) : void 0,
        });
    }
`;

/**
 * Add a helper to take an initial descriptor, apply some decorators to it, and optionally
 * define the property.
 */
helpers.applyDecoratedDescriptor = () => template.program.ast`
    export default function _applyDecoratedDescriptor(target, property, decorators, descriptor, context){
        var desc = {};
        Object['ke' + 'ys'](descriptor).forEach(function(key){
            desc[key] = descriptor[key];
        });
        desc.enumerable = !!desc.enumerable;
        desc.configurable = !!desc.configurable;
        if ('value' in desc || desc.initializer){
            desc.writable = true;
        }

        desc = decorators.slice().reverse().reduce(function(desc, decorator){
            return decorator(target, property, desc) || desc;
        }, desc);

        if (context && desc.initializer !== void 0){
            desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
            desc.initializer = undefined;
        }

        if (desc.initializer === void 0){
            // This is a hack to avoid this being processed by 'transform-runtime'.
            // See issue #9.
            Object['define' + 'Property'](target, property, desc);
            desc = null;
        }

        return desc;
    }
`;

helpers.decorate = () => template.program.ast`
  import toArray from "toArray";

  // ClassDefinitionEvaluation
  export default function _decorate(F, definitions, decorators) {
    // 26. Let elements be a new empty list
    var elements = [];
    // 27. For each ClassElement d in order from definitions
    for (var i = 0; i < definitions.length; i++) {
      var d = definitions[i];

      // 27.c Let newElement be the result of performing ClassElementEvaluation
      //      for d with arguments F, true and empty
      var newElement = _createElementDescriptor(F, d);
      elements.push(newElement);
    }

    // 30. Let decorated be ? DecorateClass(elements, decorators)
    var decorated = _decorateClass(elements, decorators);

    // 34. Set the value of F's [[Elements]] internal slot to decorated.[[Elements]]
    // 35. Perform ? InitializeClassElements(F, proto).
    _initializeClassElements(F, F.prototype, decorated.elements);

    // 37. Return ? RunClassFinishers(F, decorated.[[Finishers]]).
    return _runClassFinishers(F, decorated.finishers);
  }

  // ClassElementEvaluation
  function _createElementDescriptor(Class, def) {
    switch (def.placement) {
      case "prototype":
        var homeObject = Class.prototype;
        break;
      case "static":
        var homeObject = Class;
        break;
      case "own":
        throw new Error("Own properties are not supported by Babel yet.");
    }

    var element = {
      kind: "method",
      key: def.key,
      placement: def.placement,
      descriptor: Object.getOwnPropertyDescriptor(homeObject, def.key)
      // initializer,
      // extras,
      // finisher
    };
    if (def.decorators) element.decorators = def.decorators;

    return element;
  }

  // InitializeClassElements
  function _initializeClassElements(F, proto, elements) {
    // 5. For each item element in order from elements,
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];

      // 5.b If element.[[Kind]] is "method",
      if (element.kind === "method") {
        // 5.b.i Let receiver be F if element.[[Placement]] is "static",
        //       else let receiver be proto.
        var receiver = element.placement === "static" ? F : proto;

        // 5.b.ii Perform ? DefineClassElement(receiver, element).
        Object.defineProperty(receiver, element.key, element.descriptor);
      } else {
        throw new Error("Class fields are not supported by Babel yet.");
      }
    }
  }

  // RunClassFinishers
  function _runClassFinishers(constructor, finishers) {
    // 1. For each finisher in finishers, do
    for (var i = 0; i < finishers.length; i++) {
      // 1.a Let newConstructor be Call(finisher, undefined, « constructor »).
      var newConstructor = (0, finishers[i])(constructor);

      // 1.b If newConstructor is not undefined,
      if (newConstructor !== undefined) {
        // 1.b.i If IsConstructor(newConstructor) is false, throw a TypeError exception.
        if (typeof newConstructor !== "function") throw new TypeError();

        // 1.b.ii Let constructor be newConstructor.
        constructor = newConstructor;
      }
    }

    // 2. Return constructor.
    return constructor;
  }

  // DecorateClass
  function _decorateClass(elements, decorators) {
    // 1. Let newElements, finishers and keys each be a new empty list.
    var newElements = [];
    var finishers = [];
    // 2. For each element in elements, do
    // 2.a. Append element.[[Key]] to keys.
    var keys = elements.map(function(element) {
      return element.key;
    });

    // 3. For each element in elements, do
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];

      // 3.a Let elementFinishersExtras be ? DecorateElement(element, keys);
      var elementFinishersExtras = _decorateElement(element, keys);

      // 3.b Append elementFinishersExtras.[[Element]] to newElements.
      // 3.c Concatenate elementFinishersExtras.[[Extras]] onto newElements.
      newElements = newElements.concat(
        [elementFinishersExtras.element],
        elementFinishersExtras.extras
      );

      // 3.c Concatenate elementFinishersExtras.[[Finishers]] onto finishers.
      finishers = finishers.concat(elementFinishersExtras.finishers);
    }

    // 4. Let result be ? DecorateConstructor(newElements, decorators);
    var result = _decorateConstructor(newElements, decorators);

    // 5. Set result.[[Finishers]] to the concatenation of finishers
    //    and result.[[Finishers]].
    result.finishers = finishers.concat(result.finishers);

    // 6. Return result.
    return result;
  }

  // DecorateElement
  function _decorateElement(element, keys) {
    // 1. Let extras be a new empty List.
    // 2. Let finishers be a new empty List.
    var extras = [];
    var finishers = [];

    // 3. For each decorator in element.[[Decorators]], in reverse list order do
    for (var i = element.decorators.length - 1; i >= 0; i--) {
      var decorator = element.decorators[i];

      // 3.b. Remove element.[[Key]] from keys
      keys.splice(keys.indexOf(element.key), 1);

      // 3.c Let elementObject be ? FromElementDescriptor(element).
      // 3.d Let elementFinisherExtrasObject be ? Call(decorator, undefined, elementObject).
      // 3.e Let elementFinisherExtras be ? ToElementDescriptor(elementFinisherExtrasObject).
      var elementFinisherExtras = _toElementDescriptor(
        decorator(_fromElementDescriptor(element))
      );

      // 3.f Let element be elementFinisherExtras.[[Element]]
      element = elementFinisherExtras.element;

      _decorateElement_pushKey(keys, element);

      // 3.i If elementFinisherExtras.[[Finisher]] is not undefined
      if (elementFinisherExtras.finisher) {
        // 3.i.i Append elementFinisherExtras.[[Finisher]] to finishers
        finishers.push(elementFinisherExtras.finisher);
      }

      // 3.j Let newExtras be elementFinisherExtras.[[Extras]]
      var newExtras = elementFinisherExtras.extras;

      // 3.k If newExtras is not undefined, then
      if (newExtras) {
        // 3.k.i For each extra of newExtras, do
        for (var i = 0; i < newExtras.length; i++) {
          _decorateElement_pushKey(keys, newExtras[i]);
        }
      }
    }

    return { element, finishers, extras };
  }

  // DecorateElement - Steps 3.g-3.h and 3.k.i.1-3.k.i.2
  function _decorateElement_pushKey(keys, element) {
    // 3.g If element.[[Key]] is an element of keys, throw a TypeError
    //     exception
    if (keys.indexOf(element.key) !== -1) {
      throw new TypeError("Duplicated key");
    }

    // 3.h Otherwise, append element.[[Key]] to keys
    keys.push(element.key);
  }

  // DecorateConstructor
  function _decorateConstructor(elements, decorators) {
    // 2. Let finishers be a new empty List.
    var finishers = [];

    // 3. For each decorator in decorators, in reverse list order do
    for (var i = decorators.length - 1; i >= 0; i--) {
      var decorator = decorators[i];

      // 3.a Let obj be FromClassDescriptor(elements).
      // 3.b Let result be ? Call(decorator, undefined, obj).
      // 3.c Let elementsAndFinisher be ? ToClassDescriptor(result).
      var elementsAndFinisher = _toClassDescriptor(
        decorator(_fromClassDescriptor(elements))
      );

      // 3.d If elementsAndFinisher.[[Finisher]] is not undefined,
      if (elementsAndFinisher.finisher !== undefined) {
        // 3.d.i Append elementsAndFinisher.[[Finisher]] to finishers.
        finishers.push(elementsAndFinisher.finisher);
      }

      // 3.e If elementsAndFinisher.[[Elements]] is not undefined,
      if (elementsAndFinisher.elements !== undefined) {
        // 3.e.i Set elements to elementsAndFinisher.[[Elements]].
        elements = elementsAndFinisher.elements;

        // 3.e.ii If there are two class elements a and b in elements such
        //        that a.[[Key]] is b.[[Key]], throw a TypeError exception.
        for (var j = 0; j < elements.length - 1; j++) {
          for (var k = j + 1; k < elements.length; k++) {
            if (elements[j].key === elements[k].key) {
              throw new Error("Duplicated key.");
            }
          }
        }
      }
    }

    return { elements: elements, finishers: finishers };
  }

  // FromElementDescriptor
  function _fromElementDescriptor(element) {
    // 1. Let obj be ! ObjectCreate(%ObjectPrototype%).
    // 5. Perform ! CreateDataPropertyOrThrow(obj, "kind", element.[[Kind]]).
    // 6. Perform ! CreateDataPropertyOrThrow(obj, "key", element.[[Key]]).
    // 7. Perform ! CreateDataPropertyOrThrow(obj, "placement", element.[[Placement]]).
    // 8. Perform ! CreateDataPropertyOrThrow(
    //      obj,
    //      "descriptor",
    //      ! FromPropertyDescriptor(element.[[Descriptor]])
    //    ).
    var obj = {
      kind: element.kind,
      key: element.key,
      placement: element.placement,
      descriptor: element.descriptor
    };

    // 2. If element.[[Kind]] is "method",
    // 2.a Let desc be PropertyDescriptor {
    //       [[Value]]: "Method Descriptor",
    //       [[Writable]]: false,
    //       [[Enumerable]]: false,
    //       [[Configurable]]: true
    //     }.
    // NOTE: kind === "field" is not supported yet.
    var desc = { value: "Method Descriptor", configurable: true };

    // 4. Perform ! DefinePropertyOrThrow(obj, @@toStringTag, desc).
    Object.defineProperty(obj, Symbol.toStringTag, desc);

    // 9. If element.[[Kind]] is "field",
    // NOT SUPPORTED YET

    // 10. Return obj.
    return obj;
  }

  // ToElementDescriptors
  function _toElementDescriptors(elementObjects) {
    // 1. If elementObjects is undefined, return undefined.
    if (!elementObjects) return;

    // 2. Let elements be a new empty List.
    // 3. let elementObjectList be ? IterableToList(elementObjects).
    // 4. For each elementObject in elementObjectList, do
    // 4.a  Append ToElementDescriptor(elementObject) to elements.
    // 5. Return elements.
    return toArray(elementObjects).forEach(_toElementDescriptor);
  }

  // ToElementDescriptor
  function _toElementDescriptor(elementObject) {
    // 1. Let kind be ? ToString(? Get(descriptor, "kind")).
    var kind = String(elementObject.kind);
    // 2. If kind is not one of "method" or "field", throw a TypeError exception.
    if (kind !== "method" && kind !== "field") {
      throw new TypeError();
    } else if (kind === "field") {
      throw new TypeError("Field decorators are not supported by Babel yet.");
    }

    // 3. Let key be ? Get(descriptor, "key").
    var key = elementObject.key;
    // 4. Set key to ? ToPrimitive(key, hint String).
    if (typeof key !== "string" && typeof key !== "symbol") key = String(key);

    // 5. If key is not a Private Name, set key to ? ToPropertyKey(key).
    // NOT SUPPORTED YET

    // 6. Let placement be ? ToString(? Get(descriptor, "placement")).
    var placement = String(elementObject.placement);
    // 7. If placement is not one of "static", "prototype", or "own",
    //    throw a TypeError exception.
    if (
      placement !== "static" &&
      placement !== "prototype" &&
      placement !== "own"
    ) {
      throw new TypeError();
    } else if (placement === "own") {
      throw new TypeError("Own properties are not supported by Babel yet.");
    }

    // 8. Let descriptor be ? ToPropertyDescriptor(? Get(descriptor, "descriptor")).
    var descriptor = elementObject.descriptor;

    // 9. Let initializer be ? Get(descriptor, "initializer").
    // NOT SUPPORTED YET

    // 10. Let finisher be ? Get(descriptor, "finisher").
    // 11. If IsCallable(finisher) is false and finisher is not undefined,
    //     throw a TypeError exception.
    var finisher = _optionalCallableProperty(elementObject, "finisher");

    // 12. Let extrasObject be ? Get(descriptor, "extras").
    // 13. Let extras be ? ToElementDescriptors(extrasObject).
    var extras = _toElementDescriptors(elementObject.extras);

    // 14. Let elements be ? Get(descriptor, "elements").
    // 15. If elements is not undefined, throw a TypeError exception.
    _disallowProperty(elementObject, "elements");

    // 16. If kind not "field",
    // 16.a  If initializer is not undefined, throw a TypeError exception.
    _disallowProperty(elementObject, "initializer");

    // 17. If key is a Private Name,
    // 17.a  If descriptor.[[Enumerable]] is true, throw a TypeError exception.
    // 17.b  If descriptor.[[Configurable]] is true, throw a TypeError exception.
    // 17.c  If placement is "prototype" or "static", throw a TypeError exception.
    // 18. If kind is "field",
    // 18.a  If descriptor has a [[Get]], [[Set]] or [[Value]] internal slot,
    //       throw a TypeError exception.
    // FIELDS AND PRIVATE PROPERTIES ARE NOT SUPPOTED YET

    // 19. Let element be {
    //       [[Kind]]: kind,
    //       [[Key]]: key,
    //       [[Placement]]: placement,
    //       [[Descriptor]]: descriptor
    //     }.
    var element = {
      kind: kind,
      key: key,
      placement: placement,
      descriptor: descriptor
    };

    // 20. If [[Kind]] is "field", set element.[[Initializer]] to initializer.
    // FIELDS ARE NOT SUPPORTED YET

    // 21. Return the Record
    //     { [[Element]]: element, [[Finisher]]: finisher, [[Extras]]: extras }.
    return { element: element, finisher: finisher, extras: extras };
  }

  // FromClassDescriptor
  function _fromClassDescriptor(elements) {
    // 1. Let elementsObjects be FromElementDescriptors(elements).
    // 2. Let obj be ! ObjectCreate(%ObjectPrototype%).
    // 5. Perform ! CreateDataPropertyOrThrow(obj, "kind", "class").
    // 6. Perform ! CreateDataPropertyOrThrow(obj, "elements", elementsObjects).
    var obj = {
      kind: "class",
      elements: elements.map(_fromElementDescriptor)
    };

    // 3. Let desc be PropertyDescriptor{
    //      [[Value]]: "Class Descriptor",
    //      [[Writable]]: false,
    //      [[Enumerable]]: false,
    //      [[Configurable]]: true
    //    }.
    var desc = { value: "Class Descriptor", configurable: true };

    // 4. Perform ! DefinePropertyOrThrow(obj, @@toStringTag, desc).
    Object.defineProperty(obj, Symbol.toStringTag, desc);

    // 7. Return obj.
    return obj;
  }

  // ToClassDescriptor
  function _toClassDescriptor(obj) {
    // 1. Let kind be ? ToString(? Get(obj, "kind").
    var kind = String(obj.kind);

    // 2. If kind is not "class", throw a TypeError exception.
    if (kind !== "class") throw new TypeError();

    // 3. Let key be ? Get(obj, "key").
    // 4. If key is not undefined, throw a TypeError exception.
    _disallowProperty(obj, "key");

    // 5. Let placement be ? Get(obj, "placement").
    // 6. If placement is not undefined, throw a TypeError exception.
    _disallowProperty(obj, "placement");

    // 7. Let descriptor be ? Get(obj, "descriptor").
    // 8. If descriptor is not undefined, throw a TypeError exception.
    _disallowProperty(obj, "descriptor");

    // 9. Let initializer be ? Get(obj, "initializer").
    // 10. If initializer is not undefined, throw a TypeError exception.
    _disallowProperty(obj, "initializer");

    // 11. Let extras be ? Get(obj, "extras").
    // 12. If extras is not undefined, throw a TypeError exception.
    _disallowProperty(obj, "extras");

    // 13. Let finisher be ? Get(obj, "finisher").
    // 14. If finisher is not undefined,
    // 14.a  If IsCallable(finisher) is false, throw a TypeError exception.
    var finisher = _optionalCallableProperty(obj, "finisher");

    // 15. Let elementsObject be ? Get(obj, "elements").
    // 16. Let elements be ? ToElementDescriptors(elementsObject).
    var elements = _toElementDescriptors(obj.elements);

    // 17. Return the Record { [[Elements]]: elements, [[Finisher]]: finisher }.
    return { elements: elements, finisher: finisher };
  }

  function _disallowProperty(obj, name) {
    if (obj[name] !== undefined) {
      throw new TypeError("Unexpected '" + name + "' property.");
    }
  }

  function _optionalCallableProperty(obj, name) {
    var value = obj[name];
    if (value !== undefined && typeof value !== "function") {
      throw new TypeError("Expected '" + name + "' to be a function");
    }
    return value;
  }
`;
