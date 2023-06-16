import { OPEN_BOTTOM_SHEET, CLOSE_BOTTOM_SHEET, CLEAR_BOTTOM_SHEET } from './types';
import store from '../Store';

export const showBottomSheet = () =>
  store.dispatch({ type: OPEN_BOTTOM_SHEET });
export const hideBottomSheet = () =>
  store.dispatch({ type: CLOSE_BOTTOM_SHEET });
  export const clearBottomSheet = () =>
  store.dispatch({ type: CLEAR_BOTTOM_SHEET });
