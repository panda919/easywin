import React, { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, FlatList, Image, Linking, Pressable, RefreshControl, Share, StatusBar, StyleSheet, View } from 'react-native';
import Header from '../../Components/Header';
import ScreenWrapper from '../../Components/ScreenWrapper';
import commonStyles from '../../Styles/index';
import { useDispatch, useSelector } from 'react-redux';
import { hp, wp } from '../../Helper/ResponsiveScreen';
import { Colors } from '../../Styles/Colors';
import {
    errorMessage,
    fetchBannerAdsActions,
    fetchConcoursActions,
    fetchConcoursCategoriesAction,
    fetchMoreConcoursActions,
    fetchUserProfileAction,
    hidePopup,
    showPopup,
    updateCompetitionParticipationWithDataAction,
    updateLocalUserProfileWithDataAction,
} from '../../Actions';
import {
    cityFilterOptions,
    PLATFORM_IOS,
    SCREEN_HEIGHT,
    TAPJOY_CONFIG,
} from '../../Constants';
import { Images } from '../../Utils/images';
import ModalSelector from 'react-native-modal-selector';
import Text from '../../Components/Text';
import _ from 'lodash';
import {
    apiGet,
    apiPost,
    configureOneSignal,
    fetchCompetitionParticipation,
    fetchDailyRewardsList,
    fetchLots,
    getLot,
    increaseLuck,
    makeParticipation,
    spendUserCredits,
    updateParticipation,
    updateStatistics,
} from '../../Utils/functions';
import InViewPort from '../../Components/InViewPort';
import GameCard from '../../Components/Concours/GameCard';
import moment from 'moment';
import Orientation from 'react-native-orientation-locker';
import SplashScreen from 'react-native-splash-screen';
import ParticiperSheet from '../../Components/Concours/ParticiperSheet';
import RulesSheet from '../../Components/RulesSheet';
import LotsSheet from '../../Components/Concours/LotsSheet';
import ChancesSheet from '../../Components/Concours/ChancesSheet';
import { LMSText } from '../../Languages/LMSText';
import { withAppContext } from '../../Context/AppProvider';
import Loader from '../../Components/Loader';
import PopupBase from '../../Components/PopupBase';
import NormalClaimRewardButton from '../../Components/Concours/NormalClaimRewardButton';
import SocialsSheet from '../../Components/Concours/SocialsSheet';
import SurveySheet from '../../Components/Concours/SurveySheet';
import YTVideoPlayer from '../../Components/YTVideoPlayer';
import Lang from '../../Languages/LanguageStr';
import DailyRewardBar from '../../Components/DailyRewardBar';
import BannerAd from '../../Components/BannerAd';
import TextInputComponent from '../../Components/TextInputComponent';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useTapjoy } from 'react-native-tapjoy';

const typeFilterOptions = [
    { label: 'NOUVEAUX', value: 'En attene' },
    { label: 'EN COURS', value: 'En cours' },
    { label: 'BIENTÔT TERMINÉS', value: 'Terminé' },
];
const DAILY_REWARD_ANIMATION_DURATION = 300;

let possibleView = null;
let isDoneFirstRender = false;
let initViewCount = 0;

