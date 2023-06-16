import { FETCH_EARNINGS, FETCH_USER_EARNINGS } from '../Actions/types';

const INITIAL_STATE = {
  earnings: [],
  myEarnings: [],
  nextPage: false,
  loadingMore: false
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case FETCH_EARNINGS: {
      return { ...state, earnings: action.payload };
    }
    case FETCH_USER_EARNINGS: {
      return { ...state, myEarnings: action.payload, nextPage: action.nextPage, loadingMore: action.loadingMore };
    }
    default:
      return state;
  }
}
