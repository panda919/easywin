import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Image, Pressable, StyleSheet, View } from 'react-native'
import { Colors } from '../Styles/Colors';
import { Images } from '../Utils/images';
import Text from './Text'
import { PLATFORM_IOS, SERVER_BASE } from '../Constants';
import { timeLeftInChallangeCredits, timeLeftInScratchCredits } from '../Utils/functions';
import { fetchUserProfileAction } from '../Actions';
import CustomImage from './CustomImage';
import { hp, wp } from '../Helper/ResponsiveScreen';
import { useNavigation } from '@react-navigation/native';
import useBackgroundTimer from './useBackgroundTimer';
import moment from 'moment';

let refreshedAt = 0;
let refreshCount = 0;
const maxRefreshRetry = 2;
const refreshDelaySec = 5;

const CountTimer = (props) => {

  const latestCallMoment = useRef(moment());
  const refreshCount = useRef(0);

  const { scratchMaxLimit, challengeMaxLimit } = useMemo(() => {
      if (props?.level == 3) {
          return { scratchMaxLimit: 5, challengeMaxLimit: 17 };
      } else if (props?.level > 3) {
          return { scratchMaxLimit: 6, challengeMaxLimit: 19 };
      }
      return { scratchMaxLimit: 4, challengeMaxLimit: 15 };
  }, []);

  const {
      time: scratchDuration,
      startTimer: startScratchTimer,
      stopTimer: stopScratchTimer,
  } = useBackgroundTimer(props?.wallet?.scratchTime, 180, props?.wallet, props?.level, "showScratchCredits");

  const {
      time: challengeDuration,
      startTimer: startChallengeTimer,
      stopTimer: stopChallengeTimer,
  } = useBackgroundTimer(props?.wallet?.challengeTime, 60, props?.wallet, props?.level, "showChallangeCredits");


  const secondsScratch = Math.floor(scratchDuration % 60);
  const minutesScratch = Math.floor((scratchDuration / 60) % 60);
  const hoursScratch = Math.floor((scratchDuration / (60 * 60)) % 24);
  // const daysScratch = Math.floor(scratchDuration / (60 * 60 * 24));

  const secondsChallenge = Math.floor(challengeDuration % 60);
  const minutesChallenge = Math.floor((challengeDuration / 60) % 60);
  const hoursChallenge = Math.floor((challengeDuration / (60 * 60)) % 24);
  // const daysChallenge = Math.floor(challengeDuration / (60 * 60 * 24));

  useEffect(() => {
      if (
          props?.showScratchCredits &&
          props?.wallet?.scratchTime &&
          props?.wallet?.scratchCredit < scratchMaxLimit
      ) {
          startScratchTimer();
      }
      if (
          props?.showChallangeCredits &&
          props?.wallet?.challengeTime &&
          props?.wallet?.challengeCredit < challengeMaxLimit
      ) {
          startChallengeTimer();
      }
      return () => {
          stopChallengeTimer();
          stopScratchTimer();
      };
  }, [
      challengeMaxLimit,
      scratchMaxLimit,
      props?.showChallangeCredits,
      props?.showScratchCredits,

      props?.wallet?.challengeCredit,
      props?.wallet?.challengeTime,
      props?.wallet?.scratchCredit,
      props?.wallet?.scratchTime,
  ]);

  useEffect(() => {
      if (
          (scratchDuration <= 0 || challengeDuration <= 0) &&
          refreshCount.current < maxRefreshRetry
      ) {
          const nowMoment = moment();
          if (
              nowMoment.diff(latestCallMoment.current, 'seconds') < refreshDelaySec
          ) {
              latestCallMoment.current = nowMoment;
              props?.fetchUserProfileAction();
          }
      }
  }, []);

  const scratchTime = `${hoursScratch > -1
      ? hoursScratch < 10
          ? '0' + hoursScratch
          : hoursScratch
      : '00'
      } : ${minutesScratch > -1
          ? minutesScratch < 10
              ? '0' + minutesScratch
              : minutesScratch
          : '00'
      } : ${secondsScratch > -1
          ? secondsScratch < 10
              ? '0' + secondsScratch
              : secondsScratch
          : '00'
      }`;

  const challengeTime = `${hoursChallenge > -1
      ? hoursChallenge < 10
          ? '0' + hoursChallenge
          : hoursChallenge
      : '00'
      } : ${minutesChallenge > -1
          ? minutesChallenge < 10
              ? '0' + minutesChallenge
              : minutesChallenge
          : '00'
      } : ${secondsChallenge > -1
          ? secondsChallenge < 10
              ? '0' + secondsChallenge
              : secondsChallenge
          : '00'
      }`;


  return (
      <>
          {props?.showChallangeCredits && (
              <Pressable
                  onPress={() => {
                      props?.onGoToWalletScreen('credit');
                  }}
                  style={styles.content}>
                  <View style={styles.imageView}>
                      <View
                          style={{
                              position: 'absolute',
                              bottom: 0,
                              marginHorizontal: wp(0.4),
                              width: props?.headerImageSize - 8,
                              height:
                                  ((props?.headerImageSize * (props?.wallet?.challengeCredit > 15
                                      ? 15
                                      : props?.wallet?.challengeCredit)) /
                                      15) || 0,
                              backgroundColor: Colors.APP_COLOR,
                          }}
                      />
                      <Image
                          style={{ height: props?.headerImageSize, width: props?.headerImageSize }}
                          resizeMode="contain"
                          source={Images.LIGHTNING_BLUE_ICON}
                      />
                  </View>
                  <View
                      style={{
                          marginTop: -hp(1.9),
                          backgroundColor: Colors.White,
                          borderColor: Colors.APP_BLUE_COLOR,
                          borderWidth: 1,
                          borderRadius: props?.headerImageSize,
                      }}>
                      <Text
                          style={{
                              minWidth: props?.headerImageSize + 5,
                              fontSize: 10,
                              paddingHorizontal: wp(1.25),
                              ...styles.blueTextStyles
                          }}>
                          {props?.wallet?.challengeCredit}/{challengeMaxLimit}
                      </Text>
                  </View>
                  {
                      <View
                          style={{
                              marginTop: -wp(0.4),
                              borderTopWidth: 0,
                              backgroundColor: Colors.White,
                              borderColor: Colors.APP_BLUE_COLOR,
                              borderWidth: 1,
                              borderRadius: props?.headerImageSize,
                          }}>
                          <Text
                              style={{
                                  minWidth: props?.headerImageSize - 5,
                                  fontSize: 7,
                                  paddingHorizontal: wp(0.2),
                                  ...styles.blueTextStyles
                              }}>
                              {props?.showChallangeCredits &&
                                  props?.wallet?.challengeTime &&
                                  props?.wallet?.challengeCredit < challengeMaxLimit ? challengeTime : `00 : 00 : 00`}
                          </Text>
                      </View>
                  }
              </Pressable>
          )}
          {props?.showScratchCredits && (
              <Pressable
                  onPress={() => {
                      props?.onGoToWalletScreen('credit');
                  }}
                  style={styles.content}>
                  <View style={styles.imageView}>
                      <View
                          style={{
                              position: 'absolute',
                              bottom: 0,
                              marginHorizontal: wp(0.4),
                              width: props?.headerImageSize - 8,
                              height: ((props?.headerImageSize * (
                                  props?.wallet?.scratchCredit > 4 ? 4 : props?.wallet?.scratchCredit)) / 4) || 0,
                              backgroundColor: Colors.YELLOW,
                          }}
                      />
                      <Image
                          style={{ height: props?.headerImageSize, width: props?.headerImageSize }}
                          resizeMode="contain"
                          source={Images.LIGHTNING_YELLOW_ICON}
                      />
                  </View>
                  <View
                      style={{
                          marginTop: -hp(1.9),
                          backgroundColor: Colors.White,
                          borderColor: Colors.APP_YELLOW_COLOR,
                          borderWidth: 1,
                          borderRadius: props?.headerImageSize,
                      }}>
                      <Text
                          style={{
                              minWidth: props?.headerImageSize + 5,
                              fontSize: 10,
                              paddingHorizontal: wp(1.25),
                              ...styles.yellowTextStyles
                          }}>
                          {props?.wallet?.scratchCredit}/{scratchMaxLimit}
                      </Text>
                  </View>
                  {
                      <View
                          style={{
                              marginTop: -wp(0.4),
                              borderTopWidth: 0,
                              backgroundColor: Colors.White,
                              borderColor: Colors.APP_YELLOW_COLOR,
                              borderWidth: 1,
                              borderRadius: props?.headerImageSize,
                          }}>
                          <Text
                              style={{
                                  minWidth: props?.headerImageSize - 5,
                                  fontSize: 7,
                                  paddingHorizontal: wp(0.2),
                                  ...styles.yellowTextStyles
                              }}>
                              {props?.showScratchCredits &&
                                  props?.wallet?.scratchTime &&
                                  props?.wallet?.scratchCredit < scratchMaxLimit ? scratchTime : `00 : 00 : 00`}
                          </Text>
                      </View>
                  }
              </Pressable>
          )}
      </>
  )
}