const ConcoursScreen = props => {
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
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const viewRef = useRef();
    const viewConfigRef = React.useRef({
        waitForInteraction: false,
        minimumViewTime: 500,
        viewAreaCoveragePercentThreshold: 85,
    });

    const userReducer = useSelector(state => state?.userReducer);
    const concours = useSelector(state => state?.concoursReducer?.concours);
    const nextPage = useSelector(state => state?.concoursReducer?.nextPage);
    const categories = useSelector(state => state?.concoursReducer?.categories);
    const cities = useSelector(state => state?.concoursReducer?.cities);

    const [isParticiperOpen, setIsParticiperOpen] = useState(false);
    const [isRulesSheetOpen, setIsRulesSheetOpen] = useState(false);
    const [isLotsSheetOpen, setIsLotsSheetOpen] = useState(false);
    const [isChancesSheetOpen, setIsChancesSheetOpen] = useState(false);
    const [isSurveySheetOpen, setIsSurveySheetOpen] = useState(false);
    const [isSocialsSheetOpen, setIsSocialsSheetOpen] = useState(false);

    const [loading, setLoading] = useState(false);
    const [selectedConcour, setSelectedConcour] = useState(false);
    const [selectedConcourLots, setSelectedConcourLots] = useState(false);
    const [loadingLots, setLoadingLots] = useState(false);
    const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(null);
    const [videoModalVisible, setVideoModalVisible] = useState(false);
    const [loadingMakeParticipation, setLoadingMakeParticipation] = useState(false);
    const [loadingChancesDetails, setLoadingChancesDetails] = useState(false);
    const [chancesDetails, setChancesDetails] = useState(false);
    const [inputDialogVisible, setInputDialogVisible] = useState(false);
    const [inputDialogText, setInputDialogText] = useState('');
    const [videoId, setVideoId] = useState(null);
    const [rewardList, setRewardList] = useState([]);
    const [dailyRewardTop, setDailyRewardTop] = useState(new Animated.Value(-(SCREEN_HEIGHT / 3)));
    const [selectedCityFilter, setSelectedCityFilter] = useState(null);
    const [sliderLink, setSliderLink] = useState(null);
    const [normalRewardClaim, setNormalRewardClaim] = useState(false);
    const [loadingSurvey, setLoadingSurvey] = useState(false);
    const [savingSurvey, setSavingSurvey] = useState(false);
    const [survey, setSurvey] = useState(null);
    const [istappedItem, setIstappedItem] = useState(false);
    const [rulesLink, setRulesLink] = useState(null);
    const [isMiserClick, setIsMiserClick] = useState(false);

    const categoryOptions = _.concat(categories, {
        label: 'TOUTES LES CATÉGORIES',
        id: 'reset',
        component: <Text style={{ color: 'red', textAlign: 'center' }}>TOUTES LES CATÉGORIES</Text>,
    });

    const cityOptions = _.concat(cities, {
        label: 'TOUTES LES VILLES',
        id: 'reset',
        component: <Text style={{ color: 'red', textAlign: 'center' }}>TOUTES LES VILLES</Text>,
    });

    useEffect(() => {
        if (isFocused) {
            BackHandler.addEventListener("hardwareBackPress", handleBackButtonClick);
        }
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", handleBackButtonClick);
        }
    }, [isFocused])

    useEffect(() => {
        const fetchData = async () => {
            Orientation.lockToPortrait();
            SplashScreen.hide();
            configureOneSignal();
            if (!PLATFORM_IOS) {
                setTimeout(() => {
                    StatusBar.setBarStyle('dark-content');
                }, 250);
            }

            setLoading(true);
            // let res = await apiPost('/users/post_app_login', {});
            // if (res && res?.data) {
            //     await dispatch(updateLocalUserProfileWithDataAction(res.data));
            // }
            await dispatch(fetchBannerAdsActions());
            await dispatch(fetchConcoursActions());
            await dispatch(fetchConcoursCategoriesAction());
            setLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        let didBlurSubscription = props?.navigation?.addListener('blur', () => {
            possibleView = null;
            isDoneFirstRender = false;
        },
        );
        let didFocusSubscription = props?.navigation?.addListener('focus', () => {
            possibleView = initViewCount;
            isDoneFirstRender = true;
        });

        return () => {
            didFocusSubscription?.remove();
            didBlurSubscription?.remove();
        };
    }, [props?.navigation])

    // Show modal when the user returns to this screen
    useEffect(() => {
        if (props?.route?.params?.type === 'Social') {
            Orientation.lockToPortrait();
            setIsChancesSheetOpen(true);
            setIsSocialsSheetOpen(true);
        }
    }, [props?.route?.params?.type]);

    useEffect(() => {
        //********************** popup prize **************/
        const renderPopupPrize = async () => {
            Orientation.lockToPortrait();
            let res = await apiPost('/users/post_app_login', {});
            if (res && res?.data) {
                await dispatch(updateLocalUserProfileWithDataAction(res.data));
            }
            if (userReducer?.userProfile?.competitionParticipationsDetails?.length) {
                const competitionParticipationsDetails = userReducer?.userProfile?.competitionParticipationsDetails;

                const wonCompetitionIndex = competitionParticipationsDetails?.findIndex(
                    competitionParticipation => {
                        if (
                            competitionParticipation?.competition &&
                            competitionParticipation?.competition?.winner &&
                            competitionParticipation?.competition?.winner ==
                            userReducer?.userProfile['@id'] &&
                            competitionParticipation?.displayedWinnerPopup == false
                        ) {
                            return true;
                        }
                        return false;
                    },
                );
                if (wonCompetitionIndex > -1) {
                    const wonCompetitionParticipation =
                        competitionParticipationsDetails[wonCompetitionIndex];
                    const competition = wonCompetitionParticipation?.competition['@id'];
                    let wonLotName = null;
                    const challangeRes = await apiGet(`${competition}/?filterEnded=false`);
                    if (challangeRes && challangeRes?.data) {
                        const challange = challangeRes?.data;
                        if (
                            challange?.competitionLots &&
                            challange?.competitionLots?.length
                        ) {
                            let wonLot = await getLot(challange?.competitionLots[0]);
                            if (wonLot && wonLot?.name) {
                                wonLotName = wonLot?.name;
                                showPopup(
                                    <PopupBase
                                        title={'Félicitations !'}
                                        buttonTitle={'PARTAGER'}
                                        imgSrc={Images.GIFT_PACK}
                                        onButtonPress={async () => {
                                            await Share.share({
                                                message: `J'ai gagné un(e) [nom du lot] sur EasyWin ! Viens gagner de nombreux cadeaux sur leur app en jouant GRATUITEMENT à des concours, grattages et mini jeux ! Télécharge EasyWin avec mon code de parrainage pour obtenir un bonus.\n➡️ Lien d'EasyWin : www.easy-win.io\n➡️ Mon code : ${userReducer?.userProfile?.sponsorCode}`,
                                            });
                                            let res = await updateParticipation(
                                                { displayedWinnerPopup: true },
                                                wonCompetitionParticipation?.id,
                                            );
                                            if (res?.data) {
                                                dispatch(
                                                    updateCompetitionParticipationWithDataAction(
                                                        res?.data,
                                                    ),
                                                );
                                            }
                                            if (userReducer?.userProfile?.dailyRewards?.length) {
                                                showDailyRewards();
                                            }
                                        }}
                                        onClose={async () => {
                                            let res = await updateParticipation(
                                                { displayedWinnerPopup: true },
                                                wonCompetitionParticipation?.id,
                                            );
                                            if (res?.data) {
                                                dispatch(
                                                    updateCompetitionParticipationWithDataAction(
                                                        res?.data,
                                                    ),
                                                );
                                            }
                                            if (userReducer?.userProfile?.dailyRewards?.length) {
                                                showDailyRewards();
                                            }
                                        }}>
                                        <Text
                                            style={{
                                                color: Colors.Black,
                                                fontSize: 14,
                                                fontWeight: '700',
                                                textAlign: 'center',
                                            }}>{`Vous avez gagné ${wonLot?.name}`}</Text>
                                        <Text
                                            style={{
                                                color: Colors.Black,
                                                fontSize: 14,
                                                fontWeight: '400',
                                                fontFamily: 'Montserrat-Medium',
                                                textAlign: 'center',
                                            }}>
                                            Partagez la bonne nouvelle avec vos amis
                                        </Text>
                                    </PopupBase>,
                                );
                            }
                        } else {
                            if (userReducer?.userProfile?.dailyRewards?.length) {
                                showDailyRewards();
                            }
                        }
                    } else {
                        if (userReducer?.userProfile?.dailyRewards?.length) {
                            showDailyRewards();
                        }
                    }
                } else {
                    if (userReducer?.userProfile?.dailyRewards?.length) {
                        showDailyRewards();
                    }
                }
            } else {
                if (userReducer?.userProfile?.dailyRewards?.length) {
                    showDailyRewards();
                }
            }
        };

        if (navigation) {
            renderPopupPrize();
        }
    }, [navigation, userReducer?.userProfile?.dailyRewards?.length]);

    useEffect(() => {
        const listeners = {};

        tapjoyEvents.forEach(tapjoyEvent => {
            listeners[tapjoyEvent] = listenToEvent(tapjoyEvent, evt => {
                if (global.tapjoyType == 'concours') {
                    console.log('tapjoy type....concours', selectedConcour?.hook);
                    if (selectedConcour && selectedConcour?.hook) {
                        if (selectedConcour?.hook == evt.placementName) {
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
    }, [listenToEvent, tapjoyEvents, selectedConcour?.hook]);

    useEffect(() => {
        const filterData = async () => {
            Orientation.lockToPortrait();
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
                searchTerm += `&endAt[before]=${moment().add(7, 'd').toISOString()}`;
            }
            //selectedCategoryFilter
            if (selectedCategoryFilter) {
                searchTerm += `&category.name=${selectedCategoryFilter}`;
            }
            if (selectedCityFilter) {
                if (selectedCategoryFilter == 'myCity') {
                    //TODO:ask dmitry to send full city object in profile
                } else {
                    searchTerm += `&city.name=${selectedCityFilter}`;
                }
            }
            setLoading(true);
            await dispatch(fetchConcoursActions(searchTerm));
            setLoading(false);
        };
        filterData();
    }, [selectedTypeFilter, selectedCategoryFilter, selectedCityFilter]);

    useEffect(() => {
        // utiliser popup miser button
        const renderUtiliser = async () => {
            if (inputDialogText > 0) {
                let competitionParticipationsDetail =
                    userReducer?.userProfile?.competitionParticipationsDetails[
                    userReducer?.userProfile?.competitionParticipationsDetails?.findIndex(
                        competitionParticipation =>
                            competitionParticipation?.competition &&
                            competitionParticipation?.competition['@id'] ==
                            `/competitions/${selectedConcour?.id}`,
                    )
                    ];

                const data = {
                    ticket: inputDialogText,
                };
                setLoadingChancesDetails(true);

                let luckIncreased = await increaseLuck(
                    data,
                    competitionParticipationsDetail?.id,
                );

                if (luckIncreased && luckIncreased?.data) {
                    _updatecompetitionParticipationsDetail({
                        ticketUsed: true,
                    });
                    await dispatch(fetchUserProfileAction());
                }
                setLoadingChancesDetails(false);
                setInputDialogText(0);
                hidePopup();
            } else {
                errorMessage(LMSText(Lang.Concours.enterTickets));
            }
            setIsMiserClick(false);
        };

        if (isMiserClick) {
            renderUtiliser();
        }
    }, [isMiserClick]);

    const handleBackButtonClick = () => {
        BackHandler.exitApp()
        return true;
    }

    const _playVideo = async selectedConcourData => {
        const { video, statistic, hook } = selectedConcourData;
        if (hook) {
            global.tapjoyType = 'concours';
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
                    await addTapjoyPlacement(hook);
                    try {
                        let resreq = await requestTapjoyPlacementContent(hook);
                        // tapjoy placement content request was successful
                        if (resreq) {
                            setTimeout(async () => {
                                try {
                                    await showTapjoyPlacement(hook);
                                    if (statistic && statistic?.id) {
                                        updateStatistics(statistic?.id, {
                                            toIncrementWatchedTapJoyAd: 1,
                                        });
                                    }
                                } catch (e) {
                                    console.log('e.....', e)
                                    hidePopup();
                                    return true;
                                }
                            }, 2500);
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
                    setVideoId(finalVideoId);
                    setVideoModalVisible(true);
                    if (statistic && statistic?.id) {
                        updateStatistics(statistic?.id, { toIncrementWatchedAd: 1 });
                    }
                }
            } catch (error) {
                return;
            }
        }
    };

    const _stopVideo = async () => {
        Orientation.lockToPortrait();
        global.gamerender = true
        if (selectedConcour?.id === false) {
            if (selectedConcour?.rewardId) {
                claimReward(selectedConcour?.rewardId, 'true');
                hidePopup();
            }
            // participer sheet close
            setIsParticiperOpen(false);
        } else {
            const competitionParticipationsDetails =
                userReducer?.userProfile?.competitionParticipationsDetails;
            const haveParticipated =
                competitionParticipationsDetails?.findIndex(
                    competitionParticipation =>
                        competitionParticipation?.competition &&
                        competitionParticipation?.competition['@id'].substring(14) ==
                        selectedConcour?.id,
                ) > -1
                    ? true
                    : false;

            if (!haveParticipated) {
                // participer sheet open
                setIsParticiperOpen(true);
            }
        }

        if (chancesDetails && selectedConcour?.id) {
            let videoCount = 0;
            if (chancesDetails?.video) {
                videoCount = chancesDetails?.video;
            }
            videoCount = videoCount + 1;
            setTimeout(async () => {
                setVideoModalVisible(false);
                setLoadingChancesDetails(true);
                const competitionParticipationsDetails = userReducer?.userProfile?.competitionParticipationsDetails;
                let competitionParticipationsDetail =
                    competitionParticipationsDetails[
                    competitionParticipationsDetails?.findIndex(
                        competitionParticipation =>
                            competitionParticipation?.competition &&
                            competitionParticipation?.competition['@id'] ==
                            `/competitions/${selectedConcour?.id}`,
                    )
                    ];
                const data = { challengeCredit: 1 };
                setLoadingChancesDetails(true);
                setInputDialogVisible(false);
                let res = await spendUserCredits(
                    data,
                    competitionParticipationsDetail?.id,
                );

                console.log('spendUserCredits...', res);

                if (res && res?.data) {
                    _updatecompetitionParticipationsDetail({ video: videoCount });
                    await dispatch(fetchUserProfileAction());
                } else {
                    errorMessage(
                        "Vous avez atteint la limite de visionnage pour aujourd'hui. Revenez demain !",
                    );
                    setLoadingChancesDetails(false);
                }
            }, 750);
        } else if (selectedConcour && selectedConcour?.id) {
            setTimeout(async () => {
                setVideoModalVisible(false);
                setLoadingMakeParticipation(true);
                let res = await makeParticipation(selectedConcour);

                if (res && res?.data) {
                    await dispatch(fetchUserProfileAction());
                    await dispatch(
                        updateCompetitionParticipationWithDataAction(res.data),
                    );
                }
                setLoadingMakeParticipation(false);
            }, 750);
        } else {
            setTimeout(() => {
                //daily reward
                setVideoModalVisible(false);
            }, 750);
        }
        if (!PLATFORM_IOS) {
            setTimeout(() => {
                StatusBar.setBarStyle('dark-content');
            }, 250);
        }
        global.tapjoyType = '';
    };

    const claimReward = async (dailyRewardId, double) => {
        await apiPost(`/users/post_daily_reward/${dailyRewardId}`, {
            doubleReward: double,
        });
        await dispatch(fetchUserProfileAction());
    };

    const _updatecompetitionParticipationsDetail = async dataToUpdate => {
        const competitionParticipationsDetails = userReducer?.userProfile?.competitionParticipationsDetails;
        let data = {
            ...chancesDetails,
            ...dataToUpdate,
        };
        setLoadingChancesDetails(true);
        let chancesDetailsRes = await apiPost(
            `/user_competition_records/${selectedConcour?.id}`,
            data,
        );
        if (chancesDetailsRes && chancesDetailsRes?.data) {
            setChancesDetails(chancesDetailsRes?.data);
            let competitionParticipationsDetail =
                competitionParticipationsDetails[
                competitionParticipationsDetails?.findIndex(
                    competitionParticipation =>
                        competitionParticipation?.competition &&
                        competitionParticipation?.competition['@id'] ==
                        `/competitions/${selectedConcour?.id}`,
                )
                ];
            let competitionParticipationsData = await fetchCompetitionParticipation(
                competitionParticipationsDetail['@id'],
            );
            if (competitionParticipationsData) {
                await dispatch(
                    updateCompetitionParticipationWithDataAction(
                        competitionParticipationsData,
                    ),
                );
            }
        }
        setLoadingChancesDetails(false);
    };

    const showDailyRewards = async () => {
        let rewardList = [];
        let dailyRewardsList = await fetchDailyRewardsList();

        if (dailyRewardsList) {
            rewardList = dailyRewardsList.map((reward, index) => {
                if (userReducer?.userProfile?.consecutiveLogin - 1 >= index) {
                    return { ...reward, won: true };
                } else if (userReducer?.userProfile?.consecutiveLogin == index) {
                    return { ...reward, today: true };
                } else {
                    return reward;
                }
            });
        }
        setRewardList(rewardList);
        Animated.timing(dailyRewardTop, {
            toValue: 0,
            duration: DAILY_REWARD_ANIMATION_DURATION,
            useNativeDriver: false,
        }).start();
    };

    const showDailyRewardPopup = async reward => {
        let icon = Images.GIFT_PACK;
        let text = '';
        const { challengeCredits, scratchCredits, tickets, coins } = reward;
        if (coins) {
            text = text + '+ ' + coins;
            icon = Images.COINS_ICON;
        }
        if (tickets) {
            text = text + '+ ' + tickets;
            icon = Images.MONEY_ICON;
        }
        if (challengeCredits) {
            text = text + '+ ' + challengeCredits;
            icon = Images.LIGHTNING_BLUE_FILLED_ICON;
        }
        if (scratchCredits) {
            text = text + '+ ' + scratchCredits;
            icon = Images.LIGHTNING_YELLOW_FILLED_ICON;
        }
        if (
            (coins && tickets) ||
            (coins && scratchCredits) ||
            (coins && challengeCredits) ||
            (tickets && scratchCredits) ||
            (tickets && challengeCredits) ||
            (scratchCredits && challengeCredits)
        ) {
            icon = Images.GIFT_PACK;
        }
        Animated.timing(dailyRewardTop, {
            toValue: -(SCREEN_HEIGHT / 2),
            duration: DAILY_REWARD_ANIMATION_DURATION,
            useNativeDriver: false,
        }).start();
        showPopup(
            <PopupBase
                imgSrc={icon}
                onClose={() => {
                    Animated.timing(dailyRewardTop, {
                        toValue: -(SCREEN_HEIGHT / 2),
                        duration: DAILY_REWARD_ANIMATION_DURATION,
                        useNativeDriver: false,
                    }).start();
                }}>
                <Text style={{ color: Colors.Black }}>Récompense quotidienne</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <Text
                        style={{
                            color: Colors.Black,
                            fontWeight: '700',
                            fontSize: 36,
                            textAlign: 'center',
                        }}>
                        {text}
                    </Text>
                    <Image
                        source={icon}
                        style={{ width: wp(10), height: wp(10), marginHorizontal: wp(2) }}
                    />
                </View>
                <NormalClaimRewardButton
                    onPress={() => {
                        claimReward(reward?.id, 'false');
                        Animated.timing(dailyRewardTop, {
                            toValue: -(SCREEN_HEIGHT / 2),
                            duration: DAILY_REWARD_ANIMATION_DURATION,
                            useNativeDriver: false,
                        }).start();
                    }}
                    DoublerClick={() => {
                        //play video
                        if (reward?.videoLink) {
                            setSelectedConcour({
                                id: false,
                                rewardId: reward?.id,
                                video: reward?.videoLink,
                                hook: reward?.tapjoyId,
                            });
                            _playVideo({
                                id: false,
                                rewardId: reward?.id,
                                video: reward?.videoLink,
                                hook: reward?.tapjoyId,   // '4178e68f-0d1a-43c8-b275-bd1939c1ba98',
                            });
                        }
                        Animated.timing(dailyRewardTop, {
                            toValue: -(SCREEN_HEIGHT / 2),
                            duration: DAILY_REWARD_ANIMATION_DURATION,
                            useNativeDriver: false,
                        }).start();
                    }}
                />
            </PopupBase>,
        );
    };

    const renderItem = ({ item, index }) => {
        const challengeCredit = userReducer?.userProfile?.wallet?.challengeCredit;
        return (
            <>
                <InViewPort
                    onChange={isVisible => {
                        if (isVisible && possibleView && possibleView > 0) {
                            possibleView--;
                            callViewUpdateAPI(item?.statistic);
                        }
                    }}>
                    <GameCard
                        item={item}
                        viewRef={viewRef}
                        userProfile={userReducer?.userProfile}
                        onPressItem={async () => {
                            setSelectedConcour(item);
                            setSelectedConcourLots([]);
                            setChancesDetails(false);
                            setIstappedItem(true);
                            // participer sheet open
                            setIsParticiperOpen(true);
                            const { statistic } = item;
                            if (statistic && statistic?.id) {
                                await updateStatistics(statistic?.id, { toIncrementImpressions: 1 });
                            }
                            if (item?.competitionLots && item?.competitionLots?.length > 0) {
                                setLoadingLots(true);
                                setSliderLink(null);
                                const selectedConcourLots = await fetchLots(
                                    item?.competitionLots,
                                );
                                if (selectedConcourLots && selectedConcourLots?.length) {
                                    selectedConcourLots.forEach(lot => {
                                        if (lot?.lotCondition == 'gagnant' && lot?.link) {
                                            setSliderLink(lot?.link);
                                        }
                                    });
                                }
                                setSelectedConcourLots(selectedConcourLots);
                                setLoadingLots(false);
                            }
                        }}
                        onPressChance={async () => {
                            if (moment(item?.endAt).isSameOrBefore(moment())) {
                                return;
                            }
                            setSelectedConcour(item);
                            setChancesDetails(false);
                            setLoadingChancesDetails(true);
                            setIsChancesSheetOpen(true);
                            let chancesDetailsRes = await apiGet(
                                `/user_competition_records/${item?.id}`,
                            );

                            if (chancesDetailsRes && chancesDetailsRes?.data) {
                                setChancesDetails(chancesDetailsRes?.data);
                                setLoadingChancesDetails(false);
                            } else {
                                setIsChancesSheetOpen(false);
                                setLoadingChancesDetails(false);
                                setChancesDetails(false);
                            }
                        }}
                        onPressParticiper={async () => {
                            if (moment(item?.endAt).isSameOrBefore(moment())) {
                                return;
                            }
                            setSelectedConcour(item);
                            setSelectedConcourLots([]);
                            setChancesDetails(false);
                            const { statistic } = item;
                            console.log('click stat', item);
                            if (statistic && statistic?.id) {
                                await updateStatistics(statistic?.id, { toIncrementImpressions: 1 });
                            }
                            if (challengeCredit > 0 || item?.type == 'sponsored') {
                                _playVideo(item);

                                // const { statistic } = item
                                // console.log('statistic?.id=====', statistic?.id)
                                // if (statistic && statistic.id) {
                                //     const res = await updateStatistics(statistic.id, { toIncrementImpressions: 1 })
                                //     console.log('res====statistic?.id', res)
                                // }

                                if (
                                    item?.competitionLots &&
                                    item?.competitionLots?.length > 0
                                ) {
                                    setLoadingLots(true);
                                    const selectedConcourLots = await fetchLots(
                                        item?.competitionLots,
                                    );
                                    setSelectedConcourLots(selectedConcourLots);
                                    setLoadingLots(false);
                                }
                            } else {
                                errorMessage(LMSText(Lang.user.insufficientChallangeCredits));
                            }
                        }}
                    />

                    {!!(index % 3 == 2) && <BannerAd primaryIndex={index} />}
                </InViewPort>
            </>
        );
    };

    const onViewCallBack = React.useCallback(({ viewableItems, changed }) => {
        changed.forEach(element => {
            if (
                element?.isViewable &&
                element?.item &&
                element?.item?.statistic &&
                element?.item?.statistic?.id
            ) {
                if (isDoneFirstRender) {
                    possibleView++;
                    initViewCount++;
                }

                callViewUpdateAPI(element?.item?.statistic);
            }
        });
        isDoneFirstRender = false;
    }, []);

    const callViewUpdateAPI = async (statistic) => {
        if(global.gamerender == false || global.gamerender == undefined) {
            updateStatistics(statistic?.id, {
                toIncrementImpressionsList: 1,
            });
        }
    };

    const _handleRefresh = async () => {
        setLoading(true);
        await dispatch(fetchBannerAdsActions());
        await dispatch(fetchConcoursActions());
        await dispatch(fetchConcoursCategoriesAction());
        setLoading(false);
    };

    const _onReTweetPress = async URL => {
        const competitionParticipationsDetails = userReducer?.userProfile?.competitionParticipationsDetails;
        try {
            const openURL = await Linking.openURL(URL);
            if (openURL) {
                let competitionParticipationsDetail =
                    competitionParticipationsDetails[
                    competitionParticipationsDetails?.findIndex(
                        competitionParticipation =>
                            competitionParticipation?.competition &&
                            competitionParticipation?.competition['@id'] ==
                            `/competitions/${selectedConcour?.id}`,
                    )
                    ];

                const { statistic } = selectedConcour;
                if (statistic && statistic?.id) {
                    updateStatistics(statistic?.id, { toIncrementRt: 1 });
                }
                _updatecompetitionParticipationsDetail({ reTweet: true });
            }
        } catch (err) {
            console.log('cannot open URL', err);
        }
    };

    const _onFollowPress = async ({ socialType, URL, follower_name }) => {
        const competitionParticipationsDetails =
            userReducer?.userProfile?.competitionParticipationsDetails;
        try {
            const openURL = await Linking.openURL(URL);
            if (openURL) {
                // socials sheet close
                setIsSocialsSheetOpen(false);
                let competitionParticipationsDetail =
                    competitionParticipationsDetails[
                    competitionParticipationsDetails?.findIndex(
                        competitionParticipation =>
                            competitionParticipation?.competition &&
                            competitionParticipation?.competition['@id'] ==
                            `/competitions/${selectedConcour.id}`,
                    )
                    ];

                let res = await apiPost(
                    `/post_follow_social_account/${competitionParticipationsDetail?.id}`,
                    { [`follow${socialType}`]: true, follower_name },
                );
                const { statistic } = selectedConcour;
                if (statistic && statistic?.id) {
                    switch (socialType) {
                        case 'Facebook':
                            updateStatistics(statistic?.id, { toIncrementFbFollow: 1 });
                            break;
                        case 'Instagram':
                            updateStatistics(statistic?.id, { toIncrementInstaFollow: 1 });
                            break;
                        case 'Twitter':
                            updateStatistics(statistic?.id, { toIncrementTwitterFollow: 1 });
                            break;
                        case 'Youtube':
                            updateStatistics(statistic?.id, { toIncrementYtFollow: 1 });
                            break;
                        case 'Discord':
                            updateStatistics(statistic?.id, { toIncrementDiscordFollow: 1 });
                            break;

                        default:
                            break;
                    }
                }
                if (res && res?.data) {
                    _updatecompetitionParticipationsDetail({ clickOnLink: true });
                }
            }
        } catch (err) {
            console.log('cannot open URL', err);
        }
    };

    const onUtiliserPress = () => {
        if (userReducer?.userProfile?.wallet?.ticket > 0) {
            showPopup(
                <PopupBase
                    title={'UTILISEZ VOS BILLETS'}
                    description={
                        '1 billet utilisé = 1 chance supplémentaire'
                    }
                    buttonTitle={'VALIDER'}
                    descriptionStyle={{ marginTop: 0 }}
                    imgSrc={Images.MONEY_ICON}
                    noAutoHide
                    onButtonPress={async () => {
                        setIsMiserClick(true);
                    }}
                    onClose={() => {
                        setInputDialogText('');
                    }}>
                    <View>
                        <Text
                            style={{
                                marginBottom: hp(2),
                                color: Colors.RED,
                                textAlign: 'center',
                                fontSize: 14,
                                fontWeight: '700',
                            }}>
                            {`${userReducer?.userProfile?.wallet?.ticket} billets disponibles`}
                        </Text>
                        <TextInputComponent
                            userReducer={userReducer}
                            onChange={text => {
                                setInputDialogText(text);
                            }}
                        />
                    </View>
                </PopupBase>,
            );
        } else {
            errorMessage(LMSText(Lang.user.insufficientTickets));
        }
    };

    return (
        <>
            <StatusBar
                barStyle={'dark-content'}
                translucent={true}
                backgroundColor="transparent"
            />
            <ScreenWrapper contentContainerStyle={commonStyles.screenWrapperContent}>
                <Header showChallangeCredits />
                <View>
                    <FlatList
                        data={typeFilterOptions}
                        renderItem={({ item, index }) => {
                            return (
                                <Pressable
                                    onPress={() => {
                                        setSelectedTypeFilter(item?.value);
                                    }}>
                                    <View
                                        style={{
                                            margin: wp(2),
                                            marginRight: 0,
                                            borderRadius: wp(5),
                                            backgroundColor:
                                                selectedTypeFilter == item.value
                                                    ? Colors.APP_COLOR
                                                    : Colors.APP_GRAY_COLOR,
                                        }}>
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                fontWeight: '700',
                                                padding: wp(1),
                                                paddingHorizontal: wp(3),
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
                <View style={styles.modalRowView}>
                    <View style={styles.modalSelectorView}>
                        <ModalSelector
                            data={categoryOptions}
                            keyExtractor={item => item.id}
                            labelExtractor={item => item.label}
                            onChange={({ value }) => {
                                setSelectedCategoryFilter(value === 'reset' ? null : value);
                            }}
                            initValue={selectedCategoryFilter || 'CATÉGORIES'}
                            selectStyle={styles.select}
                            initValueTextStyle={styles.initValueText}
                            selectTextStyle={styles.selectText}
                            cancelText={'RETOUR'}
                        />

                        <Image
                            style={styles.chevronIcon}
                            source={Images.CHEVRON_DOWN_ICON}
                        />
                    </View>
                    { cities?.length > 0 && <View style={styles.modalSelectorView}>
                        <ModalSelector
                            data={cityOptions}
                            keyExtractor={(item, index) => item.label + index}
                            labelExtractor={item => item.label}
                            onChange={({ value }) => {
                                setSelectedCityFilter(value === 'reset' ? null : value);
                            }}
                            initValue={selectedCityFilter || 'VILLES'}
                            selectStyle={styles.select}
                            initValueTextStyle={styles.initValueText}
                            selectTextStyle={styles.selectText}
                            cancelText={'ANNULER'}
                        />
                        <Image
                            style={styles.chevronIcon}
                            source={Images.CHEVRON_DOWN_ICON}
                        />
                    </View> }
                </View>
                <View style={{ flex: 1, borderWidth: 0 }}>
                    <FlatList
                        viewabilityConfig={viewConfigRef?.current}
                        onViewableItemsChanged={onViewCallBack}
                        data={concours}
                        contentContainerStyle={{ paddingBottom: hp(1) }}
                        showsVerticalScrollIndicator={false}
                        renderItem={renderItem}
                        keyExtractor={item => `conkey-${item.id}`}
                        showsHorizontalScrollIndicator={false}
                        onEndReachedThreshold={0.5}
                        onEndReached={async () => {
                            if (nextPage) {
                                await dispatch(fetchMoreConcoursActions());
                            }
                        }}
                        refreshControl={
                            <RefreshControl refreshing={loading} onRefresh={_handleRefresh} />
                        }
                        ListEmptyComponent={
                            <Text
                                style={{ color: Colors.Black, alignSelf: 'center', margin: 20 }}>
                                Aucun concours disponible
                            </Text>
                        }
                    />
                </View>
                {isParticiperOpen && (
                    <ParticiperSheet
                        userProfile={userReducer?.userProfile}
                        selectedConcour={selectedConcour}
                        isParticiperOpen={isParticiperOpen}
                        onClose={async () => {
                            global.gamerender = false
                            setIsParticiperOpen(false)
                        }}
                        setRulesLink={setRulesLink}
                        onOpenRulesSheet={() => setIsRulesSheetOpen(true)}
                        onOpenLotsSheet={() => setIsLotsSheetOpen(true)}
                        onOpenChancesSheet={() => setIsChancesSheetOpen(true)}
                        onCloseChancesSheet={() => setIsChancesSheetOpen(false)}
                        selectedConcourLots={selectedConcourLots}
                        loadingLots={loadingLots}
                        loadingMakeParticipation={loadingMakeParticipation}
                        sliderLink={sliderLink}
                        setLoadingChancesDetails={setLoadingChancesDetails}
                        setChancesDetails={setChancesDetails}
                        _playVideo={_playVideo}
                    />
                )}
                {isChancesSheetOpen && (
                    <ChancesSheet
                        isChancesSheetOpen={isChancesSheetOpen}
                        onClose={() => setIsChancesSheetOpen(false)}
                        userProfile={userReducer?.userProfile}
                        selectedConcour={selectedConcour}
                        loadingChancesDetails={loadingChancesDetails}
                        chancesDetails={chancesDetails}
                        _updatecompetitionParticipationsDetail={
                            _updatecompetitionParticipationsDetail
                        }
                        onOpenSurveySheet={() => setIsSurveySheetOpen(true)}
                        onCloseSurveySheet={() => setIsSurveySheetOpen(false)}
                        setLoadingSurvey={setLoadingSurvey}
                        setSurvey={setSurvey}
                        _playVideo={_playVideo}
                        onOpenSocialsSheet={() => setIsSocialsSheetOpen(true)}
                        _onReTweetPress={_onReTweetPress}
                        onUtiliserPress={onUtiliserPress}
                    />
                )}
                {isLotsSheetOpen && (
                    <LotsSheet
                        isLotsSheetOpen={isLotsSheetOpen}
                        onClose={() => setIsLotsSheetOpen(false)}
                        selectedConcourLots={selectedConcourLots}
                        selectedConcour={selectedConcour}
                    />
                )}
                {isSocialsSheetOpen && (
                    <SocialsSheet
                        isSocialsSheetOpen={isSocialsSheetOpen}
                        onClose={() => setIsSocialsSheetOpen(false)}
                        onChancesSheetClose={() => setIsChancesSheetOpen(false)}
                        userProfile={userReducer?.userProfile}
                        selectedConcour={selectedConcour}
                        _onFollowPress={_onFollowPress}
                    />
                )}
                {isSurveySheetOpen && (
                    <SurveySheet
                        isSurveySheetOpen={isSurveySheetOpen}
                        onClose={() => setIsSurveySheetOpen(false)}
                        loadingSurvey={loadingSurvey}
                        savingSurvey={savingSurvey}
                        survey={survey}
                        setSurvey={setSurvey}
                        setSavingSurvey={setSavingSurvey}
                        _updatecompetitionParticipationsDetail={
                            _updatecompetitionParticipationsDetail
                        }
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
                        concour={selectedConcour}
                        videoClickLink={selectedConcour?.urlPub}
                        selectedScratch={selectedConcour}
                        videoModalVisible={videoModalVisible}
                        videoId={videoId}
                        _stopVideo={_stopVideo}
                        onError={() => setVideoModalVisible(false)}
                    />
                )}
            </ScreenWrapper>
            <Animated.View
                style={{
                    position: 'absolute',
                    width: '100%',
                    flex: 1,
                    top: dailyRewardTop,
                }}>
                <DailyRewardBar
                    rewardList={rewardList}
                    onRewardPress={reward => showDailyRewardPopup(reward)}
                    onClose={() => {
                        Animated.timing(dailyRewardTop, {
                            toValue: -(SCREEN_HEIGHT / 2),
                            duration: DAILY_REWARD_ANIMATION_DURATION,
                            useNativeDriver: false,
                        }).start();
                    }}
                />
            </Animated.View>
        </>
    );
};

export default withAppContext(ConcoursScreen);

const styles = StyleSheet.create({
    chevronIcon: {
        width: wp(6),
        height: wp(6),
        marginRight: wp(2),
        resizeMode: 'cover',
    },
    modalSelectorView: {
        backgroundColor: Colors.APP_DARK_BLUE_COLOR,
        flexDirection: 'row',
        borderRadius: wp(5),
        alignItems: 'center',
        paddingLeft: wp(2),
        marginLeft: wp(2),
    },
    modalRowView: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    initValueText: {
        color: Colors.White,
        fontFamily: 'Montserrat-Bold',
        fontSize: 14,
        fontWeight: '700',
    },
    selectText: {
        color: Colors.White,
        fontFamily: 'Montserrat-Bold',
        fontSize: 16,
        fontWeight: '700',
    },
    select: {
        borderWidth: 0,
    }
})
