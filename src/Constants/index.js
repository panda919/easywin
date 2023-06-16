import { Platform, Dimensions, StatusBar } from 'react-native';
import { Tapjoy } from 'react-native-tapjoy';
import Text from '../Components/Text';
import AsyncStorage from '@react-native-community/async-storage';

export let tapjoy = null;

export const TAPJOY_CONFIG = {
  sdkKeyIos: 'Og9ut-uPR6OsSNNWY8yDcQEBnjFiJpEI1jy7vUmWKiz12klWMi1HX5ZGOhu8',
  sdkKeyAndroid: 'uTc7Re7xQAayYtWpi66TdQEC5qoIATpDaMi8jMKx06YPVmVEtf6k2nfkG2Ii',
  gcmSenderIdAndroid: '12345',
  debug: true,
};
export async function setupTapJoy() {
  tapjoy = new Tapjoy(TAPJOY_CONFIG);
}
export function clearTapjoy() {
  tapjoy = null;
  tapjoy = new Tapjoy(TAPJOY_CONFIG);
}

export const twitterCosumerKey = 'c9HzXB4kIJYr7Lo2Nkk7DWo7v';
export const twitterCosumerSecretKey = 'PjDvjnfEGiHosdNAZ3ZArtbevOjEiR7Nkkc1BVP5Ag2yC58nFA';

const { width, height } = Dimensions.get('window');
export let isIPhoneX = false;
export const DEFAULT_FONT_SIZE = 16;
export const SCREEN_WIDTH = width > height ? height : width;
export const SCREEN_HEIGHT = width > height ? width : height;
export const ASPECT_RATIO = SCREEN_HEIGHT / SCREEN_WIDTH;
export const PLATFORM_IOS = Platform.OS === 'ios' ? true : false;
export const STATUSBAR_HEIGHT = PLATFORM_IOS ? 0 : StatusBar.currentHeight;
export const emailValidationRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
export const REDUX_STORE_VERSION = '6';
export const SERVER_BASE = 'http://back-office.easy-win.io';
export const API_BASE = `${SERVER_BASE}`;
export const GAME_BASE = ' http://161.35.205.203:8000';

export const WEBCLIENTID = '752547269491-s7odl86jsg2le5uag2gl22fac362j7ot.apps.googleusercontent.com';
export const IOSCLIENTID = '421739977578-dvqkmji54mokmkbqrt41olr7g5pbplqc.apps.googleusercontent.com';
export const googleScope = 'https://www.googleapis.com/auth/youtube.readonly';
export const CLIENT_KEY = 'AIzaSyDn2EyvexrRMZESQ48rYaEMURjF9HCJ7HA';
export const ONESIGNAL_APP_ID = '2291e508-54ea-4079-9b24-e788c071aa5e';

export const MISSION_REWARD_AVAILABLE_FOR_CLAIM = 'completed';
export const MISSION_REWARD_CLAIMED = 'claimed';

export const AXIOS_CONFIG_NOAUTH = {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/plain, */*',
  },
};

export let AXIOS_CONFIG = async (formData) => {
  const token = await AsyncStorage.getItem('bearerToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `${formData ? 'multipart/form-data' : 'application/json'
        }`,
      Accept: 'application/json, text/plain, */*',
    },
  };
};

export const CREDITS_MISSIONS = [
  {
    name: 'ROULETTES',
    description:
      'Tournez la roue, croisez les doigts et découvrez votre récompense.',
    type: 'credit',
    tab: 'Concours',
    navigate: 'WheelStack',
  },
  {
    name: 'BONUS DE CONNEXION',
    description:
      'Rendez-nous visite quotidiennement et recevez de belles récompenses.',
    type: 'credit',
    tab: 'Concours',
    navigate: 'ProfileScreen',
  },
  {
    name: 'NIVEAUX',
    description:
      'Vos crédits journaliers augmentent en fonction de votre niveau de profil.',
    type: 'credit',
    tab: 'Concours',
    navigate: 'ProfileScreen',
  },
];