const Header = (props) => {

  const dispatch = useDispatch()
  const navigation = useNavigation()
  const [updateStateToRefreshTime, setUpdateStateToRefreshTime] = useState(0)

  const userProfile = useSelector((state) => state.userReducer?.userProfile);

  let imgSrc = Images.PROFILE_ICON;
  if (userProfile?.avatarUrl) {
    imgSrc = { uri: `${SERVER_BASE}${userProfile?.avatarUrl}` };
  } else if (userProfile?.ssoProfileAvatar) {
    imgSrc = { uri: userProfile?.ssoProfileAvatar };
  }
  let scratchTime = '00:00:00';
  let challengeTime = '00:00:00';
  let scratchMaxLimit = 4;
  let challengeMaxLimit = 15;
  if (userProfile?.level == 3) {
    scratchMaxLimit = 5;
    challengeMaxLimit = 17;
  } else if (userProfile?.level > 3) {
    scratchMaxLimit = 6;
    challengeMaxLimit = 19;
  }

  if (
    props?.showScratchCredits &&
    userProfile?.wallet?.scratchTime &&
    userProfile?.wallet?.scratchCredit < scratchMaxLimit
  ) {
    let { hours, minutes, seconds, total } = timeLeftInScratchCredits(
      userProfile?.wallet?.scratchTime,
    );
    scratchTime = `${hours > -1 ? (hours < 10 ? '0' + hours : hours) : '00'
      } : ${minutes > -1 ? (minutes < 10 ? '0' + minutes : minutes) : '00'} : ${seconds > -1 ? (seconds < 10 ? '0' + seconds : seconds) : '00'
      }`;
    if (
      total < 0 &&
      updateStateToRefreshTime - refreshedAt > refreshDelaySec &&
      refreshCount < maxRefreshRetry
    ) {
      refreshedAt = updateStateToRefreshTime;
      refreshCount++;
      dispatch(fetchUserProfileAction());
    }
  }
  if (
    props?.showChallangeCredits &&
    userProfile?.wallet?.challengeTime &&
    userProfile?.wallet?.challengeCredit < challengeMaxLimit
  ) {
    let { hours, minutes, seconds, total } = timeLeftInChallangeCredits(
      userProfile?.wallet?.challengeTime,
    );
    challengeTime = `${hours > -1 ? (hours < 10 ? '0' + hours : hours) : '00'
      } : ${minutes > -1 ? (minutes < 10 ? '0' + minutes : minutes) : '00'} : ${seconds > -1 ? (seconds < 10 ? '0' + seconds : seconds) : '00'
      }`;
    if (
      total < 0 &&
      updateStateToRefreshTime - refreshedAt > refreshDelaySec &&
      refreshCount < maxRefreshRetry
    ) {
      refreshedAt = updateStateToRefreshTime;
      refreshCount++;
      dispatch(fetchUserProfileAction());
    }
  }

  return (
    <View style={styles.mainContent}>
      <View style={styles.leftContent}>
        <Pressable onPress={() => navigation.navigate('WalletScreen', { wallet: 'tickets' })}
          style={styles.buttonView}>
          <Image
            style={{
              height: wp(11),
              width: wp(11),
              transform: [{ rotate: '-45 deg' }, { scale: 0.8 }],
            }}
            source={Images.MONEY_ICON}
          />
          <View
            style={[styles.roundTextView, { borderColor: Colors.APP_GREEN_COLOR }]}>
            <Text
              style={{
                fontFamily: 'Helvetica Neue',
                minWidth: wp(11) - 5,
                textAlign: 'center',
                fontSize: PLATFORM_IOS ? 14 : 12,
                padding: hp(0.1),
                paddingHorizontal: wp(1.25),
                fontWeight: '700',
                color: Colors.APP_GREEN_COLOR,
              }}>
              {userProfile?.wallet?.ticket}
            </Text>
          </View>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('WalletScreen', { wallet: 'coins' })}
          style={styles.buttonView}>
          <Image
            style={{ height: wp(11), width: wp(11) }}
            source={Images.COINS_ICON}
          />
          <View style={[styles.roundTextView, { borderColor: Colors.APP_YELLOW_COLOR }]}>
            <Text
              style={{
                fontFamily: 'Helvetica Neue',
                minWidth: wp(11) - 5,
                textAlign: 'center',
                fontSize: PLATFORM_IOS ? 14 : 12,
                padding: hp(0.1),
                paddingHorizontal: wp(1.25),
                fontWeight: '700',
                color: Colors.APP_YELLOW_COLOR,
              }}>
              {userProfile?.wallet?.coin}
            </Text>
          </View>
        </Pressable>
        <CountTimer
          headerImageSize={wp(11)}
          wallet={userProfile?.wallet}
          level={userProfile?.level}
          showChallangeCredits={props?.showChallangeCredits}
          showScratchCredits={props?.showScratchCredits}
          fetchUserProfileAction={async () => {
            await dispatch(fetchUserProfileAction());
          }}
          onGoToWalletScreen={wallet => {
            navigation.navigate('WalletScreen', { wallet });
          }}
        />
      </View>

      <View style={styles.rightContent}>
        <Pressable
          onPress={() => navigation.navigate('WheelStack')}>
          <Image
            source={Images.HEADER_WHEEL_ICON}
            resizeMode="contain"
            style={styles.iconImage}
          />
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('CrownScreen')}>
          <Image
            source={Images.CROWN_ICON}
            resizeMode="contain"
            style={styles.iconImage}
          />
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('ProfileScreen')}>
          <CustomImage
            source={imgSrc}
            resizeMode="contain"
            style={{
              height: wp(11),
              width: wp(11),
              borderRadius: wp(10),
              overflow: 'hidden',
            }}
          />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  mainContent: {
    flexDirection: 'row',
    padding: wp(5),
    paddingVertical: hp(0.3),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flexDirection: 'row',
    marginRight: wp(1)
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  buttonView: {
    alignItems: 'center',
    marginRight: wp(1)
  },
  roundTextView: {
    marginTop: PLATFORM_IOS ? -hp(1.9) : -hp(2),
    backgroundColor: Colors.White,
    borderWidth: 1,
    borderRadius: wp(11),
  },
  iconImage: {
    height: wp(11),
    width: wp(11),
    marginRight: wp(1.3),
  },
  content: {
    alignItems: 'center'
},
imageView: {
    marginHorizontal: wp(1.1)
},
yellowTextStyles: {
    fontFamily: 'Helvetica Neue',
    textAlign: 'center',
    padding: 0,
    fontWeight: '700',
    color: Colors.APP_YELLOW_COLOR,
},
blueTextStyles: {
    fontFamily: 'Helvetica Neue',
    textAlign: 'center',
    padding: 0,
    fontWeight: '700',
    color: Colors.APP_BLUE_COLOR,
}
})

export default Header