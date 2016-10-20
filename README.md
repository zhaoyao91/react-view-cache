# React View Cache
cache react views.

## Introduction
With react-view-cache, you can render your components within a special **Cache** component. When you render another 
component within the same cache, the previous component will not unmount immediately, but just hide by being set as 
`display: none`, with all state reserved.

It's great to cache pages in a SPA. By saving and restoring scroll in cache hooks, you will get an optimized app. When 
you browse back and forward, the previous page shows up immediately with the old scroll without any reloading. More, you 
will also make less effort to manage data and states between pages.

## Basic Usage
```
import createCache from "react-view-cache";
const Cache = createCache();

...

const view = <Component ... />; // your component
const viewId = ...; // unique cache id for this component

...

<Cache viewId={viewId} view={view}/>
```

## Options
You can pass in options as the args of `createCache`, or modify them on the created `Cache` instance.
```
const Cache = createCache(options)
// or
Cache.options.xxx = ...
```

* cacheTime - number, milliseconds, default 5 * 60 * 1000
* cacheLimit - number, default 5
* hooks
  * beforeSwitch(oldViewId, newViewId)
  * afterSwitch(oldViewId, newViewId)
  * beforeAdd(viewId)
  * afterAdd(viewId)
  * beforeRemove(viewId)
  * afterRemove(viewId)
  
## Cache
Cache will render component by current props, and the previous components will be hidden.

### props
* viewId - unique cache id for this component
* view - one of the following types
  * react node
  * func({isActive}): react node
* [cacheTime] - optional, cache time for this component
  
## Examples
- [Cache page with scroll restoration](https://github.com/zhaoyao91/react-view-cache/blob/master/examples/cache_page_with_scroll_restoration/index.js)
  
## License
MIT