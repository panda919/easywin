import React, { useEffect, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import SplashScreen from 'react-native-splash-screen';
import Header from '../../Components/Header';
import Loader from '../../Components/Loader';
import ScreenWrapper from '../../Components/ScreenWrapper';
import ShareCodeSheet from '../../Components/ShareCodeSheet';
import Text from '../../Components/Text';
import { hp, isX, PLATFORM_IOS, wp } from '../../Helper/ResponsiveScreen';
import { CARD, Colors } from '../../Styles/Colors';
import commonStyles from '../../Styles/index';
import { useSelector, useDispatch } from 'react-redux'
import { fetchRankRewardDetails, fetchUserProfileAction } from '../../Actions';
import { useIsFocused } from '@react-navigation/native';
import { clearAffiliatesActions, fetchAffiliatesActions } from '../../Actions/AffiliateActions';
import TabButton from '../../Components/TabButton';
import { getAmount, getRankRewardImage } from '../../Utils/functions';
import CustomImage from '../../Components/CustomImage';
import { SERVER_BASE } from '../../Constants';
import { Images } from '../../Utils/images';

const tabs = ['Jour', 'Semaine', 'Mois'];

const ParraindorScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const isFocused = useIsFocused()

    const [loading, setLoading] = useState(false)
    const [selectedTabIndex, setSelectedTabIndex] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const userReducer = useSelector((state) => state?.userReducer)
    const affiliates = useSelector((state) => state?.affiliatesReducer?.affiliates)
    const affiliateRankRewards = useSelector((state) => state?.userReducer?.affiliateRankRewards)
    const myRankingIndex = affiliates?.findIndex((ranking) => {
            return ranking?.hasOwnProperty('@id') && userReducer?.userProfile?.hasOwnProperty('@id') && ranking['@id'] === userReducer?.userProfile['@id']
        }
    );
    let myRankObject = null;
    if (myRankingIndex === -1) {
        //no rank
    } else if (myRankingIndex === 0) {
        //i am top tanked
        myRankObject = affiliates[myRankingIndex];
    } else {
        //some rank in between
        myRankObject = affiliates[myRankingIndex];
    }

    useEffect(() => {
        const renderData = async () => {
            SplashScreen.hide();
            if (__DEV__) {
                await dispatch(fetchUserProfileAction());
            } else {
                await dispatch(fetchUserProfileAction());
                _handleRefresh(selectedTabIndex);
            }
        }
        renderData()
    }, [])

    useEffect(() => {
        const renderFocusData = async () => {
            setSelectedTabIndex(0)
            await dispatch(clearAffiliatesActions());
            _handleRefresh(0);
        }
        if (isFocused) {
            renderFocusData()
        }
    }, [isFocused])

    const _handleRefresh = async (selectedTabIndex) => {
        setLoading(true)
        if (affiliateRankRewards && Object.keys(affiliateRankRewards).length === 0 && Object.getPrototypeOf(affiliateRankRewards) === Object.prototype) {
            dispatch(fetchRankRewardDetails());
        }
        await dispatch(fetchAffiliatesActions(selectedTabIndex));
        setLoading(false)
    };

    const _renderTabs = () => {
        return (
            <View style={{ marginHorizontal: wp(7.5) }}>
                <View
                    style={styles.tabButtonView}>
                    {tabs.map((title, index) => (
                        <TabButton
                            title={title}
                            isSelected={index === selectedTabIndex}
                            onPress={async () => {
                                setSelectedTabIndex(index)
                                await dispatch(clearAffiliatesActions())
                                _handleRefresh(index)
                            }}
                        />
                    ))}
                </View>
            </View>
        );
    };

    const renderItem = ({ item, index, myRankingIndex }) => {
        let rankTextStyle = {};
        let rewardIcon = getRankRewardImage(
            affiliateRankRewards,
            selectedTabIndex,
            item?.rank,
        );
        if (item?.rank == 1) {
            rankTextStyle = { color: Colors.APP_YELLOW_COLOR, fontSize: 20 };
        } else if (item?.rank == 2) {
            rankTextStyle = { color: Colors.APP_GRAY_COLOR };
        } else if (item?.rank == 3) {
            rankTextStyle = { color: 'rgb(148,116,37)' };
        }
        let cardStyle = {
            borderBottomWidth: 1,
            borderBottomColor: Colors.APP_TAB_GRAY_COLOR,
        };
        if (item?.rank == 1) {
            cardStyle = { ...CARD };
        }
        if (myRankingIndex && index + 1 == myRankingIndex && item?.rank != 1) {
            cardStyle = { paddingBottom: 0 };
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
                    style={styles.avatarUrlImg}
                />
                <View style={styles.nameView}>
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                color:
                                    index == myRankingIndex
                                        ? Colors.APP_LIGHT_BLUE_COLOR
                                        : Colors.Black,
                                fontSize: 17,
                                fontWeight: '700',
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
                                marginVertical: hp(0.3),
                                color:
                                    index == myRankingIndex
                                        ? Colors.APP_LIGHT_BLUE_COLOR
                                        : Colors.Black,
                                fontSize: 14,
                                fontWeight: '500',
                            }}>
                            Score : {item?.sponsored}
                        </Text>
                    </View>
                </View>
                <View
                    style={styles.rankAndRewardView}>
                    {
                        <Text
                            style={{
                                color: Colors.Black,
                                fontSize: 12,
                                fontWeight: '400',
                                paddingHorizontal: 10,
                                width: '60%',
                            }}>
                            {getAmount(
                                affiliateRankRewards,
                                selectedTabIndex,
                                item?.rank,
                            )}
                        </Text>
                    }
                    {rewardIcon && (
                        <Image
                            source={rewardIcon}
                            style={styles.rewardIconImg}
                        />
                    )}
                </View>
            </View>
        );
    };

    const renderMyRankItem = (item) => {
        let rewardIcon = getRankRewardImage(
            affiliateRankRewards,
            selectedTabIndex,
            item?.rank,
        );
        let rankTextStyle = { color: Colors.APP_LIGHT_BLUE_COLOR, fontSize: 20 };
        let cardStyle = { ...CARD };

        return (
            <View
                style={{
                    paddingHorizontal: wp(2.5),
                    marginHorizontal: wp(2.5),
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
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
                    style={styles.avatarUrlImgRank}
                />
                <View style={styles.nameView}>
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                color: Colors.APP_LIGHT_BLUE_COLOR,
                                fontSize: 17,
                                fontWeight: '700',
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
                            Score : {item?.sponsored}
                        </Text>
                    </View>
                </View>
                <View
                    style={styles.rankAndRewardView}>
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
                                affiliateRankRewards,
                                selectedTabIndex,
                                item?.rank,
                            )}
                        </Text>
                    }
                    {rewardIcon && (
                        <Image
                            source={rewardIcon}
                            style={styles.rewardIconImg}
                        />
                    )}
                </View>
            </View>
        );
    };

    return (
        <ScreenWrapper
            contentContainerStyle={commonStyles.screenWrapperContent}>
            <Header />
            <Image
                source={
                    selectedTabIndex == 0
                        ? Images.PARRAIN_DAY
                        : selectedTabIndex == 1
                            ? Images.PARRAIN_WEEK
                            : Images.PARRAIN_MONTH
                }
                style={styles.parrainImg}
                resizeMode="contain"
            />
            {_renderTabs()}
            <LinearGradient
                colors={['#FFDB0F', '#FFB406']}
                style={{ borderRadius: 50, alignSelf: 'center' }}>
                <TouchableOpacity
                    onPress={() => setIsOpen(true)}>
                    <Text
                        style={{
                            color: Colors.Black,
                            fontWeight: 'bold',
                            fontSize: 15,
                            padding: hp(0.7),
                            paddingHorizontal: wp(3),
                        }}>
                        DEVENEZ LE PARRAIN D'OR
                    </Text>
                </TouchableOpacity>
            </LinearGradient>
            <View style={{ flex: 1 }}>
                {loading && (
                    <Loader style={{ paddingVertical: '10%' }} size="large" />
                )}
                {affiliates?.length > 0 && (
                    <FlatList
                        data={affiliates}
                        contentContainerStyle={{
                            marginHorizontal: wp(5),
                            paddingBottom: PLATFORM_IOS ? (isX ? hp(55) : hp(55)) : hp(55),
                        }}
                        renderItem={({ item, index }) =>
                            renderItem({ item, index, myRankingIndex })
                        }
                        keyExtractor={(item) => `afkey-${item.id}`}
                        showsHorizontalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={loading}
                                onRefresh={() => _handleRefresh(selectedTabIndex)}
                            />
                        }
                        style={{ flex: 1 }}
                    />
                )}
                {!loading && affiliates?.length == 0 && (
                    <Text style={{ color: Colors.Black, alignSelf: 'center', margin: wp(5) }}>
                        {' '}
                        Soyez le premier Parrain d'Or en invitant vos amis et remportez des cadeaux exclusifs !
                    </Text>
                )}
            </View>
            <View
                style={{
                    position: 'absolute',
                    bottom: hp(1),
                    left: 0,
                    right: 0,
                    zIndex: 0,
                }}>
                {!!myRankObject && renderMyRankItem(myRankObject)}
            </View>
            <ShareCodeSheet
                isVisible={isOpen}
                message={`Viens gagner de nombreux cadeaux sur EasyWin en jouant GRATUITEMENT à des jeux ! Télécharge l'app avec mon code de parrainage pour obtenir un bonus.\n➡️ Lien d'EasyWin : www.easy-win.io\n➡️ Mon code : ${userReducer?.userProfile?.sponsorCode}`}
                onSwipeComplete={() => setIsOpen(false)}
                closeModal={() => setIsOpen(false)}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    parrainImg: {
        width: wp(100),
        height: wp(100) * 0.287,
        marginVertical: hp(1.2),
    },
    tabButtonView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp(1.2),
        backgroundColor: Colors.APP_TAB_GRAY_COLOR,
        borderRadius: wp(8),
    },
    avatarUrlImg: {
        height: wp(15),
        width: wp(15),
        marginHorizontal: wp(2.5),
        borderRadius: wp(7.5),
    },
    avatarUrlImgRank: {
        height: wp(15),
        width: wp(15),
        marginRight: wp(2.5),
        marginLeft: wp(3.75),
        borderRadius: wp(7.5),
    },
    rewardIconImg: {
        width: wp(12.5),
        height: wp(12.5)
    },
    rankAndRewardView: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        width: '30%',
    },
    nameView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    }
});

export default ParraindorScreen;
