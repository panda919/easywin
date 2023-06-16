import ImmersiveMode from "react-native-immersive-mode";
import { errorMessage, forceSignOut } from "../Actions";
import {
  API_BASE,
  AXIOS_CONFIG,
  AXIOS_CONFIG_NOAUTH,
  GAME_BASE,
  IOSCLIENTID,
  ONESIGNAL_APP_ID,
  SERVER_BASE,
  WEBCLIENTID
} from "../Constants";
import { PLATFORM_IOS } from "../Helper/ResponsiveScreen";
import { LMSText } from "../Languages/LMSText";
import axios from 'axios';
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import Lang from "../Languages/LanguageStr";
import OneSignal from 'react-native-onesignal';
import store from '../Store';
import { Images } from "./images";
import moment from 'moment';

export function hideBottomBar() {
  if (!PLATFORM_IOS) {
    ImmersiveMode.fullLayout(true);
    ImmersiveMode.setBarMode('BottomSticky');
  }
}

export async function authWithGoogle() {
  GoogleSignin.configure({
    webClientId: WEBCLIENTID,
    offlineAccess: true
  });
  // Get the users ID token
  try {
    const googleSigninRes = await GoogleSignin.signIn();
    console.log('google signinres', googleSigninRes);
    return googleSigninRes;
  } catch (error) {
    console.log('google signin error', error);
    return false;
  }
}

export async function gameGetVideo(endpoint) {
  try {
    let res = await axios.get(
        `${GAME_BASE}${endpoint}`,
    );
    console.log(`${GAME_BASE}${endpoint}`);
    if (res) {
      return res;
    }
  } catch (error) {
    console.log('error===++++++', error)
    return APIErrorHandler(error, endpoint);
  }
}

export async function apiPost(endpoint, data, noAuth = false) {
  try {
    let res = await axios.post(
      `${API_BASE}${endpoint}`,
      JSON.stringify(data),
      noAuth ? AXIOS_CONFIG_NOAUTH : await AXIOS_CONFIG(),
    );
    if (res) {
      return res;
    }
  } catch (error) {
    // console.log('error===++++++', error)
    return APIErrorHandler(error, endpoint);
  }
}

export async function apiPostImage(endpoint, data) {
  try {
    let res = await axios.post(
      `${API_BASE}${endpoint}`,
      data,
      await AXIOS_CONFIG(true),
    );
    if (res) {
      return res;
    }
  } catch (error) {
    return APIErrorHandler(error, endpoint);
  }
}

export async function apiPut(endpoint, data) {
  try {
    let res = await axios.put(
      `${API_BASE}${endpoint}`,
      JSON.stringify(data),
      await AXIOS_CONFIG(),
    );
    if (res) {
      return res;
    }
  } catch (error) {
    return APIErrorHandler(error, endpoint);
  }
}

export async function apiGet(endpoint, noAuth = false) {
  try {
    let res = await axios.get(
      `${API_BASE}${endpoint}`,
      noAuth ? AXIOS_CONFIG_NOAUTH : await AXIOS_CONFIG(),
    );

    if (res) {
      return res;
    }
  } catch (error) {
    return APIErrorHandler(error, endpoint);
  }
}

function APIErrorHandler(error, endpoint) {
  if (error.message == 'Network Error') {
    errorMessage(LMSText(Lang.app.noInternet));
    return false;
  } else if (error.code && error.code == 'ECONNABORTED') {
    errorMessage(LMSText(Lang.app.poorInternet));
    return false;
  } else if (
    error.response &&
    error.response.status &&
    error.response.status == 401 &&
    endpoint != '/login_check'
  ) {
    // @yb test to remove this message
    //errorMessage(LMSText(Lang.auth.sessionExpired));
    forceSignOut();
    return false;
  } else if (
    error.response &&
    error.response.status &&
    error.response.status == 504
  ) {
    errorMessage(LMSText(Lang.app.poorInternet));
    return false;
  }
  else if (error.response) {
    return { error: { ...error.response } };
  } else {
    return { error };
  }
}

