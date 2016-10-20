import React from "react";
import {deepEqual, deepAssign} from "./lib";

const DefaultOptions = {
  cacheTime: 5 * 60 * 1000, // 5 minutes
  cacheLimit: 5,
  hooks: {
    beforeSwitch(oldViewId, newViewId){
    },
    afterSwitch(oldViewId, newViewId){
    },
  }
};

export default function createCache(options) {
  class Cache extends React.Component {
    static options = deepAssign(deepAssign({}, DefaultOptions), options);

    static propTypes = {
      viewId: React.PropTypes.string.isRequired,
      view: React.PropTypes.oneOfType([
        React.PropTypes.func,
        React.PropTypes.node,
      ]).isRequired,
      cacheTime: React.PropTypes.number
    };

    state = {
      activeId: '',

      // {id, view, cacheTime, cacheTimer, lastActivatedAt}
      viewItems: [],
    };

    componentWillMount() {
      this.refresh(this.props);
    }

    componentWillReceiveProps(nextProps) {
      this.refresh(nextProps);
    }

    componentWillUnmount() {
      const { viewItems } = this.state;
      viewItems.forEach(item => clearTimeout(item.cacheTimer));
    }

    componentWillUpdate(nextProps, nextState) {
      const oldId = this.state.activeId;
      const newId = nextState.activeId;
      if (oldId !== newId) Cache.options.hooks.beforeSwitch(oldId, newId);
    }

    componentDidUpdate(prevProps, prevState) {
      const oldId = prevState.activeId;
      const newId = this.state.activeId;
      if (oldId !== newId) Cache.options.hooks.afterSwitch(oldId, newId);
    }

    render() {
      const { activeId, viewItems } = this.state;

      return (
        <div>
          {
            viewItems.map(item => {
              const isActive = item.id === activeId;
              return <div key={item.id} style={{ display: isActive ? undefined : 'none' }}>
                {
                  typeof item.view === 'function' ?
                    <View args={{ isActive }} view={item.view}/> : item.view
                }
              </div>
            })
          }
        </div>
      )
    }

    refresh(props) {
      const { viewId, view, cacheTime } = props;
      const { activeId, viewItems } = this.state;

      if (!viewId) {
        // set cache timer for switch-out item
        const preViewItem = viewItems.find(item => item.id === activeId);
        this.setCacheTimer(preViewItem);
      }
      else {
        const viewItem = viewItems.find(item => item.id === viewId);
        if (viewItem) {
          // update item
          viewItem.view = view;
          viewItem.cacheTime = cacheTime;
          viewItem.lastActivatedAt = new Date;

          if (viewId !== activeId) {
            // remove cache timer for switch-in item
            clearTimeout(viewItem.cacheTimer);

            // set cache timer for switch-out item
            const preViewItem = viewItems.find(item => item.id === activeId);
            this.setCacheTimer(preViewItem)
          }
        }
        else {
          // create new item
          const newViewItem = {
            id: viewId,
            view: view,
            cacheTime: cacheTime,
            lastActivatedAt: new Date,
          };
          viewItems.push(newViewItem);

          // set cache timer for previous item
          const preViewItem = viewItems.find(item => item.id === activeId);
          this.setCacheTimer(preViewItem);

          // remove oldest surplus item
          if (viewItems.length > this.getCacheLimit()) {
            const oldestItem = viewItems.reduce(
              (min, cur) => cur.lastActivatedAt < min.lastActivatedAt ? cur : min,
              viewItems[ 0 ]
            );
            if (oldestItem) {
              clearTimeout(oldestItem.cacheTimer);
              viewItems.splice(viewItems.findIndex(item => item === oldestItem), 1);
            }
          }
        }
      }

      // update state
      this.setState({
        activeId: viewId,
        viewItems: viewItems,
      })
    }

    expireItem(id) {
      const { viewItems } = this.state;
      const index = viewItems.findIndex(item => item.id === id);
      if (index >= 0) {
        const viewItem = viewItems[ index ];
        clearTimeout(viewItem.cacheTimer);
        viewItems.splice(index, 1);
        this.setState({ viewItems });
      }
    }

    setCacheTimer(item) {
      if (item) {
        clearTimeout(item.cacheTimer);
        const cacheTime = this.getCacheTime(item);
        item.cacheTimer = setTimeout(() => this.expireItem(item.id), cacheTime);
      }
    }

    getCacheTime(item) {
      if (item.cacheTime !== undefined) return item.cacheTime;
      else return Cache.options.cacheTime;
    }

    getCacheLimit() {
      return Cache.options.cacheLimit;
    }
  }

  // optimize re-render
  class View extends React.Component {
    static propTypes = {
      args: React.PropTypes.object,
      view: React.PropTypes.func.isRequired,
    };

    shouldComponentUpdate(nextProps) {
      return !deepEqual(this.props, nextProps);
    }

    render() {
      const { args, view } = this.props;
      return view(args);
    }
  }

  return Cache;
}
