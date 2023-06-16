import { FETCH_MINIGAMES, FETCH_MINIGAME_RANKING,CLEAR_MINIGAME_RANKING} from '../Actions/types';

const INITIAL_STATE = {
  minigames: [],
  minigameRanking: [],
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case FETCH_MINIGAMES: {
      return { ...state, minigames: action.payload };
    }
    case FETCH_MINIGAME_RANKING: {
      return { ...state, minigameRanking: action.payload };
    }
    case CLEAR_MINIGAME_RANKING: {
      return { ...state, minigameRanking: [] };
    }
    default:
      return state;
  }
}
