import AsyncStorage from '@react-native-community/async-storage';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, NativeModules, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import Header from '../../Components/Header';
import { useSelector, useDispatch } from 'react-redux'
import { clearRanking, fetchMinigamesActions, fetchMinigamesRankingActions, fetchRankRewardDetails, showPopup } from '../../Actions';
import RatingPopup from '../../Components/Minijeux/RatingPopup';
import ScreenWrapper from '../../Components/ScreenWrapper';
import { getAmount, getRankRewardImage } from '../../Utils/functions';
import { CARD, Colors } from '../../Styles/Colors';
import { hp, wp } from '../../Helper/ResponsiveScreen';
import { SERVER_BASE } from '../../Constants';
import Text from '../../Components/Text';
import CustomImage from '../../Components/CustomImage';
import { Images } from '../../Utils/images';
import TabButton from '../../Components/TabButton';
import commonStyles from '../../Styles/index';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import ScoreSheet from '../../Components/Minijeux/ScoreSheet';

const tabs = ['Jour', 'Semaine', 'Mois'];
const { UIManager } = NativeModules;
UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);


const MinijeuxScreen = (props) => {
    const dispatch = useDispatch()
    const navigation = useNavigation()
    const [loading, setLoading] = useState(false)
    const [loadingGameScore, setLoadingGameScore] = useState(false)
    const [selectedTabIndex, setSelectedTabIndex] = useState(0)
    const [selectedGameFilter, setSelectedGameFilter] = useState(null)
    const [isScoreSheetOpen, setIsScoreSheetOpen] = useState(false)
    const [isScollFlatlist, setIsScollFlatlist] = useState(false)
    const [swipeValue, setSwipeValue] = useState(null)

    const userReducer = useSelector((state) => state?.userReducer)
    const minigames = useSelector((state) => state?.minigamesReducer?.minigames)
    const minigameRanking = useSelector((state) => state?.minigamesReducer?.minigameRanking)
    const minigameRankRewards = useSelector((state) => state?.userReducer?.minigameRankRewards)

    useEffect(() => {
        const renderData = async () => {
            let firstBoot = await AsyncStorage.getItem('FIRST_BOOT');
            if (firstBoot) {
                //check date
                if (userReducer?.userProfile?.consecutiveLogin === 1) {
                    let popupShown = await AsyncStorage.getItem('RATING_POPUP_SHOWN');
                    if (popupShown) {
                        //nothing
                    } else {
                        showPopup(<RatingPopup />);
                    }
                }
            } else {
                await AsyncStorage.setItem('FIRST_BOOT', JSON.stringify(moment()));
            }

            if (__DEV__) {
                _handleRefresh();
            } else {
                _handleRefresh();
            }
        }

        renderData()
    }, [])

    useEffect(() => {
        if (isScollFlatlist) {
            setSwipeValue(null)
        } else {
            setSwipeValue('down')
        }
    }, [isScollFlatlist])

    const _handleRefresh = async () => {
        setLoading(true)
        await dispatch(fetchMinigamesActions());
        setLoading(false)
    };

    const _loadGameScore = async (selectedGameFilter, selectedTabIndex) => {
        setLoadingGameScore(true)
        // selectedGameFilter
        if (minigameRankRewards && Object.keys(minigameRankRewards).length === 0 && Object.getPrototypeOf(minigameRankRewards) === Object.prototype) {
            await dispatch(fetchRankRewardDetails());
        }
        await dispatch(fetchMinigamesRankingActions(
            selectedGameFilter,
            selectedTabIndex,
        ));
        setLoadingGameScore(false)
    };

    const gameFilterModelPress = async (value) => {
        setSelectedGameFilter(value)
        await dispatch(clearRanking());
        _loadGameScore(value, selectedTabIndex)
    }

    const renderScoreItem = ({ item, index, myRankingIndex }) => {
        let rewardIcon = getRankRewardImage(
            minigameRankRewards,
            selectedTabIndex,
            item?.rank,
        );
        let rankTextStyle = {};
        let cardStyle = {};
        if (item?.rank == 1) {
            rankTextStyle = { color: Colors.APP_YELLOW_COLOR, fontSize: 20 };
        } else if (item?.rank == 2) {
            rankTextStyle = { color: Colors.APP_GRAY_COLOR };
        } else if (item?.rank == 3) {
            rankTextStyle = { color: 'rgb(148,116,37)' };
        }
        else {
            rankTextStyle = { color: 'black' };
        }

        if (item?.rank == 1) {
            cardStyle = { ...CARD };
        }
        else {
            cardStyle = {
                borderBottomWidth: 1,
                borderBottomColor: Colors.APP_TAB_GRAY_COLOR,
            }
        }

        return (
            <View
                style={{
                    paddingHorizontal: wp(2.5),
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: hp(0.9),
                    paddingBottom: hp(0.9),
                    ...cardStyle,
                    backgroundColor: Colors.White,
                    opacity: 1
                }}>
                <Text
                    style={{
                        fontSize: 16,
                        fontWeight: '700',
                        ...rankTextStyle,
                    }}>
                    #{item?.rank}
                </Text>
                <CustomImage
                    source={
                        item?.avatarUrl ? { uri: `${SERVER_BASE}${item?.avatarUrl}` } : Images.PROFILE_ICON
                    }
                    style={{
                        height: wp(15),
                        width: wp(15),
                        marginRight: wp(2.5),
                        marginLeft: wp(3.75),
                        borderRadius: wp(7.5),
                    }}
                />
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                color:
                                    index == myRankingIndex
                                        ? Colors.APP_LIGHT_BLUE_COLOR
                                        : Colors.Black,
                                fontSize: 17,
                                fontWeight: '700',
                                width: '70%',
                            }}>
                            {`${item?.firstname && item?.lastname
                                ? item?.firstname + ' ' + item?.lastname?.charAt(0)?.toUpperCase()
                                : item?.lastname
                                    ? item?.lastname
                                    : item?.firstname
                                        ? item?.firstname
                                        : item?.username
                                }`}
                        </Text>
                        <Text
                            style={{
                                marginVertical: 3,
                                color:
                                    index == myRankingIndex
                                        ? Colors.APP_LIGHT_BLUE_COLOR
                                        : Colors.Black,
                                fontSize: 14,
                                fontWeight: '500',
                            }}>
                            Score : {item?.minigameTotalScore}
                        </Text>
                    </View>
                </View>
                <View
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
                        width: '30%',
                    }}>
                    {
                        <Text
                            style={{
                                color: Colors.Black,
                                fontSize: 12,
                                fontWeight: '400',
                                paddingHorizontal: wp(2.5),
                                width: '60%',
                            }}>
                            {getAmount(
                                minigameRankRewards,
                                selectedTabIndex,
                                item?.rank,
                            )}
                        </Text>
                    }
                    {rewardIcon && (
                        <Image
                            source={rewardIcon}
                            style={{ width: wp(12.5), height: wp(12.5) }}
                        />
                    )}
                </View>
            </View>
        );
    };

    const renderMyRankItem = (item) => {
        let rewardIcon = getRankRewardImage(
            minigameRankRewards,
            selectedTabIndex,
            item?.rank,
        );
        let rankTextStyle = { color: Colors.APP_LIGHT_BLUE_COLOR, fontSize: 20 };
        let cardStyle = { ...CARD };

        return (
            <View
                style={{
                    marginBottom: hp(0.5),
                    paddingHorizontal: wp(2.5),
                    marginHorizontal: wp(2.5),
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: hp(0.9),
                    paddingBottom: hp(0.9),
                    ...cardStyle,
                }}>
                <Text
                    style={{
                        color: Colors.Black,
                        fontSize: 16,
                        fontWeight: '700',
                        ...rankTextStyle,
                    }}>
                    #{item?.rank}
                </Text>
                <CustomImage
                    source={
                        item?.avatarUrl ? { uri: `${SERVER_BASE}${item?.avatarUrl}` } : Images.PROFILE_ICON
                    }
                    style={{
                        height: wp(15),
                        width: wp(15),
                        marginRight: wp(2.5),
                        marginLeft: wp(3.75),
                        borderRadius: wp(7.5),
                    }}
                />
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                color: Colors.APP_LIGHT_BLUE_COLOR,
                                fontSize: 17,
                                fontWeight: '700',
                                width: '70%',
                            }}>
                            {`${item?.firstname && item?.lastname
                                ? item?.firstname + ' ' + item?.lastname?.charAt(0)?.toUpperCase()
                                : item?.lastname
                                    ? item?.lastname
                                    : item?.firstname
                                        ? item?.firstname
                                        : item?.username
                                }`}
                        </Text>
                        <Text
                            style={{
                                marginVertical: 3,
                                color: Colors.APP_LIGHT_BLUE_COLOR,
                                fontSize: 14,
                                fontWeight: '500',
                            }}>
                            Score : {item?.minigameTotalScore}
                        </Text>
                    </View>
                </View>
                <View
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
                        width: '30%',
                    }}>
                    {
                        <Text
                            style={{
                                color: Colors.Black,
                                fontSize: 12,
                                fontWeight: '400',
                                paddingHorizontal: wp(2.5),
                                width: '60%'
                            }}>
                            {getAmount(
                                minigameRankRewards,
                                selectedTabIndex,
                                item?.rank,
                            )}
                        </Text>
                    }
                    {rewardIcon && (
                        <Image
                            source={rewardIcon}
                            style={{ width: wp(13), height: wp(13) }}
                        />
                    )}
                </View>
            </View>
        );
    };

    const tabButtonPress = async (index) => {
        setSelectedTabIndex(index)
        await dispatch(clearRanking());
        _loadGameScore(selectedGameFilter, index);
    }

    const _renderTabs = () => {
        return (
            <View style={{ marginHorizontal: wp(7.5) }}>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginVertical: hp(1.2),
                        backgroundColor: Colors.APP_TAB_GRAY_COLOR,
                        borderRadius: wp(8),
                    }}>
                    {tabs.map((title, index) => (
                        <TabButton
                            title={title}
                            isSelected={index === selectedTabIndex}
                            onPress={() => tabButtonPress(index)}
                        />
                    ))}
                </View>
            </View>
        );
    };

    const renderItem = ({ item }) => {
        return (
            <View
                style={{
                    marginHorizontal: wp(5),
                    marginTop: hp(2.2),
                    borderRadius: wp(5),
                    ...commonStyles.SHADOW,
                }}>
                <CustomImage
                    source={
                        item.imageUrl
                            ? { uri: `${SERVER_BASE}${item.imageUrl}` }
                            : Images.bggifts
                    }
                    style={{ borderRadius: wp(5), height: wp(53), width: wp(90) }}
                >
                    <View
                        style={{
                            width: wp(90),
                            alignItems: 'flex-end',
                            marginTop: hp(1),
                            marginRight: wp(2.5),
                        }}>
                        <TouchableOpacity
                            onPress={async () => {
                                setSelectedGameFilter(item?.type)
                                await dispatch(clearRanking());
                                _loadGameScore(item?.type, selectedTabIndex)
                                // open score sheet
                                setIsScoreSheetOpen(true)
                            }}>
                            <View
                                style={{
                                    width: wp(10),
                                    height: wp(10),
                                    borderRadius: wp(5),
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                }}>
                                <Image
                                    source={Images.CUP_ICON}
                                    style={{ width: wp(5), height: wp(5) }}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, width: wp(90), justifyContent: 'flex-end' }}>
                        <View
                            style={{
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                flexDirection: 'row',
                                height: hp(8),
                                borderBottomLeftRadius: wp(5),
                                borderBottomRightRadius: wp(5),
                                overflow: 'hidden',
                            }}>
                            <View
                                style={{
                                    height: wp(90),
                                    justifyContent: 'space-evenly',
                                    alignItems: 'center',
                                }}>
                                <LinearGradient
                                    colors={['#FFDB0F', '#FFB406']}
                                    style={{ marginHorizontal: wp(2.5), borderRadius: wp(10) }}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            navigation.navigate('WebGameScreen', {
                                                game: item,
                                            });
                                        }}>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                padding: hp(0.7),
                                            }}>
                                            <Text
                                                style={{
                                                    color: Colors.Black,
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
        );
    };

    const handleScroll = (event) => {
        if (event?.nativeEvent?.contentOffset?.y !== 0) {
            setIsScollFlatlist(true)
        } else {
            setIsScollFlatlist(false)
        }
    }

    return (
        <ScreenWrapper contentContainerStyle={commonStyles.screenWrapperContent}>
            <Header />
            <FlatList
                data={minigames}
                renderItem={renderItem}
                keyExtractor={(item) => item?.id}
                style={{ flex: 1 }}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={() => _handleRefresh()}
                    />
                }
                contentContainerStyle={{ paddingBottom: hp(7) }}
            />
            {isScoreSheetOpen && <ScoreSheet
                isScoreSheetOpen={isScoreSheetOpen}
                onClose={() => setIsScoreSheetOpen(false)}
                onOpen={() => setIsScoreSheetOpen(true)}
                selectedTabIndex={selectedTabIndex}
                selectedGameFilter={selectedGameFilter}
                minigameRanking={minigameRanking}
                userReducer={userReducer}
                minigames={minigames}
                _renderTabs={_renderTabs}
                loadingGameScore={loadingGameScore}
                renderScoreItem={renderScoreItem}
                _loadGameScore={_loadGameScore}
                renderMyRankItem={renderMyRankItem}
                gameFilterModelPress={(value) => gameFilterModelPress(value)}
                handleScroll={handleScroll}
                swipeValue={swipeValue}
            />}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
});

export default MinijeuxScreen;
