import { FETCH_SCRATCHES } from '../Actions/types';

const INITIAL_STATE = {
  scratches: [],
  nextPage: false,
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case FETCH_SCRATCHES: {
      return { ...state, scratches: action.payload, nextPage: action.nextPage };
    }
    default:
      return state;
  }
}
