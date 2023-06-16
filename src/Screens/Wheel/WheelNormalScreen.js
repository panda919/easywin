import React, { useEffect, useRef, useState } from 'react'
import { Image, Pressable, StyleSheet, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import ScreenWrapper from '../../Components/ScreenWrapper';
import Header from '../../Components/Header';
import Roulette from '../../Components/Roulette';
import { Images } from '../../Utils/images'
import { errorMessage, fetchUserProfileAction, hidePopup, showPopup, updateLocalUserProfileWithDataAction } from '../../Actions';
import { apiGet, timeLeftToday, wheelParticipation } from '../../Utils/functions';
import { SCREEN_WIDTH, TAPJOY_CONFIG } from '../../Constants';
import PopupBase from '../../Components/PopupBase';
import { LMSText } from '../../Languages/LMSText';
import Text from '../../Components/Text';
import { hp, wp } from '../../Helper/ResponsiveScreen';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../Styles/Colors';
import Loader from '../../Components/Loader';
import YTVideoPlayer from '../../Components/YTVideoPlayer';
import Orientation from 'react-native-orientation-locker';
import { withAppContext } from '../../Context/AppProvider';
import commonStyles from '../../Styles/index';
import Lang from '../../Languages/LanguageStr';
import { useTapjoy } from 'react-native-tapjoy';

const FREE_SPIN = 'freeSpin';
const COIN_SPIN = 'coinSpin';
const AD_SPIN = 'adSpin';
let countdownInterval = null;

const WheelNormalScreen = (props) => {
  const [
    { tapjoyEvents },
    {
      initialiseTapjoy,
      listenToEvent,
      addTapjoyPlacement,
      showTapjoyPlacement,
      requestTapjoyPlacementContent,
    },
  ] = useTapjoy(TAPJOY_CONFIG);

  const dispatch = useDispatch()
  const roulette = useRef()
  const xp = useSelector((state) => state.userReducer?.userProfile?.xp)
  const wallet = useSelector((state) => state.userReducer?.userProfile?.wallet)
  const userProfile = useSelector((state) => state.userReducer?.userProfile)

  const [loading, setLoading] = useState(true)
  const [wheelOptions, setWheelOptions] = useState(null)
  const [wheelCoinsCost, setWheelCoinsCost] = useState(null)
  const [spinType, setSpinType] = useState(FREE_SPIN)
  const [videoModalVisible, setVideoModalVisible] = useState(false)
  const [videoId, setVideoId] = useState(null)
  const [timer, setTimer] = useState(0)
  const [remainingTime, setRemainingTime] = useState('')
  const [rouletteState, setRouletteState] = useState('')
  const [urlAd, setUrlAd] = useState(null)
  const [wheel, setWheel] = useState(null)
  const [prizeSlots, setPrizeSlots] = useState(null)
  const [wonPrize, setWonPrize] = useState(null)
  const [wonPrizeSlot, setWonPrizeSlot] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchUserProfileAction())
      await GetWheelData()

      countdownInterval = setInterval(() => {
        let { hours, minutes, seconds } = timeLeftToday();
        if (xp?.coinSpin && hours > 22 && minutes > 57 && seconds % 10 == 9) {
          //fetch profile evey 10 sec for minut 58 and 59 if spent
          dispatch(fetchUserProfileAction());
        }

        setRemainingTime(` ${hours > 9 ? hours : '0' + hours} :  ${minutes > 9 ? minutes : '0' + minutes
          } : ${seconds > 9 ? seconds : '0' + seconds}`)
      }, 1000);

    }
    fetchData()

    return () => {
      clearInterval(countdownInterval);
    }
  }, [])

  useEffect(() => {
    const listeners = {};
    tapjoyEvents.forEach(tapjoyEvent => {
      listeners[tapjoyEvent] = listenToEvent(tapjoyEvent, evt => {
        if (global.tapjoyType == 'wheel') {
          console.log('tapjoy type....concours');
          if (wheel && wheel?.tapjoyId) {
            if (wheel?.tapjoyId == evt.placementName) {
              _stopVideo();
            }
          }
        }
        hidePopup();
      });
    });

    return () => {
      for (const key in listeners) {
        if (listeners[key] && listeners[key].remove) {
          listeners[key].remove();
        }
      }
    };
  }, [listenToEvent, tapjoyEvents, wheel?.tapjoyId]);

  useEffect(() => {
    if (rouletteState !== '' && rouletteState === 'stop') {
      if (wonPrize?.type) {
        let icon = Images.GIFT_PACK;
        let text = '';
        const { type, quantity, productName } = wonPrize;
        switch (type) {
          case 'bien': {
            icon = Images.GIFT_PACK;
            text = `${productName}`;
            break;
          }
          case 'coins': {
            icon = Images.COINS_ICON;
            text = `${productName}`;
            break;
          }
          case 'tickets': {
            icon = Images.MONEY_ICON;
            text = `${productName}`;
            break;
          }
          case 'challenge_credits': {
            icon = Images.LIGHTNING_BLUE_FILLED_ICON;
            text = `${productName}`;
            break;
          }
          case 'scratch_credits': {
            icon = Images.LIGHTNING_YELLOW_FILLED_ICON;
            text = `${productName}`;
            break;
          }
          case 'service': {
            icon = Images.GIFT_PACK;
            text = `${productName}`;
            break;
          }
          default:
            break;
        }

        showPopup(
          <PopupBase
            buttonTitle={LMSText(Lang.app.close)}
            imgSrc={icon}
            onButtonPress={() => { }}
            onClose={() => { }}>
            <View
              style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: Colors.Black }}>
                {LMSText(Lang.Wheel.youWon)}
              </Text>
              <Text
                style={{
                  color: Colors.Black,
                  fontWeight: '700',
                  fontSize: 34,
                  textAlign: 'center',
                }}>
                {text}{' '}
              </Text>
            </View>
          </PopupBase>,
        );
      }
    }
  }, [rouletteState])

  const GetWheelData = async () => {
    const wheel = await apiGet('/wheels/1');
    if (wheel && wheel?.data && wheel?.data?.coins) {
      setWheelCoinsCost(wheel?.data?.coins)
      setUrlAd(wheel?.data?.urlAd)
      setWheel(wheel?.data)
    }

    let prizeSlots = [
      { prizeSlot: 1, type: null, percent: 0 },
      { prizeSlot: 2, type: null, percent: 0 },
      { prizeSlot: 3, type: null, percent: 0 },
      { prizeSlot: 4, type: null, percent: 0 },
      { prizeSlot: 5, type: null, percent: 0 },
      { prizeSlot: 6, type: null, percent: 0 },
      { prizeSlot: 7, type: null, percent: 0 },
      { prizeSlot: 8, type: null, percent: 0 },
    ];

    getLotsData(prizeSlots);
  }

  const getLotsData = async (prizeSlots) => {
    const prizes = await apiGet('/wheel_lots?wheel=1&archive=false');

    if (prizes && prizes?.data && prizes?.data['hydra:member'] != undefined) {
      let filterprizeSlots = prizes?.data['hydra:member'].filter(obj => obj?.quantity > 0)

      await filterprizeSlots.forEach(prize => {
        const prizeSlot = parseInt(prize?.prize?.substring(5));
        prizeSlots[prizeSlot - 1] = { ...prize, prizeSlot };
      });

      const wheelOptions = prizeSlots.map(prize => (
        <View index={prize.prizeSlot} style={{ paddingLeft: 0 }}>
          {optionContent(prize)}
        </View>
      ));
      setWheelOptions(wheelOptions)
      setPrizeSlots(prizeSlots)
    }
    setLoading(false)
  }

  const onRotationStateChange = state => {
    setRouletteState(state)
  };

  const onRotate = async (option) => {
    setWonPrizeSlot(option.props.index - 1)
    setWonPrize(prizeSlots[option.props.index - 1])

    setTimeout(async () => {
      const wonPrize = prizeSlots[option.props.index - 1]

      await wheelParticipation({
        lotId: wonPrize?.id,
        prize: wonPrize?.prize ? wonPrize?.prize : null,
        wheel: 1,
        [spinType]: true,
      });

      if (wonPrize?.quantity == 1) {
        await GetWheelData();
      }
      else {
        await getLotsData(prizeSlots);
      }

      dispatch(fetchUserProfileAction());
    }, 1000);
  };
  const optionContent = (prize) => {
    switch (prize?.type) {
      case 'coins':
        return (
          <View
            style={{ flexDirection: prize.quantity > 999 ? 'column' : 'row' }}>
            <Text
              style={{
                color: prize.prizeSlot % 2 ? Colors.Black : Colors.White,
                fontSize: prize.quantity > 999 ? 14 : 19,
                fontWeight: '700',
              }}>
              {prize?.quantity}
            </Text>
            <Image
              source={Images.COINS_ICON}
              style={[styles.optionImage, {
                transform: [{ rotate: '100deg' }],
              }]}
            />
          </View>
        );
      case 'tickets':
        return (
          <View
            style={{ flexDirection: prize.quantity > 999 ? 'column' : 'row' }}>
            <Text
              style={{
                color: prize.prizeSlot % 2 ? Colors.Black : Colors.White,
                fontSize: prize.quantity > 999 ? 14 : 19,
                fontWeight: '700',
              }}>
              {prize?.quantity}
            </Text>
            <Image
              source={Images.MONEY_ICON}
              style={styles.optionImage}
            />
          </View>
        );
      case 'bien':
        return (
          <View style={{ flexDirection: 'row' }}>
            <Image
              source={Images.GIFT_ICON}
              style={[styles.optionImage, {
                width: wp(9),
                height: wp(9),
              }]}
            />
          </View>
        );
      case 'service':
        return (
          <View style={{ flexDirection: 'row' }}>
            <Image
              source={Images.GIFT_ICON}
              style={[styles.optionImage, {
                width: wp(9),
                height: wp(9),
              }]}
            />
          </View>
        );
      case 'challenge_credits':
        return (
          <View style={{ flexDirection: 'row' }}>
            <Text
              style={{
                color: prize.prizeSlot % 2 ? Colors.Black : Colors.White,
                fontSize: prize.quantity > 999 ? 14 : 19,
                fontWeight: '700',
              }}>
              {prize?.quantity}
            </Text>
            <Image
              source={Images.LIGHTNING_BLUE_FILLED_ICON}
              style={[styles.optionImage, {
                width: wp(9),
                height: wp(9),
              }]}
            />
          </View>
        );
      case 'scratch_credits':
        return (
          <View style={{ flexDirection: 'row' }}>
            <Text
              style={{
                color: prize?.prizeSlot % 2 ? Colors.Black : Colors.White,
                fontSize: prize?.quantity > 999 ? 14 : 19,
                fontWeight: '700',
              }}>
              {prize?.quantity}
            </Text>
            <Image
              source={Images.LIGHTNING_YELLOW_FILLED_ICON}
              style={[styles.optionImage, {
                width: wp(9),
                height: wp(9),
              }]}
            />
          </View>
        );
      default:
        return null;
    }
  }

  const _playVideo = async () => {
    const video = urlAd;
    const tapjoyId = wheel?.tapjoyId;
    if (tapjoyId) {
      global.tapjoyType = "wheel"

      showPopup(
        <View
          style={{
            backgroundColor: 'transparent',
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Loader size={'large'} color={'white'} />
        </View>,
      );
      try {
        const initialized = await initialiseTapjoy();
        if (initialized) {
          let add = await addTapjoyPlacement(tapjoyId);
          try {
            if (add) {
              let req = await requestTapjoyPlacementContent(tapjoyId);
              if (req) {
                try {
                  setTimeout(async () => {
                    await showTapjoyPlacement(tapjoyId);
                  }, 2000);
                } catch (e) {
                  console.log('e-=-----', e)
                  hidePopup();
                  return true;
                }
              }
            }
          } catch (e) {
            console.log('e=======', e)
            hidePopup();
            return true;
          }
        }
      } catch (e) {
        hidePopup();
        return true;
      }
    } else if (video) {
      try {
        let index = video.lastIndexOf('watch?v=');
        let finalVideoId = null;
        if (index > -1) {
          finalVideoId = video.substring(index + 8);
          index = finalVideoId.lastIndexOf('&ab_channel=');
          if (index > -1) {
            finalVideoId = finalVideoId.substring(0, index);
          }
          setVideoId(finalVideoId)
          setVideoModalVisible(true)
        }
      } catch (error) {
        // alert('invalid video url');
        return;
      }
    }
  }

  const _stopVideo = () => {
    Orientation.lockToPortrait();
    setTimeout(() => {
      setVideoModalVisible(false)
      setSpinType(AD_SPIN)
      roulette?.current?.triggerSpin()
      global.tapjoyType = ''
    }, 1000);
  }

  return (
    <ScreenWrapper contentContainerStyle={commonStyles.screenWrapperContent}>
      <Header />
      {wheelOptions ? (
        <View style={styles.centerView}>
          <Roulette
            ref={roulette}
            enableUserRotate={!xp?.coinSpin}
            radius={SCREEN_WIDTH}
            background={Images.WHEEL_NORMAL_BG}
            marker={Images.MARKER}
            onRotate={(option) => onRotate(option)}
            onRotateChange={(state) => onRotationStateChange(state)}
            options={wheelOptions}
            prizeSlots={prizeSlots}
            rotateEachElement={index =>
              ((index * 360) / wheelOptions.length) * -1 - 90
            }
            markerWidth={wp(5)}
          />
          {!xp?.freeSpin && (
            <Pressable
              disabled={rouletteState === 'start'}
              onPress={async () => {
                setSpinType(FREE_SPIN)
                let newUserProfile = userProfile;
                newUserProfile.xp.freeSpin = true;
                await dispatch(updateLocalUserProfileWithDataAction(
                  newUserProfile,
                ));
                roulette?.current?.triggerSpin();
              }}>
              <LinearGradient
                colors={['#FFDB0F', '#FFB406']}
                style={styles.buttonStyle}>
                <Text
                  style={{
                    color: Colors.Black,
                    fontSize: 16,
                    fontWeight: '700',
                    textAlign: 'center'
                  }}>
                  TOUR GRATUIT
                </Text>
              </LinearGradient>
            </Pressable>
          )}

          {!xp?.adSpin && xp?.freeSpin && (
            <Pressable
              disabled={rouletteState === 'start'}
              onPress={async () => {
                let newUserProfile = userProfile;
                newUserProfile.xp.adSpin = true;
                await dispatch(updateLocalUserProfileWithDataAction(
                  newUserProfile,
                ));
                _playVideo();
              }}>
              <LinearGradient
                colors={['#FFDB0F', '#FFB406']}
                style={[styles.buttonStyle, {
                  alignItems: 'center',
                  flexDirection: 'row',
                }]}>
                <Image
                  source={Images.VIDEO_PLAY_ICON}
                  style={styles.videoPlayIcon}
                />
                <Text
                  style={{
                    color: Colors.Black,
                    fontSize: 16,
                    fontWeight: '700',
                    textAlign: 'center',
                    marginLeft: wp(5)
                  }}>
                  TOURNER
                </Text>
              </LinearGradient>
            </Pressable>
          )}

          {wheelCoinsCost && (
            <Pressable
              disabled={rouletteState === 'start' || xp?.coinSpin}
              onPress={async () => {
                if (wallet?.coin >= wheelCoinsCost) {
                  setSpinType(COIN_SPIN)
                  let newUserProfile = userProfile;
                  newUserProfile.xp.coinSpin = true;
                  newUserProfile.wallet.coin =
                    userProfile.wallet.coin - wheelCoinsCost;
                  await dispatch(updateLocalUserProfileWithDataAction(
                    newUserProfile,
                  ));
                  roulette.current.triggerSpin();
                } else {
                  errorMessage(LMSText(Lang.user.insufficientCoins));
                }
              }}>
              <View
                style={[styles.coinPiecesButton, {
                  backgroundColor: xp?.coinSpin
                    ? Colors.APP_GRAY_COLOR
                    : Colors.APP_BLUE_COLOR
                }]}>
                <Text
                  style={{
                    color: Colors.White,
                    fontSize: 13,
                    fontWeight: '400',
                    textAlign: 'center'
                  }}>
                  {` ${wheelCoinsCost}  `}
                </Text>
                <Image
                  source={Images.COIN_ICON}
                  style={styles.coinIcon}
                />
                {xp?.coinSpin && <Text
                  style={{
                    color: Colors.White,
                    fontSize: 13,
                    fontWeight: '400',
                    textAlign: 'center'
                  }}>
                  {` ${xp?.coinSpin ? remainingTime : ''} `}
                </Text>}
              </View>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={styles.noLoadwheel}>
          {loading ? (
            <Loader />
          ) : (
            <Text style={{ color: Colors.Black, textAlign: 'center' }}>
              Could not load wheel
            </Text>
          )}
        </View>
      )}
      {(videoModalVisible && videoId) && (
        <YTVideoPlayer
          videoModalVisible={videoModalVisible}
          videoId={videoId}
          _stopVideo={() => _stopVideo()}
          onError={() => setVideoModalVisible(false)}
        />
      )}
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  optionImage: {
    transform: [{ rotate: '90deg' }],
    marginLeft: wp(2.5),
    marginRight: -wp(1.5),
    width: wp(8),
    height: wp(8),
  },
  centerView: {
    alignItems: 'center'
  },
  buttonStyle: {
    marginVertical: hp(1),
    width: wp(100) * 0.8,
    borderRadius: 100,
    height: hp(5),
    justifyContent: 'center',
  },
  videoPlayIcon: {
    marginLeft: -wp(5),
    width: wp(8),
    height: wp(8)
  },
  coinPiecesButton: {
    marginVertical: hp(1),
    width: wp(100) * 0.6,
    borderRadius: 100,
    height: hp(4),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  coinIcon: {
    width: wp(4),
    height: wp(4)
  },
  noLoadwheel: {
    marginTop: hp(2)
  }
})

export default withAppContext(WheelNormalScreen)