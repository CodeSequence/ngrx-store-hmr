import { Store } from '@ngrx/store';
import { ComponentRef } from 'angular2/core';


export function hotModuleReplacement(
  bootloader: (state?: any) => Promise<ComponentRef>,
  module: any,
  LOCAL?: boolean,
  LOCALSTORAGE_KEY: string = '@ngrx/store/hmr'
) {
  let COMPONENT_REF: ComponentRef;
  let DATA = module.hot.data;


  console.log('DATA', DATA);
  if (!DATA && LOCAL) {
    try {
      console.time('start localStorage');
      DATA = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY)) || DATA;
      console.timeEnd('start localStorage');
    } catch (e) {
      console.log('JSON.parse Error', e);
    }
  }
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
    const json = JSON.stringify(appState.getState());

    if (LOCAL) {
      console.time('localStorage');
      localStorage.setItem(LOCALSTORAGE_KEY, json);
      console.timeEnd('localStorage');
    }
    return json;
  }

  function beforeunload(event) {
    const appState: Store<any> = COMPONENT_REF.injector.get(Store);
    return saveState(appState);
  }
  (<any>window).WEBPACK_HMR_beforeunload = () => {
    window.removeEventListener('beforeunload', beforeunload);
    if (LOCAL) {
      localStorage.removeItem(LOCALSTORAGE_KEY);
    }
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
    const json = saveState(appState);

    (<any>Object).assign(data, json);

    COMPONENT_REF.dispose();

    newNode.style.display = currentDisplay;

    window.removeEventListener('beforeunload', beforeunload);
    console.timeEnd('dispose');
  });
}