export const recoverPassword = async (email) => {
  const data = { username: email };
  const res = await apiPost('/users/password_reset/request', data, true);
  if (res) {
    return res;
  }
  return false;
};

export const fetchCity = async (endpoint) => {
  const res = await apiGet(endpoint);
  if (res && res.data) {
    return res.data;
  }
  return false;
};

export const makeAffiliate = async (sponsorCode) => {
  const data = { sponsorCode };
  const res = await apiPost('/affiliates', data);
  if (res) {
    return res;
  }
  return false;
};

export const missionsCheckAccount = async (accountType) => {
  const res = await apiPost('/missions/post_check_account', {
    checkType: `${accountType}`,
  });
  if (res && res.data) {
    return res.data;
  }
  return false;
};

export function timeLeftInScratchCredits(scratchTime) {
  const time = new Date(scratchTime);
  let endtime = time;
  //moment().utcOffset()

  endtime.setMinutes(endtime.getMinutes() + 180);
  const total = Date.parse(endtime) - Date.parse(new Date());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return {
    total,
    // days,
    hours,
    minutes,
    seconds,
  };
}

export function timeLeftInChallangeCredits(challangeTime) {
  const time = new Date(challangeTime);
  let endtime = time;
  endtime.setMinutes(endtime.getMinutes() + 60);
  const total = Date.parse(endtime) - Date.parse(new Date());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return {
    total,
    // days,
    hours,
    minutes,
    seconds,
  };
}

export function weighted_random(weights) {
  const cumulativeWeights = [];

  let data = 0;
  for (let i = 0; i < weights.length; i += 1) {
    if (weights[i] != 0) {
      data = data + weights[i];
    }
    cumulativeWeights[i] = weights[i] == 0 ? 0 : data || 0;
  }

  const maxCumulativeWeight = Math.max(...cumulativeWeights);

  const randomNumber = generateRandomNumber(1, maxCumulativeWeight);

  for (let itemIndex = 0; itemIndex < weights.length; itemIndex += 1) {
    if (
      cumulativeWeights[itemIndex] > randomNumber &&
      weights[itemIndex] != 0
    ) {
      return itemIndex;
    }
  }
}

generateRandomNumber = (min, max) => {
  const random = Math.floor(Math.random() * (max - min + 1)) + min;
  return random;
};

export function timeLeftToday() {
  const actualTime = new Date(Date.now());
  const endOfDay = new Date(
    actualTime.getFullYear(),
    actualTime.getMonth(),
    actualTime.getDate() + 1,
    0,
    0,
    0,
  );
  const total = endOfDay.getTime() - actualTime.getTime();
  // console.log('total', total)
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  // console.log('hours', hours)
  // console.log('minutes', minutes)
  // console.log('seconds', seconds)
  return {
    hours,
    minutes,
    seconds,
  };
}

export const wheelParticipation = async (wheelObj) => {
  const res = await apiPost('/users/participate_in_wheel', wheelObj);
  console.log("res>>>", res);
  if (res) {
    return res;
  }
  return false;
};

export const updateStatistics = async (statistic_id, data) => {
  const res = await apiPut(`/game_statistics/${statistic_id}`, data);
  if (res) {
    return res;
  }
  return false;
};

export const fetchDailyRewardsList = async () => {
  const res = await apiGet('/daily_rewards/');
  console.log("daily reward>>>>", res);
  if (res && res.data && res.data['hydra:member'].length != undefined) {
    return res.data['hydra:member'];
  }
  return false;
};

let lots = {};
export const getLot = async (lotAddress) => {
  const res = await apiGet(lotAddress);
  console.log('lotAddress', lotAddress);
  if (res && res?.data) {
    lots[lotAddress] = res?.data;
    return res.data;
  }
  return false;
};

