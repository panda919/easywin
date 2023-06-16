import { FETCH_MISSIONS } from '../Actions/types';

const INITIAL_STATE = {
  missions: [],
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case FETCH_MISSIONS: {
      return { ...state, missions: action.payload };
    }
    default:
      return state;
  }
}
