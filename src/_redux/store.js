import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import rootReducer from './_reducers';

let middleware = [thunkMiddleware];

if(process.env.REACT_APP_NO_REDUX_LOGGING !== 'true'){
  let loggerMiddleware = createLogger();
  middleware = [...middleware,loggerMiddleware];
}

export const store = createStore(
  rootReducer,
  applyMiddleware(...middleware)
);