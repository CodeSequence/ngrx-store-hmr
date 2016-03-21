# @ngrx/store HMR
Experimental HMR support for @ngrx/store based on [angular2-hmr](https://github.com/gdi2290/angular2-hmr)


## Setup
In order for your application to have HMR support, you need to wrap your bootstrap call in a function that receives an optional HMR state object:

```ts
import { hotModuleReplacement } from 'ngrx-store-hmr';

// Wrap bootstrap in a function that accept an optional hmrState
function main(hmrState?: any) {
  return bootstrapp(App, [
    provideStore(reducer, hmrState)
  ]);
}

if(module.hot) {
  hotModuleReplacement(main, module);
}
else {
  document.addEventListener('DOMContentLoaded', () => main);
}
```