export const fetchLots = async (competitionLots) => {
  let _competitionLots = [];
  await Promise.all(
    competitionLots.map(async (lotAddress) => {
      const lotData = await getLot(lotAddress);
      console.log('fetched lot::', lotAddress, ' RES:', lotData);
      if (lotData) {
        _competitionLots.push(lotData);
      }
    }),
  );
  return _competitionLots;
};

export const spendUserCredits = async (data, competion_participation_id) => {
  let res = await apiPost(
    `/spend_user_credits/${competion_participation_id}`,
    data,
  );
  console.log('Spend credit ....', res);

  if (res && res?.data) {
    console.log('Spend credit if ....', res.data);
    return res;
  } else if (res && res?.error) {
    console.log('Spend credit else if....', res.error);
    //handle error
    // if(res.error.status==500){
    //   // errorMessage(LMSText('auth.emailAlreadyInUse'))
    // }
    return res;
  } else {
    console.log('Spend credit else ....', res);
    // errorMessage(LMSText('auth.couldNotSignUpAtTheMoment'))
    return false;
  }
};

export const fetchCompetitionParticipation = async (participation) => {
  const res = await apiGet(participation);
  if (res && res?.data) {
    // res.data.competition = `/competitions/1`;
    return res?.data;
  }
  return false;
};

export const makeParticipation = async (comOrScrData, isScratch, useCoins, useFirsttimeScratch) => {
  let data = {};
  if (isScratch) {
    data = {
      user: `/users/${store?.getState()?.userReducer?.userProfile?.id}`,
      scratch: `/scratches/${comOrScrData?.id}`,
    };
    if (useCoins) {
      data.useCoins = useCoins;
    }
    if (useFirsttimeScratch) {
      data.useFirsttimeScratch = useFirsttimeScratch
    }
  } else {
    data = {
      user: `/users/${store?.getState()?.userReducer?.userProfile?.id}`,
      competition: `/competitions/${comOrScrData?.id}`,
      numberOfParticipations: 1,
    };
  }
  console.log('data====', data)
  let res = await apiPost('/competition_participations', data);

  console.log('error....', res);

  if (res && res?.data) {
    return res;
  } else if (res && res?.error) {
    //handle error
    if (
      res?.error?.status == 500 &&
      res?.error?.data &&
      res?.error?.data['hydra:description']
    ) {
      errorMessage(res?.error?.data['hydra:description']);
    }
    return false;
  } else {
    // errorMessage(LMSText('auth.couldNotSignUpAtTheMoment'))
    return false;
  }
};

export async function configureOneSignal() {
  /* O N E S I G N A L   S E T U P */
  OneSignal.setAppId(ONESIGNAL_APP_ID);
  if (__DEV__) {
    OneSignal.setLogLevel(6, 0);
  } else {
    OneSignal.setLogLevel(1, 0);
  }
  OneSignal.setRequiresUserPrivacyConsent(false);
  OneSignal.promptForPushNotificationsWithUserResponse((response) => {
    // console.log('OneSignal: Prompt response:', response);
  });


  OneSignal.addSubscriptionObserver(async (event) => {
    // console.log('OneSignal: subscription changed:', event);
  });

  const deviceState = await OneSignal.getDeviceState();

  if (
    store?.getState()?.userReducer &&
    store?.getState()?.userReducer?.userProfile &&
    store?.getState()?.userReducer?.userProfile?.id
  ) {
    OneSignal?.setExternalUserId(
      `${store?.getState()?.userReducer?.userProfile?.id}`,
    );
  }
}

export const updateParticipation = async (participationData, id) => {
  let data = { ...participationData };

  let res = await apiPut(`/competition_participations/${id}`, data);
  if (res && res?.data) {
    return res;
  } else if (res && res?.error) {
    //handle error
    if (
      res?.error?.status == 500 &&
      res?.error?.data &&
      res?.error?.data['hydra:description']
    ) {
      errorMessage(res?.error?.data['hydra:description']);
    }
    return false;
  } else {
    // errorMessage(LMSText('auth.couldNotSignUpAtTheMoment'))
    return false;
  }
};

