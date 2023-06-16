import {
  SIGNIN_SUCCESS,
  SIGNOUT_SUCCESS,
  FETCH_USER_PROFILE,
  FETCH_INTETESTS_OPTIONS,
  FETCH_RANK_REWARDS,
} from './types';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import store from '../Store';
import {
  apiPut,
  apiPost,
  apiGet,
} from '../Utils/functions';
import { errorMessage } from './ErrorActions';
import { LMSText } from '../Languages/LMSText';
import Lang from '../Languages/LanguageStr';
import AsyncStorage from '@react-native-community/async-storage';

export const signUpWithEmailAndPasswordAction = ({
  firstname,
  lastname,
  email,
  password,
  sponsorCode,
  data_authorization,
}) => async (dispatch, getState) => {
  const data = {
    firstname,
    lastname,
    email,
    plainPassword: password,
    roles: ['ROLE_USER'],
    sponsorCode,
    data_authorization,
  };

  let res = await apiPost('/users', data, true);
  console.log("signup res>>>>", res);
  if (res && res.data) {
    return res;
  } else if (res && res.error) {
    if (res.error.data && res.error.data.message) {
      errorMessage(res.error.data.message);
    } else {
      errorMessage(LMSText(Lang.auth.couldNotSignUpAtTheMoment));
    }
    return false;
  } else {
    errorMessage(LMSText(Lang.auth.couldNotSignUpAtTheMoment));
    return false;
  }
};
export const getCurrentServerTime = async () => {
  try {
    let res = await apiGet('/getCurrentServerTime', true);
    if (res && res.data) {
      return res.data;
    } else if (res && res.error) {
      return false;
    }
  } catch (error) {
    return false;
  }
};

export const authSSOAction = (token, type, appleData) => async (
  dispatch,
  getState,
) => {
  let endpoint = '/users/';
  if (type == 'google') {
    endpoint = endpoint + 'google_login';
  } else if (type == 'facebook') {
    endpoint = endpoint + 'facebook_login';
  } else if (type == 'apple') {
    endpoint = endpoint + 'apple_login';
  }
  let loginPayload = { token };
  if (appleData) {
    loginPayload = appleData;
  }
  let res = await apiPost(endpoint, loginPayload, true);
  if (res && res.data) {
    dispatch({ type: SIGNIN_SUCCESS, payload: res.data });
    return true;
  } else if (res && res.error) {
    console.log('authSSOAction res.error', res.error);
    return false;
  } else {
    errorMessage(LMSText(Lang.auth.couldNotSignInAtTheMoment));
    return false;
  }
};

export const signInWithEmailAndPasswordAction = ({ email, password }) => async (
  dispatch,
  getState,
) => {
  const data = {
    email,
    password,
  };
  let res = await apiPost('/login_check', data, true);
  if (res && res.data) {
    dispatch({ type: SIGNIN_SUCCESS, payload: res.data });
    await AsyncStorage.setItem('bearerToken', res?.data?.token)
    return true;
  } else if (res && res.error) {
    //handle error
    console.log('login error', res.error);
    if (res.error.status == 401 && res.error.data && res.error.data.message) {
      errorMessage(LMSText(Lang.auth.invalidCredentials));
    } else {
      errorMessage(LMSText(Lang.auth.couldNotSignInAtTheMoment));
      // return false;
    }
    return false;
  }
};

export const fetchUserProfileAction = (
  fetchAllCompetitionParticipations = false,
) => async (dispatch, getState) => {
  let res = await apiGet('/users/profile');
  if (res && res.data) {
    let competitionParticipationsDetails = [];

    if (fetchAllCompetitionParticipations) {
      let resCompetition = await apiGet(
        `/competition_participations/?user=${res.data.id}&pagination=false`,
      );
      if (
        resCompetition &&
        resCompetition.data &&
        resCompetition.data['hydra:member'].length != undefined
      ) {
        competitionParticipationsDetails = resCompetition?.data['hydra:member'];
      }
    } else {
      competitionParticipationsDetails = getState()?.userReducer?.userProfile?.competitionParticipationsDetails;
    }
    dispatch({
      type: FETCH_USER_PROFILE,
      payload: { ...res.data, competitionParticipationsDetails },
    });
    return res.data;
  } else if (res && res.error) {
    //handle error
    return false;
  } else {
    return false;
  }
};

