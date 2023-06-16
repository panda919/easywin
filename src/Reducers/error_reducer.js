import {
  ERROR,
  CLEAR_ERROR,
  SHOW_SUCCESS,
  CLEAR_SUCCESS,
  INFO,
  CLEAR_INFO,
  POPUP,
  CLEAR_POPUP,
} from '../Actions/types';

const INITIAL_STATE = {
  errorMessage: '',
  successMessage: '',
  infoMessage: '',
  errorAction: null,
  showPopup: false,
  popupChildren: null,
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case ERROR: {
      if (action.errorAction)
        return {
          ...state,
          errorMessage: action.payload,
          errorAction: action.errorAction,
        };
      else return { ...state, errorMessage: action.payload, errorAction: null };
    }
    case CLEAR_ERROR: {
      return { ...state, errorMessage: '', errorAction: null };
    }
    case SHOW_SUCCESS: {
      return { ...state, successMessage: action.payload };
    }
    case CLEAR_SUCCESS: {
      return { ...state, successMessage: '' };
    }
    case INFO: {
      return { ...state, infoMessage: action.payload };
    }
    case CLEAR_INFO: {
      return { ...state, infoMessage: '' };
    }
    case POPUP: {
      return {
        ...state,
        showPopup: action.payload,
        popupChildren: action.children,
      };
    }
    case CLEAR_POPUP: {
      return { ...state, showPopup: false, popupChildren: null };
    }
    default:
      return state;
  }
}
