import {
  SIGNIN_SUCCESS,
  SIGNOUT_SUCCESS,
  FETCH_USER_PROFILE,
  FETCH_INTETESTS_OPTIONS,
  FETCH_USER_INTERESTS,
  FETCH_RANK_REWARDS,
} from '../Actions/types';

const INITIAL_STATE = {
  userProfile: null,
  token: null,
  refreshToken: null,
  interestsOptions: [],
  minigameRankRewards: {},
  affiliateRankRewards: {},
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SIGNIN_SUCCESS: {
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refresh_token,
      };
    }
    case SIGNOUT_SUCCESS: {
      return { ...state, ...INITIAL_STATE };
    }
    case FETCH_USER_PROFILE: {
      return { ...state, userProfile: action.payload };
    }
    case FETCH_INTETESTS_OPTIONS: {
      return { ...state, interestsOptions: action.payload };
    }
    case FETCH_USER_INTERESTS: {
      return { ...state, userInterests: action.payload };
    }
    case FETCH_RANK_REWARDS: {
      return {
        ...state,
        minigameRankRewards: action.minigameRankRewards,
        affiliateRankRewards: action.affiliateRankRewards,
      };
    }
    default:
      return state;
  }
}
