import React from "react";
import createCache from "react-view-cache";
import {FlowRouter} from "meteor/kadira:flow-router";
import {mount} from "react-mounter";

import SomePage from "./some_page";

// 1. setup things for scroll restoration
const scrollStore = {};
const scrollHelper = {
  saveScroll(id) {
    scrollStore[ id ] = document.body.scrollTop;
  },

  loadScroll(id) {
    document.body.scrollTop = scrollStore[ id ];
  },

  clearScroll(id) {
    delete scrollStore[ id ];
  }
};

// 2. create cache
// - config it with options
// - config hooks for scroll restoration
const Cache = createCache({
  cacheTime: 5 * 60 * 1000, // optional
  cacheLimit: 10, // optional
  hooks: {
    beforeSwitch(oldId, newId) {
      if (oldId) scrollHelper.saveScroll(oldId);
    },
    afterSwitch(oldId, newId) {
      if (newId) scrollHelper.loadScroll(newId);
    },
    beforeRemove(id) {
      if (id) scrollHelper.clearScroll(id);
    }
  }
});

// 3. mount pages ...
FlowRouter.route('/page_path', {
  name: 'page_name',
  action(params, query) {
    mount(Cache, {
      viewId: 'pageId',
      view: <SomePage arg1={params.arg1} arg2={query.arg2}/>,
    })
  }
});
