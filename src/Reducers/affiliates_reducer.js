import { CLEAR_AFFILIATES, FETCH_AFFILIATES } from '../Actions/types';

const INITIAL_STATE = {
  affiliates: [],
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case FETCH_AFFILIATES: {
      return { ...state, affiliates: action.payload };
    }
    case CLEAR_AFFILIATES: {
      return { ...state, affiliates: [] };
    }
    default:
      return state;
  }
}
