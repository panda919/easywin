import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import persistedReducers from '../Reducers';
import reactotron from './ReactotronConfig';

const enhancer = __DEV__
  ? compose(
      applyMiddleware(thunk),
      reactotron.createEnhancer(),
    )
  : compose(applyMiddleware(thunk));
export default createStore(
  persistedReducers,
  {}, //state
  enhancer,
);
