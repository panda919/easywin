import { View, SafeAreaView, StatusBar, Image, TouchableOpacity, ImageBackground, Share } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import WebView from 'react-native-webview'
import { Colors } from '../Styles/Colors'
import Orientation from 'react-native-orientation-locker'
import { useNavigation } from '@react-navigation/native'
import { Images } from '../Utils/images'
import { hp, PLATFORM_IOS, wp } from '../Helper/ResponsiveScreen'
import YTVideoPlayer from '../Components/YTVideoPlayer'
import Loader from '../Components/Loader'
import { withAppContext } from '../Context/AppProvider'
import { fetchUserProfileAction, hidePopup, showPopup, updateCompetitionParticipationWithDataAction, updateLocalUserProfileWithDataAction } from '../Actions'
import { SCREEN_HEIGHT, TAPJOY_CONFIG } from '../Constants'
import {
  apiPost,
  gameGetVideo,
  getGameParticipationForToday,
  makeGameParticipation,
  updateParticipation
} from '../Utils/functions'
import LinearGradient from 'react-native-linear-gradient'
import { useDispatch } from 'react-redux'
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTapjoy } from 'react-native-tapjoy'

const WebGameScreen = (props) => {
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

  const navigation = useNavigation()
  const webViewRef = useRef()
  const dispatch = useDispatch()
  const { top } = useSafeAreaInsets()

  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState(0)
  const [gamePlayed, setGamePlayed] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [videoModalVisible, setVideoModalVisible] = useState(false)
  const [videoId, setVideoId] = useState(null)
  const [orientation, setOrientation] = useState('PORTRAIT')
  const [isstart, setIsstart] = useState(0)
  const [oldscore, setOldscore] = useState(0)
  const [revivre, setRevivre] = useState(false)

  useEffect(() => {
    Orientation.addOrientationListener(_orientationDidChange);
    const gameType = props?.route?.params?.game?.type;
    if (gameType == 'gravity' || gameType == 'stickyman') {
      if (PLATFORM_IOS) {
        Orientation.lockToLandscapeRight();
      } else {
        Orientation.lockToLandscapeLeft();
      }
    }

    return () => {
      renderUnmountData()
    }
  }, [])

  useEffect(() => {
    const listeners = {};
    const selectedGame = props?.route?.params?.game;

    tapjoyEvents.forEach(tapjoyEvent => {
      listeners[tapjoyEvent] = listenToEvent(tapjoyEvent, evt => {
        if (global.tapjoyType == 'webgame') {
          console.log('tapjoy type....concours', selectedGame?.tapjoyId);
          if (selectedGame && selectedGame?.tapjoyId) {
            if (selectedGame?.tapjoyId == evt.placementName) {
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
  }, [listenToEvent, tapjoyEvents, props?.route?.params?.game?.tapjoyId]);

  const renderUnmountData = async () => {
    hidePopup();
    Orientation.lockToPortrait();
    await dispatch(fetchUserProfileAction());
    Orientation.getOrientation((err, orientation) => {
      console.log(`Current Device Orientation: ${orientation}`);
    });
    // Remember to remove listener
    Orientation.removeOrientationListener(_orientationDidChange);
  }

  const _orientationDidChange = (orientation) => {
    if (orientation === 'LANDSCAPE') {
      setOrientation('LANDSCAPE')
      // do something with landscape layout
    } else {
      setOrientation('PORTRAIT')
      // do something with portrait layout
    }
  };

  const _saveScore = async (score, revivre, gameEnded) => {
    const game = props?.route?.params?.game;

    let gameCoins = await apiPost(`/minigames/${game?.id}`, { score, save: 0 });

    let shareType = '';
    switch (game?.id) {
      case 1:
        shareType = 'share_tower';
        break;
      case 2:
        shareType = 'share_gravity';
        break;
      case 3:
        shareType = 'share_stickyman';
        break;
      default:
        break;
    }

    if (gameEnded) {
      showPopup(
        <View
          style={{
            borderRadius: wp(2.5),
            borderWidth: 2,
            borderColor: Colors.White,
            width: wp(100) * 0.85,
            minHeight: SCREEN_HEIGHT / 3.5,
            maxHeight: SCREEN_HEIGHT / 2,
            backgroundColor: Colors.White,
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingHorizontal: wp(5),
          }}>
          <ImageBackground
            source={Images.RIBBON_ICON}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              width: wp(100) * 0.95,
              height: hp(10),
              marginTop: -hp(6),
              backgroundColor: 'transparent',
            }}
            imageStyle={{
              width: wp(100) * 0.95,
              height: hp(10),
              resizeMode: 'cover',
              backgroundColor: 'transparent',
            }}
          />
          <TouchableOpacity
            onPress={() => {
              hidePopup();
              navigation.goBack();
              setLoading(false)
            }}
            style={{ position: 'absolute', right: 0, top: hp(0.7) }}>
            <Image
              source={Images.VIDEO_CROSS_ICON}
              style={{ height: wp(10), width: wp(10) }}
            />
          </TouchableOpacity>
          <View style={{ flex: 1, width: '100%' }}>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: Colors.Black,
                  fontSize: 16,
                  fontWeight: '700',
                }}>{`Votre score : ${score}`}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: hp(0.6) }}>
                <Text
                  style={{
                    color: Colors.Black,
                    fontSize: 16,
                    fontWeight: '700',
                    paddingBottom: hp(0.2)
                  }}>{`Vous remportez ${gameCoins?.data?.coins}`}</Text>
                <Image
                  source={Images.COIN_ICON}
                  style={{ width: wp(4), height: wp(4), marginLeft: wp(1.5) }}
                />
              </View>
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around',
                width: '100%',
                marginVertical: hp(2),
              }}>
              <TouchableOpacity
                onPress={async () => {
                  //reload webpage
                  setLoading(false)
                  setIsstart(0);
                  setScore(0)
                  setGamePlayed(false)
                  setGameEnded(false)
                  //webViewRef?.current?.reload();
                  // call the game action
                  let name = ''
                  if (game.type === 'tower' ) {
                    name = 'ColorGame';
                  } else if (game.type === 'gravity' ) {
                    name = 'ChooseGravity';
                  } else {
                    name = 'Stickyman';
                  }
                  setRevivre(false);
                  await gameGetVideo('/'+ name + '/setValue?value=REJOUER');
                  hidePopup();

                  setLoading(false)
                }}>
                <LinearGradient
                  colors={['#FFDB0F', '#FFB406']}
                  style={{
                    flexDirection: 'row',
                    height: hp(4.8),
                    paddingHorizontal: wp(2),
                    borderRadius: wp(10),
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: Colors.Black,
                      fontSize: 18,
                      fontWeight: '700',
                      paddingHorizontal: wp(2.5),
                    }}>
                    REJOUER
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  hidePopup();
                  setLoading(false)
                  try {
                    const result = await Share.share({
                      message: `Mon score est de ` + score + ` sur le jeu `+ props?.route?.params?.game + `, viens me battre sur EasyWin pour gagner des cadeaux. Celui qui fait le meilleur score gagne [nom du lot 1 du mois].\n➡️ Lien d'EasyWin : www.easy-win.io"}`,
                    });
                    props?.navigation?.goBack();
                    let minigame_score_share_res = await apiPost(
                      '/missions/post_minigame_share_score',
                      { shareType },
                    );
                    console.log(
                      'minigame_score_share_res...,',
                      minigame_score_share_res,
                    );

                    if (
                      minigame_score_share_res &&
                      minigame_score_share_res?.data
                    ) {
                      dispatch(updateLocalUserProfileWithDataAction(
                        minigame_score_share_res.data,
                      ));
                      console.log(
                        'minigame_score_share_res',
                        minigame_score_share_res,
                      );
                    }
                  } catch (error) {
                    console.log('error', error);
                    alert(error?.message);
                  }
                }}>
                <LinearGradient
                  colors={['#FFDB0F', '#FFB406']}
                  style={{
                    flexDirection: 'row',
                    height: hp(4.8),
                    paddingHorizontal: wp(2),
                    borderRadius: wp(10),
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: Colors.Black,
                      fontSize: 18,
                      fontWeight: '700',
                      paddingHorizontal: wp(2.5),
                    }}>
                    PARTAGER
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>,
      );
      //get reward for score
      await apiPost(`/minigames/${game.id}`, { score, revivre: revivre, oldscore, save: 1 });
      setOldscore(score)
    } else {
      showPopup(
        <View
          style={{
            borderRadius: wp(2.5),
            borderWidth: 2,
            borderColor: Colors.White,
            width: wp(100) * 0.85,
            minHeight: SCREEN_HEIGHT / 3.5,
            maxHeight: SCREEN_HEIGHT / 2,
            backgroundColor: Colors.White,
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingHorizontal: wp(5),
          }}>
          <ImageBackground
            source={Images.RIBBON_ICON}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              width: wp(100) * 0.95,
              height: hp(10),
              marginTop: -hp(6),
              backgroundColor: 'transparent',
            }}
            imageStyle={{
              width: wp(100) * 0.95,
              height: hp(10),
              resizeMode: 'cover',
              backgroundColor: 'transparent',
            }}
          />
          <TouchableOpacity
            onPress={() => {
              hidePopup();
              // back to game list
              navigation.goBack();
              setLoading(false)
            }}
            style={{ position: 'absolute', right: 0, top: hp(0.7) }}>
            <Image
              source={Images.VIDEO_CROSS_ICON}
              style={{ height: wp(10), width: wp(10) }}
            />
          </TouchableOpacity>
          <View style={{ flex: 1, width: '100%' }}>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: Colors.Black,
                  fontSize: 16,
                  fontWeight: '700',
                }}>{`Votre score : ${score}`}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: hp(0.6) }}>
                <Text
                  style={{
                    color: Colors.Black,
                    fontSize: 16,
                    fontWeight: '700',
                    paddingBottom: hp(0.2)
                  }}>{`Vous remportez ${gameCoins?.data?.coins}`}</Text>
                <Image
                  source={Images.COIN_ICON}
                  style={{ width: wp(4), height: wp(4), marginLeft: wp(1.5) }}
                />
              </View>
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around',
                width: '100%',
                marginVertical: hp(2),
              }}>
              {isstart > 0 ? null : (
                <TouchableOpacity
                  onPress={ async () => {
                    setRevivre(true)
                    setIsstart(isstart + 1)
                    // call the game action
                    let name = ''
                    if (game.type === 'tower' ) {
                      name = 'ColorGame';
                    } else if (game.type === 'gravity' ) {
                      name = 'ChooseGravity';
                    } else {
                      name = 'Stickyman';
                    }
                    await gameGetVideo('/'+ name + '/setValue?value=DoneRevive');
                    hidePopup();
                    await _playVideo();
                    setLoading(false)

                  }}>
                  <LinearGradient
                    colors={['#FFDB0F', '#FFB406']}
                    style={{
                      flexDirection: 'row',
                      height: hp(4.8),
                      paddingHorizontal: wp(2.5),
                      borderRadius: wp(10),
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Image
                      source={Images.HEART_ICON}
                      style={{ width: wp(6.75), height: wp(6.75) }}
                    />
                    <Text
                      style={{
                        color: Colors.Black,
                        fontSize: 18,
                        fontWeight: '700',
                        paddingHorizontal: wp(2.5),
                      }}>
                      REVIVRE
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={async () => {
                  setIsstart(0)
                  // call the game action
                  let name = ''
                  if (game.type === 'tower' ) {
                    name = 'ColorGame';
                  } else if (game.type === 'gravity' ) {
                    name = 'ChooseGravity';
                  } else {
                    name = 'Stickyman';
                  }
                  await gameGetVideo('/'+ name + '/setValue?value=REJOUER');
                  hidePopup();
                  setRevivre(false)
                  setLoading(false)
                }}>
                <LinearGradient
                  colors={['#FFDB0F', '#FFB406']}
                  style={{
                    flexDirection: 'row',
                    height: hp(4.8),
                    paddingHorizontal: wp(2),
                    borderRadius: wp(10),
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: Colors.Black,
                      fontSize: 18,
                      fontWeight: '700',
                      paddingHorizontal: wp(2.5),
                    }}>
                    REJOUER
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {isstart === 0 ? null : (
                  <TouchableOpacity
                      onPress={async () => {
                        hidePopup();
                        setLoading(false)
                        try {
                          const result = await Share.share({
                            message: `Mon score est de ` + score + ` sur le jeu `+ props?.route?.params?.game + `, viens me battre sur EasyWin pour gagner des cadeaux. Celui qui fait le meilleur score gagne [nom du lot 1 du mois].\n➡️ Lien d'EasyWin : www.easy-win.io"}`,
                          });
                          props?.navigation?.goBack();
                          let minigame_score_share_res = await apiPost(
                              '/missions/post_minigame_share_score',
                              { shareType },
                          );
                          console.log(
                              'minigame_score_share_res...,',
                              minigame_score_share_res,
                          );

                          if (
                              minigame_score_share_res &&
                              minigame_score_share_res?.data
                          ) {
                            dispatch(updateLocalUserProfileWithDataAction(
                                minigame_score_share_res.data,
                            ));
                            console.log(
                                'minigame_score_share_res',
                                minigame_score_share_res,
                            );
                          }
                        } catch (error) {
                          console.log('error', error);
                          alert(error?.message);
                        }
                      }}>
                    <LinearGradient
                        colors={['#FFDB0F', '#FFB406']}
                        style={{
                          flexDirection: 'row',
                          height: hp(4.8),
                          paddingHorizontal: wp(2),
                          borderRadius: wp(10),
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                      <Text
                          style={{
                            color: Colors.Black,
                            fontSize: 18,
                            fontWeight: '700',
                            paddingHorizontal: wp(2.5),
                          }}>
                        PARTAGER
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
              )}
            </View>
          </View>
        </View>,
      );
      //get reward for score
      await apiPost(`/minigames/${game.id}`, { score, revivre: revivre, oldscore, save: 1 });
      setOldscore(score)
    }

    const existingGameParticipation = getGameParticipationForToday(game);
    if (existingGameParticipation) {
      let data = {
        ...existingGameParticipation,
        revivre: revivre
      };
      switch (game?.id) {
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
      let res = await updateParticipation(data, existingGameParticipation?.id);
      if (res && res?.data) {
        dispatch(updateCompetitionParticipationWithDataAction(res?.data));
      }
      // }
    } else {
      let res = await makeGameParticipation(game?.id, score);
      if (res && res?.data) {
        dispatch(updateCompetitionParticipationWithDataAction(res?.data));
      }
    }
  };

  const _playVideo = async () => {
    const { videoUrl, tapjoyId } = props?.route?.params?.game;
    if (tapjoyId) {
      global.tapjoyType = "webgame"

      showPopup(
        <View
          style={{
            backgroundColor: 'transparent',
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Loader size={'large'} color={Colors.White} />
        </View>,
      );
      try {
        const initialized = await initialiseTapjoy();
        if (initialized) {
          await addTapjoyPlacement(tapjoyId);
          try {
            let req = await requestTapjoyPlacementContent(tapjoyId);
            if (req) {
              setTimeout(async () => {
                try {
                  await showTapjoyPlacement(tapjoyId);
                } catch (e) {
                  console.log('e-=-----', e)
                  hidePopup();
                  return true;
                }
              }, 2000);
            }
          } catch (e) {
            hidePopup();
            return true;
          }
        }
      } catch (e) {
        hidePopup();
        return true;
      }
    }

    const video = videoUrl;
    if (video) {
      try {
        let index = video?.lastIndexOf('watch?v=');
        let finalVideoId = null;
        if (index > -1) {
          finalVideoId = video?.substring(index + 8);
          index = finalVideoId?.lastIndexOf('&ab_channel=');
          if (index > -1) {
            finalVideoId = finalVideoId?.substring(0, index);
          }
          setVideoId(finalVideoId)
          setVideoModalVisible(true)
          console.log('finalVideoId', finalVideoId);
        }
      } catch (error) {
        console.log('video link parse error', error);
        return;
      }
    }
    setVideoModalVisible(true)
  };

  const _stopVideo = () => {
    setTimeout(() => {
      const game = props?.route?.params?.game;
      if (game?.id == 1) {
        Orientation.lockToPortrait();
      }
      setVideoModalVisible(false)
      setGamePlayed(false)
      setGameEnded(false)
    }, 750);
  };

  const render = () => {
    return (
      <>
        <StatusBar hidden={orientation === 'LANDSCAPE' ? true : false} />
        <WebView
          incognito={true}
          useWebKit
          originWhitelist={['*']}
          ref={webViewRef}
          source={{ uri: props?.route?.params?.game?.url }}
          onLoad={() => setLoading(false)}
          onMessage={(event) => {
            setLoading(true)
            let events = Object.assign({}, event);
            let { data } = JSON.parse(events?.nativeEvent?.data);

            if (data?.score != undefined && revivre === false) {
              // alert(`user can revive and score is: ${data.score}`);
              setGamePlayed(true)
              setScore(data?.score)
              _saveScore(data?.score, false)
            } else if (data?.score != undefined && revivre === true) {
              // alert(`Game end. final score is :${data.score}`);
              setGamePlayed(true)
              setGameEnded(true)
              setScore(data?.score)
              _saveScore(data?.score, true, true)
            } else if (data?.requestRevive) {
              // alert('user requested to revive, show video and then let user revive');
              /*_playVideo();*/
              setLoading(false)
            }
          }}
        />
        <View style={{ position: 'absolute', top: PLATFORM_IOS ? top : hp(0.5) }}>
          <TouchableOpacity
            onPress={() => {
              Orientation.lockToPortrait();
              navigation.goBack();
            }}>
            <Image
              source={Images.BACK_ICON}
              style={{
                width: wp(10),
                height: wp(10),
                marginTop: orientation === 'LANDSCAPE' ? hp(2.4) : StatusBar.currentHeight || 0,
                marginLeft: orientation === 'LANDSCAPE' ? 0 : wp(5),
              }}
            />
          </TouchableOpacity>
        </View>

        {loading && (
          <View
            style={{
              felx: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'transaprent',
              position: 'absolute',
              zIndex: 1,
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}>
            <Loader />
          </View>
        )}
        {(videoModalVisible && videoId) && (
          <YTVideoPlayer
            videoModalVisible={videoModalVisible}
            videoId={videoId}
            _stopVideo={_stopVideo}
            onError={() => setVideoModalVisible(false)}
          />
        )}
      </>
    )
  }

  return (
    <>
      {PLATFORM_IOS ?
        <View style={{ flex: 1, backgroundColor: '#515151', paddingTop: top }}>
          {render()}
        </View>
        :
        <SafeAreaView style={{ flex: 1 }}>
          {render()}
        </SafeAreaView>
      }
    </>
  )
}

export default withAppContext(WebGameScreen)