export const updateCompetitionParticipationWithDataAction = competitionParticipationData => async (
  dispatch,
  getState,
) => {
  let newUserProfile = Object.assign({}, getState().userReducer.userProfile);
  let competitionParticipationsDetails = newUserProfile?.competitionParticipationsDetails;
  let replaceIndex = competitionParticipationsDetails?.findIndex(
    participation => participation.id == competitionParticipationData.id,
  );
  if (replaceIndex > -1) {
    competitionParticipationsDetails[
      replaceIndex
    ] = competitionParticipationData;
  } else {
    competitionParticipationsDetails.push(competitionParticipationData);
  }

  newUserProfile.competitionParticipationsDetails = competitionParticipationsDetails;
  dispatch({ type: FETCH_USER_PROFILE, payload: { ...newUserProfile } });
  return true;
};

export const updateUserProfileAction = data => async (dispatch, getState) => {
  let res = await apiPut(
    `/users/${getState().userReducer.userProfile.id}`,
    data,
  );
  if (res && res.data) {
    let newUserProfile = res.data;
    let competitionParticipationsDetails = getState()?.userReducer?.userProfile?.competitionParticipationsDetails;
    newUserProfile.competitionParticipationsDetails = competitionParticipationsDetails;
    dispatch({ type: FETCH_USER_PROFILE, payload: { ...newUserProfile } });
    return res;
  } else if (res && res.error && res.error.data) {
    return { error: res.error.data };
  } else {
    return false;
  }
};

export const updateLocalUserProfileWithDataAction = profileData => async (
  dispatch,
  getState,
) => {
  let newUserProfile = profileData;
  let competitionParticipationsDetails = getState()?.userReducer?.userProfile?.competitionParticipationsDetails;
  newUserProfile.competitionParticipationsDetails = competitionParticipationsDetails;
  newUserProfile.phone = competitionParticipationsDetails;
  dispatch({ type: FETCH_USER_PROFILE, payload: { ...newUserProfile } });
  return true;
};

export const fetchInterestsOptions = () => async (dispatch, getState) => {
  try {
    let res = await apiGet('/interests');
    if (res && res.data && res.data['hydra:member'].length != undefined) {
      dispatch({
        type: FETCH_INTETESTS_OPTIONS,
        payload: res.data['hydra:member'],
      });
      return true;
    }
    return false;
  } catch (error) {
    console.log('fetchInterestsOptions error', error);
    return false;
  }
};

export const fetchRankRewardDetails = () => async (dispatch, getState) => {
  let res = await apiGet('/settings');
  console.log("settings res....", res);
  if (res && res.data && res.data['hydra:member'].length != undefined) {
    let minigameRankRewards = {};
    let affiliateRankRewards = {};
    const affiliateObj = res.data['hydra:member'].find(
      obj => obj.type == 'affiliate',
    );
    const minigameObj = res.data['hydra:member'].find(
      obj => obj.type == 'minigame',
    );
    if (affiliateObj) {
      affiliateRankRewards = affiliateObj;
    }
    if (minigameObj) {
      minigameRankRewards = minigameObj;
    }
    console.log('affiliateObj', affiliateObj)
    console.log('minigameObj', minigameObj)
    dispatch({
      type: FETCH_RANK_REWARDS,
      minigameRankRewards,
      affiliateRankRewards,
    });
    return res;
  } else if (res && res.error) {
    return false;
  } else {
    return false;
  }
};

export const forceSignOut = () => store.dispatch(signOutAction());
export const signOutAction = () => async (dispatch, getState) => {
  //TODO: google and facebook signout
  try {
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
  } catch (error) {
  } finally {
    await dispatch({ type: SIGNOUT_SUCCESS });
    await AsyncStorage.removeItem('bearerToken');
  }
};

export const expireToken = () => async (dispatch, getState) => {
  dispatch({
    type: SIGNIN_SUCCESS,
    payload: { token: 'invalid token to test' },
  });
};
