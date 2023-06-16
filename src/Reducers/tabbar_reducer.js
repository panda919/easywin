import { CLEAR_BOTTOM_SHEET, CLOSE_BOTTOM_SHEET, OPEN_BOTTOM_SHEET } from "../Actions/types";

const INITIAL_STATE = { tabbarVisible: true, bottomSheetCount: 0 };

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case OPEN_BOTTOM_SHEET: {
      let count = state.bottomSheetCount;
      return { ...state, bottomSheetCount: count > 0 ? count + 1 : 1 };
    }
    case CLOSE_BOTTOM_SHEET: {
      let count = state.bottomSheetCount;
      return { ...state, bottomSheetCount: count > 2 ? 0 : count - 1};
    }
    case CLEAR_BOTTOM_SHEET: {
      return { ...state, bottomSheetCount:  0 };
    }
    default:
      return state;
  }
}
