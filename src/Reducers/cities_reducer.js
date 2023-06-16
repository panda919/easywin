import { FETCH_CITIES } from "../Actions/types";

const INITIAL_STATE = {
  cities: [],
  nextPage: false,
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case FETCH_CITIES: {
      return { ...state, cities: action.payload, nextPage: action.nextPage };
    }
    default:
      return state;
  }
}
