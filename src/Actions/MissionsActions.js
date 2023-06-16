import { FETCH_MISSIONS, FETCH_USER_EARNINGS, FETCH_USER_PROFILE } from './types';
import _ from 'lodash';
import { apiGet } from '../Utils/functions';
import { MISSION_REWARD_AVAILABLE_FOR_CLAIM } from '../Constants';
import store from '../Store';
import { Images } from '../Utils/images';

const processMissionData = mission => {
  let imgSrc = Images.MISSION_PROFILE

  const {
    name,
    amount,
    type,
    xpReward,
    coinsReward,
    ticketsReward,
    conditions,
    share,
    level,
    users,

  } = mission;
  const { userProfile } = store.getState().userReducer;
  const {
    challengeCreditsSpend,
    challengePlays,
    minigamePlays,
    scratchCreditsSpend,
    consecutiveMissionLogin,
    scratchPlays,
    wheelPlays,
    wheelPremiumPlays,
    minigameShareTowerScore,
    minigameShareStickymanScore,
    minigameShareGravityScore,
    appShareDiscord,
    appShareFacebook,
    appShareGravity,
    appShareInstagram,
    appShareMessenger,
    appShareStickyman,
    appShareTower,
    appShareTwitter,
    appShareYoutube,
    checkDiscordAccount,
    checkFacebookAccount,
    checkInstagramAccount,
    checkSnapchatAccount,
    checkTwitterAccount,
    checkYoutubeAccount,
    coinsWon,
    ticketWon
  } = userProfile?.xp;
  let missionType = type;
  let missionTitle = name;
  let totalToWin = amount;
  let progress = 0;
  let icon = Images.MISSION_CHALLANGE
  if (amount) {
    if (type == 'wallet') {
      if (conditions == 'use_coins') {
        _progress = coinsWon;
      } else if (conditions == 'use_tickets') {
        _progress = ticketWon;
      }
    }
    if (type == 'challenge') {
      icon = Images.MISSION_CHALLANGE
      missionType = 'Concours';
      if (conditions == 'play') {
        progress = challengePlays;
      } else if (conditions == 'use') {
        progress = challengeCreditsSpend;
      }
    }
    if (type == 'wallet') {
      if (conditions == 'use_coins') {
        progress = coinsWon;
      } else if (conditions == 'use_tickets') {
        progress = ticketWon;
      }
    }
    if (type == 'scratch') {
      icon = Images.MISSION_SCRATCH
      missionType = 'Grattage';
      if (conditions == 'play') {
        progress = scratchPlays;
      } else if (conditions == 'use') {
        progress = scratchCreditsSpend;
      }
    }
    if (type == 'wheel') {
      icon = Images.MISSION_WHEEL
      missionType = 'Roulette';
      if (conditions == 'play') {
        progress = wheelPlays;
      } else if (conditions == 'premium') {
        progress = wheelPremiumPlays;
      }
    }
    if (type == 'affiliate') {
      icon = Images.MISSION_CUP
      missionType = 'Parrainage';
      if (conditions == 'sponsor') {
        progress = userProfile.goldAffiliates.length;
      }else if (conditions == 'top_ten') {
        progress = userProfile.top10Week ?? 0;
      }
    }
    if (type == 'login') {
      if (conditions === 'consecutive') {
        progress = consecutiveMissionLogin ?? 0;
      }
    }
    if (type == 'minigame') {
      icon = Images.MISSION_MINIGAME
      missionType = 'Mini-jeux';
      if (conditions == 'play') {
        progress = minigamePlays;
      }
      if (conditions == 'share') {
        missionTitle = name + ' pour ';
        if (share == 'share_tower') {
          missionTitle += 'Color Tower';
          progress = minigameShareTowerScore;
        } else if (share == 'share_gravity') {
          missionTitle += 'Choose Gravity';
          progress = minigameShareGravityScore;
        } else if (share == 'share_stickyman') {
          missionTitle += 'Sticky Man';
          progress = minigameShareStickymanScore;
        }
      }
    }
  } else {
    //cases like add phone or share app
    totalToWin = 1;
    if (type == 'profile') {
      icon = imgSrc;
      missionType = 'Profil';
      if (conditions == 'phone') {
        progress = userProfile.phone != null ? 1 : 0;
      } else if (conditions == 'address') {
        progress = userProfile.address != null ? 1 : 0;
      } else if (conditions == 'date') {
        progress = userProfile.dateOfBirth != null ? 1 : 0;
      }
      else if (userProfile.phone != null && userProfile.address != null && userProfile.dateOfBirth != null) {
        progress = 1;
      }
      else {
        progress = 0;
      }
    }
    if (type == 'easywin') {
      icon = imgSrc;
      missionType = 'Partage Easywin';
      if (conditions == 'share') {
        switch (share) {
          case 'facebook':
            progress = appShareFacebook ? 1 : 0;
            break;
          case 'twitter':
            progress = appShareTwitter ? 1 : 0;
            break;
          case 'messenger':
            //this is snapchat
            progress = appShareMessenger ? 1 : 0;
            break;
          case 'discord':
            progress = appShareDiscord ? 1 : 0;
            break;
          case 'instagram':
            progress = appShareInstagram ? 1 : 0;
            break;
          case 'share_tower':
            progress = appShareTower ? 1 : 0;
            break;
          case 'share_gravity':
            progress = appShareGravity ? 1 : 0;
            break;
          case 'share_stickyman':
            progress = appShareStickyman ? 1 : 0;
            break;
          default:
            break;
        }
      }
    }
    if (type == 'social') {
      icon = imgSrc;
      missionType = 'Réseaux sociaux';
      if (conditions == 'share') {
        switch (share) {
          case 'check_facebook':
            progress = checkFacebookAccount ? 1 : 0;
            break;
          case 'check_twitter':
            progress = checkTwitterAccount ? 1 : 0;
            break;
          case 'check_snapchat':
            progress = checkSnapchatAccount ? 1 : 0;
            break;
          case 'check_discord':
            progress = checkDiscordAccount ? 1 : 0;
            break;
          case 'check_instagram':
            progress = checkInstagramAccount ? 1 : 0;
            break;
          case 'check_youtube':
            progress = checkYoutubeAccount ? 1 : 0;
            break;
          default:
            break;
        }
      }
    }
  }
  let finalMissionData = {
    ...mission,
    missionType,
    missionTitle,
    totalToWin,
    progress,
    icon,
  };
  let missionUser = store.getState().userReducer.userProfile.missionUser;

  let missionComplete = false;
  //to be claimed == completed, claimed == claimed // does not exist== false
  let missionClaimStatus = false;
  if (progress >= totalToWin) {
    missionComplete = true;
    let _missionUser = missionUser.find(
      userMission => userMission.mission == mission['@id'],
    );
    if (_missionUser && _missionUser.status) {
      missionClaimStatus = _missionUser.status;
      finalMissionData = {
        ...finalMissionData,
        mission_user_id: _missionUser.id,
      };
    }
  }
  finalMissionData = {
    ...finalMissionData,
    missionComplete,
    missionClaimStatus,
  };
  return finalMissionData;
};

