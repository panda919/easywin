import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, FlatList, Image, Pressable, RefreshControl, Share, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import ScreenWrapper from '../../Components/ScreenWrapper';
import Header from '../../Components/Header';
import { PLATFORM_IOS, hp, wp } from '../../Helper/ResponsiveScreen';
import { Colors } from '../../Styles/Colors';
import Text from '../../Components/Text';
import { useTapjoy } from 'react-native-tapjoy';
import { SERVER_BASE, TAPJOY_CONFIG } from '../../Constants';
import { errorMessage, fetchScratchesActions, fetchUserProfileAction, hidePopup, showPopup, updateCompetitionParticipationWithDataAction } from '../../Actions';
import FastImage from 'react-native-fast-image';
import { fetchLots, getUserLot, makeParticipation, scratchParticipation, spendUserCredits, updateParticipation, updateStatistics, updateUserWallet, weighted_random } from '../../Utils/functions';
import Lang from '../../Languages/LanguageStr';
import Loader from '../../Components/Loader';
import { useDispatch, useSelector } from 'react-redux';
import Orientation from 'react-native-orientation-locker';
import { LMSText } from '../../Languages/LMSText';
import AsyncStorage from '@react-native-community/async-storage';
import InViewPort from '../../Components/InViewPort';
import commonStyles from '../../Styles/index';
import { Images } from '../../Utils/images';
import LinearGradient from 'react-native-linear-gradient';
import PopupBase from '../../Components/PopupBase';
import BannerAd from '../../Components/BannerAd';
import RulesSheet from '../../Components/RulesSheet';
import YTVideoPlayer from '../../Components/YTVideoPlayer';
import LotsSheet from '../../Components/Grattage/LotsSheet';
import ScratchSheet from '../../Components/Grattage/ScratchSheet';
import CustomImage from '../../Components/CustomImage';
import { BlurView } from '@react-native-community/blur';
import moment from "moment";
import _ from 'lodash';
import { withAppContext } from '../../Context/AppProvider';

const typeFilterOptions = [
  { label: 'NOUVEAUX', value: 'En attene' },
  { label: 'EN COURS', value: 'En cours' },
  { label: 'BIENTÔT TERMINÉS', value: 'Terminé' },
];

