var React = require('react');
var ReactRedux = require('react-redux');

var connect = ReactRedux.connect;
var Provider = ReactRedux.Provider;

var _Promise;
var _debug = false;
var skipMerge = ['initialState', 'initialProps', 'isServer', 'store'];
var connectArgs = ['mapStateToProps', 'mapDispatchToProps', 'mergedProps', 'connectOptions'];
var DEFAULT_KEY = '__NEXT_REDUX_STORE__';

function initStore(makeStore, req, query, initialState, config) {

    var isServer = !!req && typeof window === 'undefined';
    var storeKey = config.storeKey;

    var options = Object.assign({}, config, {
        isServer: isServer,
        req: req,
        query: query
    });

    // Always make a new store if server
    if (isServer) {
        if (!req._store) {
            req._store = makeStore(initialState, options);
        }
        return req._store;
    }

    // Memoize store if client
    if (!window[storeKey]) {
        window[storeKey] = makeStore(initialState, options);
    }

    return window[storeKey];

}

module.exports = function(createStore) {

    var config = {storeKey: DEFAULT_KEY, debug: false};
    var connectArgs;

    // Ensure backwards compatibility, the config object should come last after connect arguments.
    if (typeof createStore === 'object') {

        var wrappedConfig = createStore;

        if (!({}).hasOwnProperty.call(wrappedConfig, 'createStore')) {
            throw new Error('Missing createStore function');
        }
        createStore = wrappedConfig.createStore;

        // Set all config keys if they exist.
        if (({}).hasOwnProperty.call(wrappedConfig, 'debug')) {
            config.debug = wrappedConfig.debug;
        }

        if (({}).hasOwnProperty.call(wrappedConfig, 'storeKey')) {
            config.storeKey = wrappedConfig.storeKey;
        }

        // Map the connect arguments from the passed in config object.
        connectArgs = [
            wrappedConfig.mapStateToProps || undefined,
            wrappedConfig.mapDispatchToProps || undefined,
            wrappedConfig.mergeProps || undefined,
            wrappedConfig.connectOptions || undefined,
        ];

    } else {
        connectArgs = [].slice.call(arguments).slice(1);
    }

    var debug = _debug || config.debug;

    return function(Cmp) {

        // Since provide should always be after connect we connect here
        var ConnectedCmp = (connect.apply(null, connectArgs))(Cmp);

        function WrappedCmp(props) {

            props = props || {};

            var initialState = props.initialState || {};
            var initialProps = props.initialProps || {};
            var hasStore = props.store && props.store.dispatch && props.store.getState;
            var store = hasStore
                ? props.store
                : initStore(createStore, {}, {}, initialState, config); // client case, no store but has initialState

            if (debug) console.log(Cmp.name, '- 4. WrappedCmp.render', (hasStore ? 'picked up existing one,' : 'created new store with'), 'initialState', initialState);

            // Fix for _document
            var mergedProps = {};
            Object.keys(props).forEach(function(p) { if (!~skipMerge.indexOf(p)) mergedProps[p] = props[p]; });
            Object.keys(initialProps || {}).forEach(function(p) { mergedProps[p] = initialProps[p]; });

            return React.createElement( //FIXME This will create double Provider for _document case
                Provider,
                {store: store},
                React.createElement(ConnectedCmp, mergedProps)
            );

        }

        WrappedCmp.getInitialProps = function(ctx) {

            return new _Promise(function(res) {

                ctx = ctx || {};

                if (debug) console.log(Cmp.name, '- 1. WrappedCmp.getInitialProps wrapper', (ctx.req && ctx.req._store ? 'takes the req store' : 'creates the store'));

                ctx.isServer = !!ctx.req;
                ctx.store = initStore(createStore, ctx.req, ctx.query, undefined /** initialState **/, config);

                res(_Promise.all([
                    ctx.isServer,
                    ctx.store,
                    ctx.req,
                    Cmp.getInitialProps ? Cmp.getInitialProps.call(Cmp, ctx) : {}
                ]));

            }).then(function(arr) {

                if (debug) console.log(Cmp.name, '- 3. WrappedCmp.getInitialProps has store state', arr[1].getState());

                return {
                    isServer: arr[0],
                    store: arr[1],
                    initialState: arr[1].getState(),
                    initialProps: arr[3]
                };

            });

        };

        return WrappedCmp;

    };

};

module.exports.setPromise = function(Promise) {
    _Promise = Promise;
};

module.exports.setDebug = function(debug) {
    _debug = debug;
};

module.exports.setPromise(Promise);