export const clearMission = () => async (dispatch, getState) => {
  dispatch({ type: FETCH_MISSIONS, payload: [] });
  dispatch({ type: FETCH_USER_EARNINGS, payload: [] });
}

export const fetchMissionsAction = () => async (dispatch, getState) => {
  let res = await apiGet('/missions');
  if (res && res.data && res.data['hydra:member'].length != undefined) {
    let payload = [];
    let missions = {
      other: [],
    };
    for (let i = 0; i < res.data['hydra:member'].length; i++) {
      const mission = res.data['hydra:member'][i];
      //saperate missions based on there type and condition
      if (mission.amount && mission.type == 'minigame') {
        missions[`${mission.type}-${mission.conditions}-${mission.share}`] =
          missions[`${mission.type}-${mission.conditions}-${mission.share}`] !=
            undefined
            ? missions[
              `${mission.type}-${mission.conditions}-${mission.share}`
            ].concat([{ ...mission }])
            : (missions[
              `${mission.type}-${mission.conditions}-${mission.share}`
            ] = [{ ...mission }]);
      } else if (mission.amount) {
        missions[`${mission.type}-${mission.conditions}`] =
          missions[`${mission.type}-${mission.conditions}`] != undefined
            ? missions[`${mission.type}-${mission.conditions}`].concat([
              { ...mission },
            ])
            : (missions[`${mission.type}-${mission.conditions}`] = [
              { ...mission },
            ]);
      } else {
        missions.other.push(processMissionData(mission));
      }
    }
    let missions2 = {};
    _.forEach(missions, (missionCategory, missionCategoryKey) => {
      if (missionCategory.length > 1 && missionCategoryKey != 'other') {
        for (let i = 1; i < missionCategory.length; i++) {
          const missionData = processMissionData(missionCategory[i]);
          const prevMissionData = processMissionData(missionCategory[i - 1]);
          // if (missionData.id == 1 || prevMissionData.id == 1) {
          // }
          if (
            prevMissionData.missionComplete &&
            prevMissionData.missionClaimStatus ==
            MISSION_REWARD_AVAILABLE_FOR_CLAIM
          ) {
            missions2[missionCategoryKey] = prevMissionData;
            break;
          } else {
            if (prevMissionData.missionComplete) {
              missions2[missionCategoryKey] = missionData;
            } else {
              missions2[missionCategoryKey] = prevMissionData;
              break;
            }
          }
        }
      } else {
      }
    });
    _.forEach(missions2, mission => {
      payload.push(mission);
    });
    payload = payload.concat(missions.other);
    let finalPayload = [];
    _.forEach(payload, mission => {
      let index = finalPayload.findIndex(
        ({ title }) => title == mission?.missionType,
      );
      if (index > -1) {
        let data = finalPayload[index]?.data;
        data.push(mission);
        finalPayload[index] = {
          title: mission?.missionType,
          icon: mission?.icon,
          data,
        };
      } else {
        finalPayload.push({
          title: mission?.missionType,
          icon: mission?.icon,
          data: [mission],
        });
      }
    });

    dispatch({ type: FETCH_MISSIONS, payload: finalPayload });
    return true;
  } else {
    return false;
  }
};