export const increaseLuck = async (data, competion_participation_id) => {
  let res = await apiPost(`/increase_luck/${competion_participation_id}`, data);
  if (res && res?.data) {
    return res;
  } else if (res && res?.error) {
    return false;
  } else {
    return false;
  }
};

export const getAmount = (rewards, _period, rank) => {
  const period = _period == 0 ? 'daily' : _period == 1 ? 'weekly' : 'monthly'; //range_start <= rank <= range_end

  const filterlot = rewards?.lots?.filter(
    (obj) =>
      obj.period == period &&
      parseInt(obj.rangeStart) <= rank &&
      rank <= parseInt(obj.rangeEnd),
  );
  if (filterlot?.length > 0) {
    if (filterlot[0].type == 'tickets' || filterlot[0].type == 'coins') {
      return filterlot[0]?.amount || 0;
    } else {
      return filterlot[0]?.name || '';
    }
  }
  return '';
};

export const getRankRewardImage = (rewards, _period, rank) => {
  const period = _period == 0 ? 'daily' : _period == 1 ? 'weekly' : 'monthly'; //range_start <= rank <= range_end

  const filterlot = rewards?.lots?.filter(
    (obj) =>
      obj.period == period &&
      parseInt(obj.rangeStart) <= rank &&
      rank <= parseInt(obj.rangeEnd),
  );

  if (filterlot?.length > 0) {
    if (filterlot[0].type == 'tickets') {
      return Images.MONEY_ICON;
    } else if (filterlot[0].type == 'coins') {
      return Images.COINS_ICON;
    } else {
      let url = filterlot[0]?.imageUrl; //rewards[`image${period}LotRank${rank}Url`];
      console.log(`${SERVER_BASE}${url}`);
      if (url) {
        return { uri: `${SERVER_BASE}${url}` };
      } else {
        return false;
      }
    }
  }
  else {
    return false;
  }
};

export function getGameParticipationForToday(game) {
  let participations = store?.getState()?.userReducer?.userProfile?.competitionParticipationsDetails;
  const gameIRI = game['@id'];
  let gameParticipation = false;
  participations?.forEach((participation) => {
    if (
      participation?.minigame == gameIRI &&
      moment(participation?.createdAt)?.isSame(moment(), 'day')
    ) {
      gameParticipation = participation;
    }
  });
  return gameParticipation;
}

export const makeGameParticipation = async (gameId, score) => {
  let data = (data = {
    user: `/users/${store?.getState()?.userReducer?.userProfile?.id}`,
    minigame: `/minigames/${gameId}`,
  });
  switch (gameId) {
    case 1:
      data.miniGameColorTowerScore = score;
      break;
    case 2:
      data.miniGameChooseGravity = score;
      break;
    case 3:
      data.miniGameStickyMan = score;
      break;
    default:
      break;
  }

  let res = await apiPost('/competition_participations', data);
  if (res && res?.data) {
    return res;
  } else if (res && res?.error) {
    if (
      res?.error?.status == 500 &&
      res?.error?.data &&
      res?.error?.data['hydra:description']
    ) {
      errorMessage(res?.error?.data['hydra:description']);
    }
    return false;
  } else {
    return false;
  }
};

export const updateUserWallet = async (data) => {
  let wallet = store?.getState()?.userReducer?.userProfile?.wallet;
  let res = await apiPut(wallet['@id'], data);
  if (res && res?.data) {
    return res;
  }
  return false;
};

export const scratchParticipation = async (scratchObj) => {
  const res = await apiPost('/users/scratchLot', scratchObj);
  if (res) {
    return res;
  }
  return false;
};

export const getUserLot = async () => {
  const res = await apiGet('/user_competition_lots');
  console.log('user_competition_lots', res.data);
  if (res && res.data) {
    return res.data['hydra:member'];
  }
  return [];
};
