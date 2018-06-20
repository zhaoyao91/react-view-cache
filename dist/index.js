"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = createCache;

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _lib = require("./lib");

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DefaultOptions = {
  cacheTime: 5 * 60 * 1000, // 5 minutes
  cacheLimit: 5,
  hooks: {
    beforeSwitch: function beforeSwitch(oldViewId, newViewId) {},
    afterSwitch: function afterSwitch(oldViewId, newViewId) {},
    beforeAdd: function beforeAdd(viewId) {},
    afterAdd: function afterAdd(viewId) {},
    beforeRemove: function beforeRemove(viewId) {},
    afterRemove: function afterRemove(viewId) {}
  }
};

function createCache(options) {
  var Cache = function (_React$Component) {
    _inherits(Cache, _React$Component);

    function Cache() {
      var _ref;

      var _temp, _this, _ret;

      _classCallCheck(this, Cache);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Cache.__proto__ || Object.getPrototypeOf(Cache)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
        activeId: '',

        // {id, view, cacheTime, cacheTimer, lastActivatedAt}
        viewItems: []
      }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Cache, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        this.refresh(this.props);
      }
    }, {
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(nextProps) {
        this.refresh(nextProps);
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        var viewItems = this.state.viewItems;

        viewItems.forEach(function (item) {
          return clearTimeout(item.cacheTimer);
        });

        Cache.options.hooks.beforeSwitch(this.state.activeId, '');
        Cache.options.hooks.afterSwitch(this.state.activeId, '');

        (0, _lib.getIds)(viewItems).forEach(function (id) {
          Cache.options.hooks.beforeRemove(id);
          Cache.options.hooks.afterRemove(id);
        });
      }
    }, {
      key: "componentWillUpdate",
      value: function componentWillUpdate(nextProps, nextState) {
        var oldId = this.state.activeId;
        var newId = nextState.activeId;
        var oldIds = (0, _lib.getIds)(this.state.viewItems);
        var newIds = (0, _lib.getIds)(nextState.viewItems);
        var addedIds = (0, _lib.difference)(newIds, oldIds);
        var removedIds = (0, _lib.difference)(oldIds, newIds);

        if (oldId !== newId) Cache.options.hooks.beforeSwitch(oldId, newId);
        addedIds.forEach(function (id) {
          return Cache.options.hooks.beforeAdd(id);
        });
        removedIds.forEach(function (id) {
          return Cache.options.hooks.beforeRemove(id);
        });
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps, prevState) {
        var oldId = prevState.activeId;
        var newId = this.state.activeId;
        var oldIds = (0, _lib.getIds)(prevState.viewItems);
        var newIds = (0, _lib.getIds)(this.state.viewItems);
        var addedIds = (0, _lib.difference)(newIds, oldIds);
        var removedIds = (0, _lib.difference)(oldIds, newIds);

        if (oldId !== newId) Cache.options.hooks.afterSwitch(oldId, newId);
        addedIds.forEach(function (id) {
          return Cache.options.hooks.afterAdd(id);
        });
        removedIds.forEach(function (id) {
          return Cache.options.hooks.afterRemove(id);
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _state = this.state,
            activeId = _state.activeId,
            viewItems = _state.viewItems;


        return _react2.default.createElement(
          "div",
          null,
          viewItems.map(function (item) {
            var isActive = item.id === activeId;
            return _react2.default.createElement(
              "div",
              { key: item.id, style: { display: isActive ? undefined : 'none' } },
              typeof item.view === 'function' ? _react2.default.createElement(View, { args: { isActive: isActive }, view: item.view }) : item.view
            );
          })
        );
      }
    }, {
      key: "refresh",
      value: function refresh(props) {
        var viewId = props.viewId,
            view = props.view,
            cacheTime = props.cacheTime;
        var _state2 = this.state,
            activeId = _state2.activeId,
            viewItems = _state2.viewItems;


        var newViewItems = viewItems.slice();

        if (!viewId) {
          // set cache timer for switch-out item
          var preViewItem = newViewItems.find(function (item) {
            return item.id === activeId;
          });
          this.setCacheTimer(preViewItem);
        } else {
          var viewItem = newViewItems.find(function (item) {
            return item.id === viewId;
          });
          if (viewItem) {
            // update item
            viewItem.view = view;
            viewItem.cacheTime = cacheTime;
            viewItem.lastActivatedAt = new Date();

            if (viewId !== activeId) {
              // remove cache timer for switch-in item
              clearTimeout(viewItem.cacheTimer);

              // set cache timer for switch-out item
              var _preViewItem = newViewItems.find(function (item) {
                return item.id === activeId;
              });
              this.setCacheTimer(_preViewItem);
            }
          } else {
            // create new item
            var newViewItem = {
              id: viewId,
              view: view,
              cacheTime: cacheTime,
              lastActivatedAt: new Date()
            };
            newViewItems.push(newViewItem);

            // set cache timer for previous item
            var _preViewItem2 = newViewItems.find(function (item) {
              return item.id === activeId;
            });
            this.setCacheTimer(_preViewItem2);

            // remove oldest surplus item
            if (newViewItems.length > this.getCacheLimit()) {
              var oldestItem = newViewItems.reduce(function (min, cur) {
                return cur.lastActivatedAt < min.lastActivatedAt ? cur : min;
              }, newViewItems[0]);
              if (oldestItem) {
                clearTimeout(oldestItem.cacheTimer);
                newViewItems.splice(newViewItems.findIndex(function (item) {
                  return item === oldestItem;
                }), 1);
              }
            }
          }
        }

        // update state
        this.setState({
          activeId: viewId,
          viewItems: newViewItems
        });
      }
    }, {
      key: "expireItem",
      value: function expireItem(id) {
        var viewItems = this.state.viewItems;

        var viewItem = viewItems.find(function (item) {
          return item.id === id;
        });
        if (viewItem) {
          clearTimeout(viewItem.cacheTimer);
          var newViewItems = viewItems.filter(function (item) {
            return item !== viewItem;
          });
          this.setState({ viewItems: newViewItems });
        }
      }
    }, {
      key: "setCacheTimer",
      value: function setCacheTimer(item) {
        var _this2 = this;

        if (item) {
          clearTimeout(item.cacheTimer);
          var cacheTime = this.getCacheTime(item);
          item.cacheTimer = setTimeout(function () {
            return _this2.expireItem(item.id);
          }, cacheTime);
        }
      }
    }, {
      key: "getCacheTime",
      value: function getCacheTime(item) {
        if (item.cacheTime !== undefined) return item.cacheTime;else return Cache.options.cacheTime;
      }
    }, {
      key: "getCacheLimit",
      value: function getCacheLimit() {
        return Cache.options.cacheLimit;
      }
    }]);

    return Cache;
  }(_react2.default.Component);

  // optimize re-render


  Cache.options = (0, _lib.deepAssign)((0, _lib.deepAssign)({}, DefaultOptions), options);
  Cache.propTypes = {
    viewId: _react2.default.PropTypes.string.isRequired,
    view: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.func, _react2.default.PropTypes.node]).isRequired,
    cacheTime: _react2.default.PropTypes.number
  };

  var View = function (_React$Component2) {
    _inherits(View, _React$Component2);

    function View() {
      _classCallCheck(this, View);

      return _possibleConstructorReturn(this, (View.__proto__ || Object.getPrototypeOf(View)).apply(this, arguments));
    }

    _createClass(View, [{
      key: "shouldComponentUpdate",
      value: function shouldComponentUpdate(nextProps) {
        return !(0, _lib.deepEqual)(this.props, nextProps);
      }
    }, {
      key: "render",
      value: function render() {
        var _props = this.props,
            args = _props.args,
            view = _props.view;

        return view(args);
      }
    }]);

    return View;
  }(_react2.default.Component);

  View.propTypes = {
    args: _react2.default.PropTypes.object,
    view: _react2.default.PropTypes.func.isRequired
  };


  return Cache;
}