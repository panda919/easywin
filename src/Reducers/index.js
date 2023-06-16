import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-community/async-storage';
import userReducer from './user_reducer';
import errorHandler from './error_reducer';
import missionsReducer from './missions_reducer';
import earningsReducer from './earnings_reducer';
import tabbarReducer from './tabbar_reducer';
import citiesReducer from './cities_reducer';
import concoursReducer from './concours_reducer';
import affiliatesReducer from './affiliates_reducer';
import minigamesReducer from './minigames_reducer';
import scratchesReducer from './scratches_reducer';


const whitelist = [
  'userReducer',
  'concoursReducer',
  'scratchesReducer',
  'missionsReducer',
  'affiliatesReducer',
  'minigamesReducer',
];

const rootReducerConfig = {
  key: 'EW_Primary',
  storage: AsyncStorage,
  whitelist,
};

const rootReducer = combineReducers({
  userReducer,
  errorHandler,
  missionsReducer,
  earningsReducer,
  tabbarReducer,
  citiesReducer,
  concoursReducer,
  affiliatesReducer,
  minigamesReducer,
  scratchesReducer
});

export default (persistedReducers = persistReducer(
  rootReducerConfig,
  rootReducer,
));
