import { Store } from '@ngrx/store';
import { ComponentRef } from 'angular2/core';


export function hotModuleReplacement(
  bootloader: (state?: any) => Promise<ComponentRef>,
  module: any
) {
  let COMPONENT_REF: ComponentRef;
  let DATA = !!module.hot.data ?
    module.hot.data.state :
    undefined;

  console.log('APP STATE', DATA);

  console.time('bootstrap');
  if (document.readyState === 'complete') {
    bootloader(DATA)
      .then((cmpRef: ComponentRef) => COMPONENT_REF = cmpRef)
      .then((cmpRef => (console.timeEnd('bootstrap'), cmpRef)));
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      bootloader(DATA)
        .then((cmpRef: any) => COMPONENT_REF = cmpRef)
        .then((cmpRef => (console.timeEnd('bootstrap'), cmpRef)));
    });
  }

  function saveState(appState: Store<any>) {
    return appState.getState();
  }

  function beforeunload(event) {
    const appState: Store<any> = COMPONENT_REF.injector.get(Store);
    return saveState(appState);
  }
  (<any>window).WEBPACK_HMR_beforeunload = () => {
    window.removeEventListener('beforeunload', beforeunload);
  };

  module.hot.accept();

  window.addEventListener('beforeunload', beforeunload);

  module.hot.dispose(data => {
    console.time('dispose');
    const componentNode = COMPONENT_REF.location.nativeElement;
    const newNode = document.createElement(componentNode.tagName);
    // display none
    const currentDisplay = newNode.style.display;
    newNode.style.display = 'none';
    const parentNode = componentNode.parentNode;
    parentNode.insertBefore(newNode, componentNode);

    const appState: Store<any> = COMPONENT_REF.injector.get(Store);
    const state = saveState(appState);

    (<any>Object).assign(data, { state  });

    COMPONENT_REF.dispose();

    newNode.style.display = currentDisplay;

    window.removeEventListener('beforeunload', beforeunload);
    console.timeEnd('dispose');
  });
}
