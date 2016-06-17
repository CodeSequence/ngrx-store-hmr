import { Store } from '@ngrx/store';
import { ComponentRef } from '@angular/core';
import 'rxjs/add/operator/take';

export function hotModuleReplacement(
  bootloader: (state?: any) => Promise<ComponentRef<any>>,
  /* tslint:disable:no-reserved-keywords */
  module: any
  /* tslint:disable:no-reserved-keywords */
): any {
  let disposed: boolean = false;
  let COMPONENT_REF: ComponentRef<any>;
  let DATA = !!module.hot.data ? module.hot.data.state : undefined;

  console.log('APP STATE', DATA);
  console.time('bootstrap');

  if (document.readyState === 'complete') {
    bootloader(DATA)
      .then((cmpRef: ComponentRef<any>) => COMPONENT_REF = cmpRef)
      .then((cmpRef => (console.timeEnd('bootstrap'), cmpRef)));
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      bootloader(DATA)
        .then((cmpRef: any) => COMPONENT_REF = cmpRef)
        .then((cmpRef => (console.timeEnd('bootstrap'), cmpRef)));
    });
  }

  function saveState(appState: Store<any>): any {
    let state: any;
    appState.take(1).subscribe(s => state = s);
    return state;
  }

  function beforeunload(event: any): any {
    const appState: Store<any> = COMPONENT_REF.injector.get(Store);
    return saveState(appState);
  }

  (<any>window).WEBPACK_HMR_beforeunload = () => {
    window.removeEventListener('beforeunload', beforeunload);
  };

  module.hot.accept();

  window.addEventListener('beforeunload', beforeunload);

  module.hot.dispose((data: any) => {
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

    (<any>Object).assign(data, { state });
    COMPONENT_REF.destroy();
    newNode.style.display = currentDisplay;

    if (!disposed) {
      window.removeEventListener('beforeunload', beforeunload);
    }
    disposed = true;
    console.timeEnd('dispose');
  });
}