const GrattageScreen = (props) => {
  let possibleView = null;
  let initViewCount = 0;
  let isDoneFirstRender = false;

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

  const dispatch = useDispatch();
  const viewRef = useRef();

  const userReducer = useSelector(state => state?.userReducer);
  const scratchesData = useSelector(state => state?.scratchesReducer?.scratches);
  const nextPage = useSelector(state => state?.scratchesReducer?.nextPage);

  const [isScratchSheetOpen, setIsScratchSheetOpen] = useState(false);
  const [isRulesSheetOpen, setIsRulesSheetOpen] = useState(false);
  const [isLotsSheetOpen, setIsLotsSheetOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [selectedScratch, setSelectedScratch] = useState(false);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
  const [selectedScratchLots, setSelectedScratchLots] = useState([]);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [loadingMakeParticipation, setLoadingMakeParticipation] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [scratchLot, setScratchLot] = useState(null);
  const [gameResult, setGameResult] = useState('');
  const [scratchDone, setScratchDone] = useState(false);
  const [showScratchBgImage, setShowScratchBgImage] = useState(false);
  const [scratchid, setScratchid] = useState(1);
  const [withCoins, setWithCoins] = useState(null);
  const [loadingLots, setLoadingLots] = useState(null);
  const [rulesLink, setRulesLink] = useState(null);

  const viewConfigRef = useRef({
    waitForInteraction: false,
    minimumViewTime: 500,
    viewAreaCoveragePercentThreshold: 85,
  });

  useEffect(() => {
    let backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (videoModalVisible) {
        return true;
      }
    });

    _handleRefresh();
  }, [])

  useEffect(() => {
    let didBlurSubscription = props?.navigation?.addListener('blur', payload => {
      possibleView = null;
      isDoneFirstRender = false;
    });

    let didFocusSubscription = props?.navigation?.addListener("focus", () => {
      possibleView = initViewCount;
      isDoneFirstRender = true;
    });

    return () => {
      didBlurSubscription?.remove();
      didFocusSubscription?.remove();
    }
  }, [props?.navigation])

  useEffect(() => {
    const listeners = {};

    tapjoyEvents.forEach(tapjoyEvent => {
      listeners[tapjoyEvent] = listenToEvent(tapjoyEvent, evt => {
        if (global.tapjoyType == 'grattage') {
          console.log('tapjoy type....grattage', selectedScratch?.tapjoyId);
          if (selectedScratch && selectedScratch?.tapjoyId) {
            if (selectedScratch?.tapjoyId == evt.placementName) {
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
  }, [listenToEvent, tapjoyEvents, selectedScratch?.tapjoyId]);

  const _handleRefresh = async () => {
    setLoading(true)
    await dispatch(fetchScratchesActions());
    _cacheScratchImages();
    setLoading(false)
  };

  const _cacheScratchImages = async () => {
    let images = scratchesData?.map(scratch => ({
      uri: `${SERVER_BASE}${scratch?.imageBackgroundUrl}`,
    }));

    FastImage.preload(images);
  };

  const _playVideo = async (selectedScratch) => {
    const { video, tapjoyId, statistic, type, coins, id } = selectedScratch;
    const competitionParticipationsDetails = userReducer?.userProfile?.competitionParticipationsDetails;

    setLoadingMakeParticipation(true)
    const participationIndex = competitionParticipationsDetails?.findIndex(
      competitionParticipation =>
        competitionParticipation?.scratch &&
        competitionParticipation?.scratch['@id']?.substring(11) == id,
    );

    if (participationIndex > -1) {
      //have participated
      const participation = competitionParticipationsDetails[participationIndex];

      let spendCurrencyData = {};

      if (withCoins) {
        spendCurrencyData.scratchCoins = coins;
      } else {
        spendCurrencyData.scratchCredit = 1;
      }

      if (type === 'sponsored') {
        let creditsRes = await spendUserCredits(
          spendCurrencyData,
          participation.id,
        );
        if (creditsRes?.error?.data['hydra:description'] == 'scratchLimitPerDay is reached') {
          errorMessage(LMSText(Lang.user.scratchParticipationLimitReached));
          // open scratch bottom sheet
          setIsScratchSheetOpen(false)
          _handleRefresh();
        } else {
          if (tapjoyId) {
            global.tapjoyType = "grattage"

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
                        if (typeof statistic == 'string') {
                          const statisticId = statistic.split('/')[2];
                          if (statistic && statisticId) {
                            await updateStatistics(statisticId, { toIncrementWatchedTapJoyAd: 1 });
                          }
                        } else if (statistic?.id) {
                          if (statistic && statistic.id) {
                            await updateStatistics(statistic.id, { toIncrementWatchedTapJoyAd: 1 });
                          }
                        }
                      }
                      catch (e) {
                        console.log('err...', e);
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
            }

          }
          else if (video) {
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
                if (typeof statistic === 'string') {
                  const statisticId = statistic.split('/')[2];
                  if (statistic && statisticId) {
                    updateStatistics(statisticId, { toIncrementWatchedAd: 1 });
                  }
                } else if (statistic?.id) {
                  if (statistic && statistic.id) {
                    updateStatistics(statistic.id, { toIncrementWatchedAd: 1 });
                  }
                }

              }
            } catch (error) {
              console.log('video link parse error', error);
              return;
            }
          }
        }
      } else {
        if (tapjoyId) {
          global.tapjoyType = "grattage"

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
                      if (typeof statistic == 'string') {
                        const statisticId = statistic.split('/')[2];
                        if (statistic && statisticId) {
                          updateStatistics(statisticId, { toIncrementWatchedTapJoyAd: 1 });
                        }
                      } else if (statistic?.id) {
                        if (statistic && statistic.id) {
                          updateStatistics(statistic.id, { toIncrementWatchedTapJoyAd: 1 });
                        }
                      }
                    }
                    catch (e) {
                      console.log('err...', e);
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
          }
        } else if (video) {
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
              if (typeof statistic === 'string') {
                const statisticId = statistic.split('/')[2];
                if (statistic && statisticId) {
                  updateStatistics(statisticId, { toIncrementWatchedAd: 1 });
                }
              } else if (statistic?.id) {
                if (statistic && statistic.id) {
                  updateStatistics(statistic.id, { toIncrementWatchedAd: 1 });
                }
              }
            }
          } catch (error) {
            console.log('video link parse error', error);
            return;
          }
        }
      }
    } else {
      const res = await makeParticipation(
        selectedScratch,
        true,
        withCoins,
        true
      );
      console.log('makeParticipation res', res);
      if (res?.data) {
        let dataupdate = {
          scratchLimitPerDay: res?.data?.scratchLimitPerDay - 1,
          numberOfParticipations: res?.data?.numberOfParticipations + 1,
        };
        let updatedata = await updateParticipation(dataupdate, res?.data?.id);

        console.log("update part ----", updatedata);
        await dispatch(updateCompetitionParticipationWithDataAction(
          res.data,
        ));
        await dispatch(fetchUserProfileAction());
        if (tapjoyId) {
          global.tapjoyType = "grattage"

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
                      if (typeof statistic == 'string') {
                        const statisticId = statistic.split('/')[2];
                        if (statistic && statisticId) {
                          updateStatistics(statisticId, { toIncrementWatchedTapJoyAd: 1 });
                        }
                      } else if (statistic?.id) {
                        if (statistic && statistic.id) {
                          updateStatistics(statistic.id, { toIncrementWatchedTapJoyAd: 1 });
                        }
                      }
                    }
                    catch (e) {
                      console.log('err...', e);
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
          }
        } else if (video) {
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
              if (typeof statistic === 'string') {
                const statisticId = statistic.split('/')[2];
                if (statistic && statisticId) {
                  updateStatistics(statisticId, { toIncrementWatchedAd: 1 });
                }
              } else if (statistic?.id) {
                if (statistic && statistic.id) {
                  updateStatistics(statistic.id, { toIncrementWatchedAd: 1 });
                }
              }
            }
          } catch (error) {
            console.log('video link parse error', error);
            return;
          }
        }
      } else {
        errorMessage(
          "Vous avez atteint la limite de visionnage pour aujourd'hui. Revenez demain !",
        );
        // close scratch bottom sheet
        setIsScratchSheetOpen(false)
      }
    }
  };

  const _stopVideo = async() => {
    Orientation.lockToPortrait();
    global.render = true
    setTimeout(async () => {
      setVideoModalVisible(false)
      setLoadingMakeParticipation(true)
      setScratchDone(false)

      const competitionParticipationsDetails = userReducer?.userProfile?.competitionParticipationsDetails;

      const participationIndex = competitionParticipationsDetails?.findIndex(
        competitionParticipation =>
          competitionParticipation?.scratch &&
          competitionParticipation?.scratch['@id']?.substring(11) == selectedScratch?.id,
      );

      if (participationIndex > -1) {
        //have participated
        const participation = competitionParticipationsDetails[participationIndex];

        let data = {
          scratchLimitPerDay: participation?.scratchLimitPerDay - 1,
          numberOfParticipations: participation?.numberOfParticipations + 1,
        };

        let spendCurrencyData = {};

        if (withCoins) {
          spendCurrencyData.scratchCoins = selectedScratch?.coins;
        } else {
          spendCurrencyData.scratchCredit = 1;
        }

        let res = await updateParticipation(data, participation?.id);

        if (res && res?.data) {
          // open scratch bottom sheet
          openScratchSheet(selectedScratch);

          await dispatch(updateCompetitionParticipationWithDataAction(
            res.data,
          ));
          await dispatch(fetchUserProfileAction());

        } else {
          console.log('could not update participation');
          // close scratch bottom sheet
          setIsScratchSheetOpen(false)
          _handleRefresh();
        }
      }
      setLoadingMakeParticipation(false)
    }, 670);
  };

  const _coinsParticipation = async (item, withCoins) => {
    Orientation.lockToPortrait();
    setVideoModalVisible(false)
    setLoadingMakeParticipation(true)

    const competitionParticipationsDetails = userReducer?.userProfile?.competitionParticipationsDetails;
    const participationIndex = competitionParticipationsDetails?.findIndex(
      competitionParticipation =>
        competitionParticipation?.scratch &&
        competitionParticipation?.scratch['@id']?.substring(11) == item?.id,
    );
    openScratchSheet(item);
    if (participationIndex > -1) {
      //have participated
      const participation = competitionParticipationsDetails[participationIndex];
      let data = {
        scratchLimitPerDay: participation?.scratchLimitPerDay - 1,
        numberOfParticipations: participation?.numberOfParticipations + 1,
      };
      let spendCurrencyData = {};
      spendCurrencyData.scratchCoins = item?.coins;
      let res = await spendUserCredits(spendCurrencyData, participation?.id);

      if (res?.error?.data['hydra:description'] == 'scratchLimitPerDay is reached') {
        errorMessage(LMSText(Lang.user.scratchParticipationLimitReached));
        // close scratch bottom sheet
        setIsScratchSheetOpen(false)
        setScratchDone(false)
      } else if (res && res?.data) {
        res = await updateParticipation(data, participation.id);
        if (res && res?.data) {
          await dispatch(updateCompetitionParticipationWithDataAction(res.data));
          await dispatch(fetchUserProfileAction());
        } else {
          console.log('could not update participation');
          // close scratch bottom sheet
          setIsScratchSheetOpen(false)
          setScratchDone(false)
        }
      } else {
        console.log('could not spend credits');
        // close scratch bottom sheet
        setIsScratchSheetOpen(false)
        setScratchDone(false)
      }
    } else {
      let res = await makeParticipation(
        item,
        true,
        withCoins,
      );
      if (res && res?.data) {
        await dispatch(updateCompetitionParticipationWithDataAction(res?.data));
        await dispatch(fetchUserProfileAction());
      }
    }
    setLoadingMakeParticipation(false)
  };

  const showsharePopup = async (sponsorCode) => {
    try {
      await Share.share({
        message: `Viens gagner de nombreux cadeaux sur EasyWin en jouant GRATUITEMENT à des jeux ! Télécharge l'app avec mon code de parrainage pour obtenir un bonus.\n➡️ Lien d'EasyWin : www.easy-win.io\n➡️ Mon code : ${sponsorCode}`,
      });
      let res = await updateUserWallet({
        scratchCredit: 1,
      });

      if (res && res?.data) {
        let lastShared = await AsyncStorage.getItem('LAST_SHARED');
        var arr = [];
        if (lastShared != null) {
          const parseData = JSON.parse(lastShared);
          arr = [...parseData];
        }

        const filterUId = arr.findIndex(obj => obj?.uId == userReducer?.userProfile['@id'] && obj?.sharedDate == moment(new Date()).format('DD-MM-YYYY'))

        if (filterUId == -1) {
          arr.push({
            uId: userReducer?.userProfile['@id'],
            sharedDate: moment(new Date()).format('DD-MM-YYYY'),
            Shared: true
          })
        }
        try {
          await AsyncStorage.setItem('LAST_SHARED', JSON.stringify(arr));
        } catch (err) {
          console.log(err);
        }
        dispatch(fetchUserProfileAction());
      }
    } catch (error) {
      // alert(error);
    }
  }

  const _postGameResult = async () => {
    try {
      if (gameResult === 'GAGNÉ') {
        const winObj = {
          lotId: scratchLot?.id,
          scratchId: selectedScratch?.id,
        };
        let res = await scratchParticipation(winObj);
      }
    } catch (error) { }

    await dispatch(fetchUserProfileAction());
    await _handleRefresh();
  };

  const _getLots = async competitionLots => {
    const userlots = await getUserLot();

    let selectedScratchLots = await fetchLots(competitionLots);
    selectedScratchLots = selectedScratchLots.filter(obj => obj?.quantity > 0)
    let gameResult = 'PERDU';
    let scratchLot = null;
    if (selectedScratchLots && selectedScratchLots?.length) {
      const winCandidates = _.filter(selectedScratchLots, item =>
        typeof item?.percent === 'number'
          ? item?.percent || 0
          : parseFloat(item?.percent || '0'),
      );

      const winPercentSum = _.reduce(
        winCandidates,
        (sum, lot) =>
          sum +
          (typeof lot?.percent === 'number'
            ? lot?.percent || 0
            : parseFloat(lot?.percent || '0')),
        0,
      );
      const losePercentSum = 100 - winPercentSum;
      const resultIndex = weighted_random([losePercentSum, winPercentSum]);
      if (resultIndex === 1) {
        const winIndex = weighted_random(
          _.map(selectedScratchLots, lot =>
            typeof lot?.percent === 'number'
              ? lot?.percent || 0
              : parseFloat(lot?.percent || '0'),
          ),
        );
        scratchLot = selectedScratchLots[winIndex];

        if (scratchLot) {
          const filterlot = userlots?.filter(obj => obj['@id'] == scratchLot['@id'] && obj.scratch == scratchLot?.scratch)
          if (filterlot.length < scratchLot?.qtyMaxByUser || scratchLot?.qtyMaxByUser == null) {
            gameResult = 'GAGNÉ';
          }
        }
      }
      setScratchLot(scratchLot)
      setSelectedScratchLots(selectedScratchLots)
      setLoadingLots(false)
      setGameResult(gameResult)
    }
    else {
      setScratchLot(null)
      setSelectedScratchLots(selectedScratchLots)
      setLoadingLots(false)
      setGameResult(gameResult)
    }
  };

  const openScratchSheet = async (selectedScratch) => {
    if (typeof selectedScratch?.statistic === 'string') {
      const statisticId = selectedScratch?.statistic.split('/')[2];
      updateStatistics(statisticId, {
        toIncrementImpressions: 1,
      });
    } else if (selectedScratch?.statistic?.id) {
      updateStatistics(selectedScratch?.statistic?.id, {
        toIncrementImpressions: 1,
      });
    }

    if (PLATFORM_IOS) {
      // open scratch bottom sheet
      setIsScratchSheetOpen(true);
    } else {
      if (showScratchBgImage) {
        setShowScratchBgImage(false)
      }
      // open scratch bottom sheet
      setIsScratchSheetOpen(true);

      setTimeout(() => {
        setShowScratchBgImage(true)
      }, 350);
    }
  };

  const renderItem = ({ item, index }) => {
    if (item?.competitionLots && item.competitionLots.length < 1) {
      return null;
    }
    return (
      <InViewPort
        onChange={isVisible => {
          if (isVisible && possibleView && possibleView > 0) {
            possibleView--;
            callViewUpdateAPI(item?.statistic);
          }
        }}>
        <TouchableWithoutFeedback
          onPress={() => { }}>
          <View
            style={{
              marginHorizontal: wp(5),
              marginTop: hp(2.5),
              borderRadius: wp(5),
              ...commonStyles.SHADOW,
            }}>
            <CustomImage
              source={
                item.imageUrl ? { uri: `${SERVER_BASE}${item?.imageUrl}` } : Images.bggifts
              }
              contentContainerStyle={{
                justifyContent: 'flex-end',
              }}
              style={{
                height: wp(45),
                width: wp(90),
                borderRadius: wp(5)
              }}>
              <View
                style={styles.scratchList}>
                {PLATFORM_IOS ? (
                  <BlurView
                    style={styles.blurView}
                    viewRef={viewRef}
                    blurType="dark"
                    blurAmount={30}
                    reducedTransparencyFallbackColor="transparent"
                  />
                ) : (
                  <View
                    style={styles.blurViewAndroid}
                  />
                )}
                <View
                  style={styles.endAtView}>
                  <Text
                    numberOfLines={1}
                    style={{ fontSize: 9, fontWeight: '400' }}>
                    Se termine le
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '400' }}>{`${moment(
                    item?.endAt,
                  ).format('DD/MM/yyyy')}`}</Text>
                </View>
                <View style={styles.coinsView}>
                  <View style={styles.coinSubView}>
                    <LinearGradient
                      colors={[Colors.White, '#DFDFDF']}
                      style={{ borderRadius: 50 }}>
                      <TouchableOpacity
                        onPress={async () => {
                          //COINS
                          setSelectedScratch(item)
                          setSelectedScratchLots([])
                          setScratchLot(null)
                          setLoadingLots(true)
                          setWithCoins(true)
                          setGameResult('')
                          setScratchDone(false)

                          if (userReducer?.userProfile?.wallet?.coin >= item?.coins) {
                            const competitionParticipationsDetails = userReducer?.userProfile?.competitionParticipationsDetails;
                            const participationIndex = competitionParticipationsDetails?.findIndex(
                              competitionParticipation =>
                                competitionParticipation?.scratch &&
                                competitionParticipation?.scratch['@id'].substring(11) == item?.id,
                            );
                            if (participationIndex > -1) {
                              //have participated
                              const participation = competitionParticipationsDetails[participationIndex];
                              if (participation?.scratchCoinsLimitPerDay == false) {
                                await _coinsParticipation(item, true);
                                await _getLots(item?.competitionLots);
                              } else {
                                errorMessage(LMSText(Lang.user.scratchParticipationCoinsLimitReached));
                              }
                            } else {
                              await _coinsParticipation(item, true);
                              await _getLots(item?.competitionLots);
                            }
                          } else {
                            errorMessage(LMSText(Lang.user.insufficientCoins));
                          }
                        }}>
                        <View style={{
                          padding: hp(0.7),
                          justifyContent: 'center',
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}>
                          <Text
                            style={{
                              color: Colors.Black,
                              fontWeight: '700',
                              fontSize: 12,
                              paddingRight: hp(0.5),
                            }}>
                            {item?.coins}
                          </Text>
                          <Image
                            source={Images.COIN_ICON}
                            style={styles.coinIcon}
                          />
                        </View>
                      </TouchableOpacity>
                    </LinearGradient>
                    <LinearGradient
                      colors={['#04249B', '#2B74E7']}
                      style={styles.LinearStyle}>
                      <TouchableOpacity
                        onPress={async () => {
                          setSelectedScratch(item)
                          setSelectedScratchLots([])
                          setScratchLot(null)
                          setLoadingLots(true)
                          setWithCoins(false)
                          setGameResult('')
                          setScratchDone(false)

                          const endDateTime = moment(new Date(item?.endAt)).format("YYYY-MM-DD HH:mm");
                          const curentDateTime = moment(new Date()).format("YYYY-MM-DD HH:mm")

                          if (endDateTime == curentDateTime) {
                            errorMessage(LMSText(Lang.user.scratchExpired));
                            // close scratch bottom sheet
                            setIsScratchSheetOpen(false)
                            _handleRefresh();
                          } else {
                            if (userReducer?.userProfile?.wallet?.scratchCredit > 0 || item?.type == 'sponsored') {
                              const competitionParticipationsDetails = userReducer?.userProfile?.competitionParticipationsDetails;

                              const participationIndex = competitionParticipationsDetails?.findIndex(
                                competitionParticipation =>
                                  competitionParticipation?.scratch &&
                                  competitionParticipation?.scratch['@id']?.substring(11) == item?.id,
                              );

                              if (participationIndex > -1) {
                                //have participated
                                const participation = competitionParticipationsDetails[participationIndex];
                                if (participation?.scratchLimitPerDay > 0) {
                                  _playVideo(item);
                                  _getLots(item?.competitionLots);
                                } else {
                                  errorMessage(LMSText(Lang.user.scratchParticipationLimitReached));
                                }
                              } else {
                                _playVideo(item);
                                _getLots(item?.competitionLots);
                              }
                            } else {
                              // close scratch bottom sheet
                              setIsScratchSheetOpen(false)
                              let lastShared = await AsyncStorage.getItem('LAST_SHARED');
                              if (lastShared != null) {
                                const parseData = JSON.parse(lastShared);
                                let filterid = parseData?.filter(obj => obj?.uId == userReducer?.userProfile['@id'] && obj?.sharedDate == moment(new Date()).format('DD-MM-YYYY'))
                                if (filterid?.length > 0 && filterid[0]?.sharedDate == moment(new Date()).format('DD-MM-YYYY')) {
                                  errorMessage(LMSText(Lang.user.insufficientScratchCredits));
                                } else {
                                  showPopup(
                                    <PopupBase
                                      title={
                                        `Oups ! Vous n'avez plus de crédits grattage...`
                                      }
                                      description={
                                        'Partager EasyWin pour obtenir 1 crédit supplémentaire'
                                      }
                                      buttonTitle={'PARTAGER'}
                                      imgSrc={Images.LIGHTNING_YELLOW_FILLED_ICON}
                                      onButtonPress={() => showsharePopup(userReducer?.userProfile?.sponsorCode)}
                                    />,
                                  );
                                }
                              } else {
                                showPopup(
                                  <PopupBase
                                    title={
                                      `Oups ! Vous n'avez plus de crédits grattage...`
                                    }
                                    description={
                                      'Partager EasyWin pour obtenir 1 crédit supplémentaire'
                                    }
                                    buttonTitle={'PARTAGER'}
                                    imgSrc={Images.LIGHTNING_YELLOW_FILLED_ICON}
                                    onButtonPress={() => showsharePopup(userReducer?.userProfile?.sponsorCode)}
                                  />,
                                );
                              }
                            }
                          }
                        }}>
                        <View
                          style={styles.jouerView}>
                          {item?.type === 'sponsored' && (<>
                            <Text
                              style={{
                                fontWeight: '700',
                                fontSize: 15,
                                paddingHorizontal: hp(0.2),
                              }}>
                              1
                            </Text>
                            <Image
                              source={Images.LIGHTNING_YELLOW_FILLED_ICON}
                              style={{ height: wp(3.5), width: wp(2.5) }}
                            /></>)}
                          <Text
                            style={{
                              fontWeight: '700',
                              fontSize: 15,
                              paddingHorizontal: hp(0.2),
                            }}>
                            JOUER
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                </View>
              </View>
            </CustomImage>
          </View>
        </TouchableWithoutFeedback>
        {!!(index % 3 == 2) && <BannerAd primaryIndex={index} scratch />}
      </InViewPort>
    );
  };

  const callViewUpdateAPI = async(statistic) => {
   
      if(global.render == false || global.render == undefined)
      {
      if (typeof statistic === 'string') {
        const id = statistic?.split('/')[2];
        updateStatistics(id, {
          toIncrementImpressionsList: 1,
        });
      } else if (statistic?.id) {
        updateStatistics(statistic?.id, {
          toIncrementImpressionsList: 1,
        });
      }
    }
  };

  const filterScratches = async (selectedTypeFilter) => {
    //selectedTypeFilter
    let searchTerm = '';
    if (selectedTypeFilter == 'all') {
      searchTerm = '';
    } else if (selectedTypeFilter == 'En attene') {
      searchTerm += `&startAt[before]=${moment()
        .subtract(7, 'd')
        .toISOString()}`;
    } else if (selectedTypeFilter == 'En cours') {
      searchTerm += `&endAt[strictly_after]=${moment().toISOString()}`;
    } else if (selectedTypeFilter == 'Terminé') {
      searchTerm += `&endAt[before]=${moment()
        .add(7, 'd')
        .toISOString()}`;
    }
    setLoading(true)
    await dispatch(fetchScratchesActions(searchTerm));
    setLoading(false)
  };

  const onViewCallBack = useCallback(({ viewableItems, changed }) => {
    changed.forEach(element => {
      if (element?.isViewable && element?.item && element?.item?.statistic) {
        if (isDoneFirstRender) {
          possibleView++;
          initViewCount++;
        }
        callViewUpdateAPI(element?.item?.statistic);
      }
    });
    isDoneFirstRender = false;
  }, []);

  return (
    <ScreenWrapper contentContainerStyle={commonStyles.screenWrapperContent}>
      <Header showScratchCredits />
      <View>
        <FlatList
          data={typeFilterOptions}
          renderItem={({ item, index }) => {
            return (
              <Pressable
                onPress={() => {
                  setSelectedTypeFilter(item?.value)
                  filterScratches(item?.value)
                }}>
                <View
                  style={[styles.filterOptionsView, {
                    backgroundColor: selectedTypeFilter == item?.value ? Colors.APP_COLOR : Colors.APP_GRAY_COLOR,
                  }]}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '700',
                      padding: hp(0.5),
                      paddingHorizontal: wp(2.5),
                    }}>
                    {item?.label}
                  </Text>
                </View>
              </Pressable>
            );
          }}
          keyExtractor={item => item?.label}
          showsHorizontalScrollIndicator={false}
          horizontal
        />
      </View>
      <View style={{ flex: 1 }}>
        <FlatList
          viewabilityConfig={viewConfigRef?.current}
          onViewableItemsChanged={onViewCallBack}
          data={scratchesData}
          extraData={scratchesData?.length}
          contentContainerStyle={{ paddingBottom: hp(7) }}
          renderItem={renderItem}
          keyExtractor={item => `scrkey-${item?.id}`}
          onEndReachedThreshold={0.5}
          onEndReached={async () => {
            if (nextPage) {
              await dispatch(fetchMoreConcoursActions());
            }
          }}
          showsHorizontalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => _handleRefresh()}
            />
          }
          ListEmptyComponent={
            <Text style={{ color: Colors.Black, alignSelf: 'center', margin: wp(5) }}>
              Aucun grattage disponible
            </Text>
          }
        />
      </View>
      {isScratchSheetOpen && (
        <ScratchSheet
          isScratchSheetOpen={isScratchSheetOpen}
          onClose={async() => {
            global.render = false
            setIsScratchSheetOpen(false)
          }}
          onOpenLotsSheet={() => setIsLotsSheetOpen(true)}
          onOpenRulesSheet={() => setIsRulesSheetOpen(true)}
          selectedScratch={selectedScratch}
          loadingLots={loadingLots}
          showScratchBgImage={showScratchBgImage}
          setRulesLink={setRulesLink}
          loadingMakeParticipation={loadingMakeParticipation}
          scratchDone={scratchDone}
          setScratchDone={setScratchDone}
          scratchid={scratchid}
          gameResult={gameResult}
          scratchLot={scratchLot}
          withCoins={withCoins}
          userReducer={userReducer}
          competitionParticipationsDetails={userReducer?.userProfile?.competitionParticipationsDetails}
          _postGameResult={() => _postGameResult()}
          _handleRefresh={() => _handleRefresh()}
          _playVideo={_playVideo}
          _getLots={_getLots}
          showsharePopup={showsharePopup}
          _coinsParticipation={_coinsParticipation}
        />
      )}
      {isLotsSheetOpen && (
        <LotsSheet
          isLotsSheetOpen={isLotsSheetOpen}
          onClose={() => setIsLotsSheetOpen(false)}
          selectedScratchLots={selectedScratchLots}
        />
      )}
      {isRulesSheetOpen && (
        <RulesSheet
          isRulesSheetOpen={isRulesSheetOpen}
          onClose={() => setIsRulesSheetOpen(false)}
          rulesLink={rulesLink}
        />
      )}
      {(videoModalVisible && videoId) && (
        <YTVideoPlayer
          videoModalVisible={videoModalVisible}
          videoClickLink={selectedScratch?.urlPub}
          selectedScratch={selectedScratch}
          videoId={videoId}
          _stopVideo={_stopVideo}
          onError={() => setVideoModalVisible(false)}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  filterOptionsView: {
    margin: wp(2),
    marginRight: 0,
    borderRadius: 40,
  },
  scratchList: {
    alignItems: 'center',
    flexDirection: 'row',
    height: hp(5.6),
    borderBottomLeftRadius: wp(5),
    borderBottomRightRadius: wp(5),
    overflow: 'hidden',
  },
  blurView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
  },
  blurViewAndroid: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  endAtView: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    paddingLeft: wp(2.5),
  },
  coinsView: {
    height: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  coinSubView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  LinearStyle: {
    marginHorizontal: wp(2.5),
    borderRadius: 50
  },
  jouerView: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: hp(0.7),
  },
  coinIcon: {
    width: wp(4.5),
    height: wp(4.5)
  },
});

export default withAppContext(GrattageScreen);
