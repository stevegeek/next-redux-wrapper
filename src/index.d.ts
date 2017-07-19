// Type definitions for next-redux-wrapper 1.3.0

/*~ Note that ES6 modules cannot directly export callable functions.
 *~ This file should be imported using the CommonJS-style:
 *~   import x = require('next-redux-wrapper');
 *~
 *~ Refer to the documentation to understand common
 *~ workarounds for this limitation of ES6 modules.
 */

import * as React from 'react';
import {Store} from 'redux';
import {
  MapDispatchToPropsParam, MapStateToPropsParam,
  MergeProps, Options as ConnectOptions
} from 'react-redux';

export = nextReduxWrapper;

interface NextPageComponentMethods {
  getInitialProps?: (props: any) => Promise<any>;
}
type NextReduxWrappedComponent = React.Component & NextPageComponentMethods;

type NextStoreCreator<TInitialState, TStoreState> = (initialState: TInitialState) => Store<TStoreState>;

declare function nextReduxWrapper<TComponent, TInitialState, TStoreState, TStateProps, TDispatchProps, TOwnProps, TMergedProps>(
  options: nextReduxWrapper.Options<TInitialState, TStoreState, TStateProps, TDispatchProps, TOwnProps, TMergedProps>
): (Component: TComponent) => NextReduxWrappedComponent;
declare function nextReduxWrapper<TComponent, TInitialState, TStoreState, TStateProps, TDispatchProps, TOwnProps, TMergedProps>(
  createStore: NextStoreCreator<TInitialState, TStoreState>,
  mapStateToProps?: MapStateToPropsParam<TStateProps, TOwnProps>,
  mapDispatchToProps?: MapDispatchToPropsParam<TDispatchProps, TOwnProps>,
  mergeProps?: MergeProps<TStateProps, TDispatchProps, TOwnProps, TMergedProps>,
  options?: ConnectOptions
): (Component: TComponent) => NextReduxWrappedComponent;

declare namespace nextReduxWrapper {
  export interface Options<TInitialState, TStoreState, TStateProps, TDispatchProps, TOwnProps, TMergedProps> {
    createStore: NextStoreCreator<TInitialState, TStoreState>;
    debug?: boolean;
    storeKey?: string;
    mapStateToProps?: MapStateToPropsParam<TStateProps, TOwnProps>;
    mapDispatchToProps?: MapDispatchToPropsParam<TDispatchProps, TOwnProps>;
    mergeProps?: MergeProps<TStateProps, TDispatchProps, TOwnProps, TMergedProps>;
    connectOptions?: ConnectOptions;
  }

  export function setPromise(promise: Promise<any>): void;
  export function setDebug(debug: boolean): void;
}
