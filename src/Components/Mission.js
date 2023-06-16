import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { Images } from '../Utils/images';
import { hp, wp } from '../Helper/ResponsiveScreen';
import { MISSION_REWARD_CLAIMED } from '../Constants';
import { Colors } from '../Styles/Colors';
import ProgressBar from 'react-native-progress/Bar';
import { useDispatch } from 'react-redux';
import Text from './Text';
import { apiPut } from '../Utils/functions';
import { fetchMissionsAction, fetchUserProfileAction } from '../Actions';

const Mission = ({ mission, xp, userProfile }) => {

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  let _progress = 0;

  if (mission?.type == 'challenge') {
    if (mission?.conditions == 'play') {
      _progress = xp?.challengePlays;
    } else if (mission?.conditions == 'use') {
      _progress = xp?.challengeCreditsSpend;
    }
  }
  if (mission?.type == 'wallet') {
    if (mission?.conditions == 'use_coins') {
      _progress = xp?.coinsWon;
    } else if (mission?.conditions == 'use_tickets') {
      _progress = xp?.ticketWon;
    }
  }
  if (mission?.type == 'login') {
    if (mission?.conditions == 'consecutive') {
      _progress = xp?.consecutiveMissionLogin ?? 0;
    }
  }
  if (mission?.type == 'scratch') {
    if (mission?.conditions == 'play') {
      _progress = xp?.scratchPlays;
    } else if (mission?.conditions == 'use') {
      _progress = xp?.scratchCreditsSpend;
    }
  }
  if (mission?.type == 'wheel') {
    if (mission?.conditions == 'play') {
      _progress = xp?.wheelPlays;
    } else if (mission?.conditions == 'premium') {
      _progress = xp?.wheelPremiumPlays;
    }
  }
  if (mission?.type == 'affiliate') {
    if (mission?.conditions == 'sponsor') {
      _progress = userProfile?.goldAffiliates?.length;
    } else if (mission?.conditions == 'top_ten') {
      _progress = userProfile?.top10Week  ?? 0;
    }
  }
  if (mission?.type == 'minigame') {
    if (mission?.conditions == 'play') {
      _progress = xp?.minigamePlays;
    }
    if (mission?.conditions == 'share') {
      if (mission?.share == 'share_tower') {
        _progress = xp?.minigameShareTowerScore;
      }
      if (mission?.share == 'share_gravity') {
        _progress = xp?.minigameShareGravityScore;
      }
      if (mission?.share == 'share_stickyman') {
        _progress = xp?.minigameShareStickymanScore;
      }
    }
  }

  if (mission?.type == 'profile') {
    if (mission?.conditions == 'phone') {
      _progress = xp?.phone ? 1 : 0;
    } else if (mission?.conditions == 'address') {
      _progress = userProfile?.address ? 1 : 0;
    } else if (mission?.conditions == 'date') {
      _progress = userProfile?.dateOfBirth ? 1 : 0;
    } else if (
      xp?.phone &&
      userProfile?.address &&
      userProfile?.dateOfBirth
    ) {
      _progress = 1;
    } else {
      _progress = 0;
    }
  }
  if (mission?.type == 'easywin') {
    if (mission?.conditions == 'share') {
      switch (mission?.share) {
        case 'facebook':
          _progress = xp?.appShareFacebook ? 1 : 0;
          break;
        case 'twitter':
          _progress = xp?.appShareTwitter ? 1 : 0;
          break;
        case 'messenger':
          //this is snapchat
          _progress = xp?.appShareMessenger ? 1 : 0;
          break;
        case 'discord':
          _progress = xp?.appShareDiscord ? 1 : 0;
          break;
        case 'instagram':
          _progress = xp?.appShareInstagram ? 1 : 0;
          break;
        case 'share_tower':
          _progress = xp?.appShareTower ? 1 : 0;
          break;
        case 'share_gravity':
          _progress = xp?.appShareGravity ? 1 : 0;
          break;
        case 'share_stickyman':
          _progress = xp?.appShareStickyman ? 1 : 0;
          break;
        default:
          break;
      }
    }
  }
  if (mission?.type == 'social') {
    if (mission?.conditions == 'share') {
      switch (mission?.share) {
        case 'check_facebook':
          _progress = xp?.checkFacebookAccount ? 1 : 0;
          break;
        case 'check_twitter':
          _progress = xp?.checkTwitterAccount ? 1 : 0;
          break;
        case 'check_snapchat':
          _progress = xp?.checkSnapchatAccount ? 1 : 0;
          break;
        case 'check_discord':
          _progress = xp?.checkDiscordAccount ? 1 : 0;
          break;
        case 'check_instagram':
          _progress = xp?.checkInstagramAccount ? 1 : 0;
          break;
        case 'check_youtube':
          _progress = xp?.checkYoutubeAccount ? 1 : 0;
          break;
        default:
          break;
      }
    }
  }

  const cliamOnPress = async () => {
    setLoading(true);
    await apiPut(`/mission_users/change_status_to_claimed/${mission?.mission_user_id}`);
    await dispatch(fetchUserProfileAction());
    await dispatch(fetchMissionsAction());
    setLoading(false);
  }

  return (
    <View style={styles.missionContainer}>
      <View style={styles.amountView}>
        {mission?.amount == null ? (
          <View style={styles.star}>
            <Image
              source={
                Number(_progress) >= Number(mission?.totalToWin) &&
                  mission?.missionClaimStatus == MISSION_REWARD_CLAIMED
                  ? Images.STAR_ACTIVE_ICON
                  : Images.STAR_ICON
              }
              style={styles.starSingle}
            />
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ justifyContent: 'center' }}>
              <Image
                source={
                  mission?.level > 1
                    ? Images.STAR_ACTIVE_ICON
                    : Images.STAR_ICON
                }
                style={styles.starStyle}
              />
              <Image
                source={
                  mission?.level > 2
                    ? Images.STAR_ACTIVE_ICON
                    : Images.STAR_ICON
                }
                style={styles.starStyle}
              />
              <Image
                source={
                  mission?.level > 3
                    ? Images.STAR_ACTIVE_ICON
                    : Images.STAR_ICON
                }
                style={styles.starStyle}
              />
            </View>
            <View style={{ justifyContent: 'center' }}>
              <Image
                source={
                  mission?.level > 4
                    ? Images.STAR_ACTIVE_ICON
                    : Images.STAR_ICON
                }
                style={styles.starStyle}
              />
              <Image
                source={
                  mission?.level == 5 &&
                    mission?.missionClaimStatus == MISSION_REWARD_CLAIMED
                    ? Images.STAR_ACTIVE_ICON
                    : Images.STAR_ICON
                }
                style={styles.starStyle}
              />
            </View>
          </View>
        )}
      </View>
      <View style={{ width: wp(41.75) }}>
        <Text style={{
          color: Colors.Black,
          fontSize: 14,
          fontWeight: '700'
        }}>{mission?.missionType}</Text>
        <Text style={{
          color: Colors.PLACEHOLDER_COLOR,
          fontSize: 12,
          fontWeight: '700',
        }}>{mission?.missionTitle}</Text>
        <View style={{ marginTop: hp(0.6) }}>
          <ProgressBar
            progress={((_progress || 0) / mission?.totalToWin).toFixed(2) || 0}
            width={wp(51)}
            borderWidth={0}
            color={Colors.APP_PROGRESS_GREEN_COLOR}
            unfilledColor={Colors.White}
            height={hp(1.4)}
            style={{
              borderRadius: 6,
              borderWidth: 0.3,
              borderColor: Colors.APP_BORDER_GRAY_COLOR,
            }}
          />
          <View style={styles.totalToWinTextView}>
            <Text style={{
              color: 'rgba(2, 28, 70, 0.68)',
              fontSize: 8,
              fontWeight: '700',
            }}>
              {_progress > mission?.totalToWin
                ? mission?.totalToWin
                : _progress}
              /{mission?.totalToWin}
            </Text>
          </View>
        </View>
      </View>
      <View style={[styles.missionAchievedView, {
        alignSelf:
          _progress >= mission?.totalToWin &&
            mission?.missionClaimStatus != MISSION_REWARD_CLAIMED
            ? 'center'
            : 'auto',
      }]}>
        {_progress >= mission?.totalToWin ? (
          mission?.missionClaimStatus == MISSION_REWARD_CLAIMED ? (
            <Image
              source={Images.MISSION_ACHIEVED}
              style={styles.missionAchievedIcons}
            />
          ) : (
            <>
              {mission?.missionClaimStatus == MISSION_REWARD_CLAIMED &&
                mission?.level == 5 ? null : (
                <TouchableOpacity
                  disabled={loading}
                  style={{ width: '100%' }}
                  onPress={() => cliamOnPress()}>
                  <View style={styles.recolterTextView}>
                    {loading ? (
                      <Loader color={'white'} />
                    ) : (
                      <Text style={{
                        color: Colors.White,
                        fontWeight: '700',
                        fontSize: 11.5,
                        padding: wp(0.5),
                      }}>RÉCOLTER</Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            </>
          )
        ) : (
          <View>
            {!!mission?.xpReward && (
              <View style={styles.rewaedView}>
                <Text style={{
                  color: Colors.Gray2,
                  fontSize: 12,
                  fontWeight: '700',
                  marginRight: wp(1),
                }}>{mission?.xpReward}</Text>
                <Image source={Images.XP_MISSION_ICON} style={styles.rewaedIcons} />
              </View>
            )}
            {!!mission?.coinsReward && (
              <View style={styles.rewaedView}>
                <Text style={{
                  color: Colors.APP_YELLOW_COLOR,
                  fontSize: 12,
                  fontWeight: '700',
                  marginRight: wp(1),
                }}>{mission?.coinsReward}</Text>
                <Image source={Images.COINS_MISSION_ICON} style={styles.rewaedIcons} />
              </View>
            )}
            {!!mission?.ticketsReward && (
              <View style={styles.rewaedView}>
                <Text style={{
                  color: Colors.APP_PROGRESS_GREEN_COLOR,
                  fontSize: 12,
                  fontWeight: '700',
                  marginRight: wp(1),
                }}>{mission?.ticketsReward}</Text>
                <Image source={Images.MONEY_MISSION_ICON} style={styles.rewaedIcons} />
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default Mission;

const styles = StyleSheet.create({
  starStyle: {
    width: wp(5),
    height: wp(6),
    marginBottom: -hp(0.6),
    resizeMode: 'cover',
  },
  missionContainer: {
    flexDirection: 'row',
    marginBottom: hp(1.7),
  },
  amountView: {
    width: wp(13.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewaedIcons: {
    height: wp(6),
    width: wp(6),
    resizeMode: 'cover',
  },
  rewaedView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recolterTextView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.GREEN_COLOR,
    borderWidth: 2,
    borderColor: Colors.GREEN_COLOR_1,
    borderRadius: 5,
  },
  missionAchievedIcons: {
    height: wp(10),
    width: wp(10),
    resizeMode: 'contain'
  },
  totalToWinTextView: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  starSingle: {
    width: wp(10),
    height: wp(12.5)
  },
  missionAchievedView: {
    alignItems: 'center',
    justifyContent: 'center',
    width: wp(21),
    marginHorizontal: wp(11),
    borderWidth: 1,
    borderColor: Colors.APP_TAB_GRAY_COLOR,
    borderRadius: 5,
  }
});