export const COINS_MISSIONS = [
  {
    name: 'MINI-JEUX',
    description:
      'Réalisez le meilleur score possible et remportez pleins de pièces.',
    type: 'coins',
    tab: 'Minijeux',
    navigate: 'MinijeuxScreen',
  },
  {
    name: 'ROULETTES',
    description:
      'Tournez la roue, croisez les doigts et découvrez votre récompense.',
    type: 'coins',
    tab: 'Concours',
    navigate: 'WheelStack',
  },
  {
    name: 'CONCOURS',
    description:
      'Choisissez votre concours favori et participer en un seul clic.',
    type: 'coins',
    tab: 'Concours',
    navigate: 'ConcoursScreen',
  },
  {
    name: 'CONCOURS PERDUS',
    description:
      'Vous avez bien lu, les perdants seront aussi gagants sur EasyWin.',
    type: 'coins',
    tab: 'Concours',
    navigate: 'ConcoursScreen',
  },
  {
    name: `PARRAIN D'OR`,
    description:
      `Invitez vos amis sur l'application et hissez-vous dans le haut du classement.`,
    type: 'coins',
    tab: 'Parraindor',
    navigate: 'ParraindorScreen',
  },
  {
    name: 'BONUS DE CONNEXION',
    description:
      'Rendez-nous visite quotidiennement et recevez de belles récompenses.',
    type: 'coins',
    tab: 'Concours',
    navigate: 'ProfileScreen',
  },
  {
    name: 'MISSIONS',
    description: 'Réalisez les objectifs et récoltez de nombreuses récompenses.',
    type: 'coins',
    tab: 'Concours',
    navigate: 'ProfileScreen',
  },
];

export const TICKETS_MISSIONS = [
  {
    name: 'ROULETTES',
    description:
      'Tournez la roue, croisez les doigts et découvrez votre récompense.',
    type: 'tickets',
    tab: 'Concours',
    navigate: 'WheelStack',
  },
  // {
  //   name: 'Concours',
  //   description:
  //     'Choisissez votre cadeau favori et participer en un seul clic.',
  //   type: 'tickets',
  //   tab: 'Concours',
  //   navigate: 'ConcoursScreen',
  // },
  {
    name: 'BONUS DE CONNEXION',
    description:
      'Rendez-nous visite quotidiennement et recevez de belles récompenses.',
    type: 'tickets',
    tab: 'Concours',
    navigate: 'ProfileScreen',
  },
  // {
  //   name: 'Concours perdus',
  //   description:
  //     'Vous avez bien lu, les perdants sont aussi gagnants sur EasyWin.',
  //   type: 'tickets',
  //   tab: 'Concours',
  //   navigate: 'ConcoursScreen',
  // },
  {
    name: 'MISSIONS',
    description: 'Réalisez les objectifs et récoltez de nombreuses récompenses.',
    type: 'tickets',
    tab: 'Concours',
    navigate: 'ProfileScreen',
  },
  {
    name: 'PARRAINAGE',
    description:
      'Invitez vos amis sur EasyWin et gagnez des billets supplémenaires.',
    type: 'tickets',
    tab: 'Parraindor',
    navigate: 'ParraindorScreen',
  },
];

export const cityFilterOptions = [
  { label: 'PARIS', value: 'Paris' },
  { label: 'LYON', value: 'Lyon' },
  { label: 'MARSEILLE', value: 'Marseille' },
  {
    label: 'TOUTES LES VILLES',
    value: 'reset',
    component: <Text style={{ color: 'red', textAlign: 'center' }}>TOUTES LES VILLES</Text>,
  },
];

export const PeriodTabIndexToValue = index => {
  switch (index) {
    case 0:
      return 'day';
    case 1:
      return 'week';
    case 2:
      return 'month';

    default:
      return 'day';
  }
};
