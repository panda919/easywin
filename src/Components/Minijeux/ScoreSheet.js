import React from 'react'
import Modal from "react-native-modal";
import { FlatList, Image, RefreshControl, Share, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SCREEN_HEIGHT } from '../../Constants'
import { hp, isX, PLATFORM_IOS, wp } from '../../Helper/ResponsiveScreen'
import { Colors } from '../../Styles/Colors'
import _ from 'lodash';
import CustomImage from '../CustomImage'
import { Images } from '../../Utils/images'
import ModalSelector from 'react-native-modal-selector'
import LinearGradient from 'react-native-linear-gradient'
import { apiPost } from '../../Utils/functions'
import Loader from '../Loader'
import Text from '../Text'
import { PanGestureHandler } from 'react-native-gesture-handler';

const ScoreSheet = (props) => {
    const sortOrderRankList = props?.minigameRanking.sort(function (a, b) {
        return a?.rank - b?.rank;
    });

    const myRankingIndex = sortOrderRankList.findIndex(
        (ranking) => ranking['email'] == props?.userReducer?.userProfile['email']
    );

    let myRankObject = null;
    let myPoints = 0;
    let myRank = '∞';
    let nextRank = props?.minigameRanking?.length;
    let nextRankPointsDiffrence =
        props?.minigameRanking.length == 0
            ? 0
            : props?.minigameRanking[props?.minigameRanking.length - 1]?.minigameTotalScore;
    if (myRankingIndex == -1) {
        //no rank
    } else if (myRankingIndex == 0) {
        //i am top tanked
        myRankObject = props?.minigameRanking[myRankingIndex];
        myPoints = myRankObject?.minigameTotalScore;
        myRank = myRankObject?.rank;
    } else {
        //some rank in between
        myRankObject = props?.minigameRanking[myRankingIndex];
        myPoints = myRankObject?.minigameTotalScore;
        myRank = myRankObject?.rank;
        nextRank = props?.minigameRanking[myRankingIndex - 1]?.rank;
        nextRankPointsDiffrence =
            props?.minigameRanking[myRankingIndex - 1]?.minigameTotalScore -
                myPoints ==
                0
                ? 1
                : props?.minigameRanking[myRankingIndex - 1]?.minigameTotalScore -
                myPoints;
    }

    const options = props?.minigames?.map((minigame) => ({
        id: minigame?.id,
        label: minigame?.name,
        value: minigame?.type,
    }));
    const initVal = _?.findLast(
        options,
        (option) => option?.value === props?.selectedGameFilter,
    );



    return (
        <Modal
            isVisible={props?.isScoreSheetOpen}
            swipeDirection={props?.swipeValue}
            useNativeDriverForBackdrop={true}
            statusBarTranslucent
            onSwipeComplete={props?.onClose}
            // useNativeDriver={false}
            propagateSwipe={true}
            style={styles.modalView}>
            <View>
                <PanGestureHandler onGestureEvent={({ nativeEvent }) => {
                    if (nativeEvent.translationY > 0 && nativeEvent.velocityY > 1) {
                        props?.onClose();
                    }
                }}>
                    <View style={styles.topborder} />
                </PanGestureHandler>
                <View style={styles.bottomSheetContainer}>
                    <CustomImage
                        source={
                            props?.selectedTabIndex == 0
                                ? Images.GAME_BANNER_DAY
                                : props?.selectedTabIndex == 1
                                    ? Images.GAME_BANNER_WEEK
                                    : Images.GAME_BANNER_MONTH
                        }
                        style={styles.customImageStyle}
                        contentContainerStyle={styles.customImageContainerStyle}>
                        <View
                            style={[styles.modalSelectorView, {
                                marginLeft: props?.selectedGameFilter == 'gravity' ? wp(9) : wp(12.5),
                            }]}>
                            <ModalSelector
                                data={options}
                                keyExtractor={(item) => item?.id}
                                labelExtractor={(item) => item?.label}
                                onChange={({ value }) => props?.gameFilterModelPress(value)}
                                initValue={initVal?.label || ''}
                                selectStyle={{
                                    borderWidth: 0,
                                }}
                                initValueTextStyle={{
                                    color: Colors.Black,
                                    fontFamily: 'Montserrat-Bold',
                                    fontSize: 18,
                                    fontWeight: '700',
                                }}
                                selectTextStyle={{
                                    color: Colors.Black,
                                    fontFamily: 'Montserrat-Bold',
                                    fontSize: 18,
                                    fontWeight: '700',
                                }}
                            />
                            <Image
                                style={styles.chevronDownIcon}
                                resizeMode="cover"
                                source={Images.CHEVRON_DOWN_ICON}
                            />
                        </View>
                    </CustomImage>
                    {props?._renderTabs()}
                    <LinearGradient
                        colors={['#FFDB0F', '#FFB406']}
                        style={styles.linearGradientStyle}>
                        <TouchableOpacity
                            onPress={async () => {
                                //close score sheet
                                props?.onClose()
                                const gameIndex = props?.minigames.findIndex(
                                    (minigame) => minigame?.type == props?.selectedGameFilter,
                                );
                                if (gameIndex > -1) {
                                    let shareType = '';
                                    let game = props?.minigames[gameIndex];
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
                                    await Share.share({
                                        message: `Mon score est de ${myRankObject?.minigameTotalScore} sur le jeu ${myRankObject?.firstname && myRankObject?.lastname ? myRankObject?.firstname + ' ' + myRankObject?.lastname?.charAt(0)?.toUpperCase() : myRankObject?.lastname ? myRankObject?.lastname : myRankObject?.firstname ? myRankObject?.firstname : myRankObject?.username}, viens me battre sur EasyWin pour gagner des cadeaux. Celui qui fait le meilleur score gagne [nom du lot 1 du mois].\n➡️ Lien d'EasyWin : www.easy-win.io`,
                                    });
                                    await apiPost(
                                        '/missions/post_app_shares',
                                        { shareType },
                                    );
                                }
                            }}>
                            <Text
                                style={{
                                    color: Colors.Black,
                                    fontWeight: '700',
                                    fontSize: 15,
                                    padding: hp(0.7),
                                    paddingHorizontal: hp(1.2),
                                }}>
                                DÉFIEZ VOS AMIS
                            </Text>
                        </TouchableOpacity>
                    </LinearGradient>
                    {
                        props?.loadingGameScore &&
                        <Loader style={{ paddingVertical: '10%' }} size='large' />
                    }
                    {props?.minigameRanking?.length > 0 && (
                        <View>
                            <FlatList
                                onScroll={props?.handleScroll}
                                data={props?.minigameRanking}
                                contentContainerStyle={{
                                    marginHorizontal: wp(5),
                                    paddingBottom: PLATFORM_IOS ? (isX ? hp(55) : hp(55)) : hp(55),
                                }}
                                renderItem={({ item, index }) =>
                                    props?.renderScoreItem({ item, index, myRankingIndex })
                                }
                                keyExtractor={(item) => `afkey-${item?.id}`}
                                showsHorizontalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={props?.loadingGameScore}
                                        onRefresh={() => props?._loadGameScore(props?.selectedGameFilter, props?.selectedTabIndex)}
                                    />
                                }
                            />
                        </View>
                    )}
                    {
                        !props?.loadingGameScore && props?.minigameRanking?.length == 0 && (
                            <Text style={{ color: Colors.Black, alignSelf: 'center', margin: wp(5) }}>
                                Jouez et réalisez le meilleur score pour remporter des cadeaux !
                            </Text>
                        )
                    }
                    {
                        !!myRankObject &&
                        <View
                            style={styles.myRankObjectView}>
                            {!!myRankObject && props?.renderMyRankItem(myRankObject)}
                        </View>
                    }
                </View>
            </View>
        </Modal>
    )
}

export default ScoreSheet

const styles = StyleSheet.create({
    modalView: {
        justifyContent: 'flex-end',
        margin: 0
    },
    topborder: {
        backgroundColor: Colors.Gray2,
        height: hp(1),
        alignSelf: "center",
        width: wp(15),
        borderRadius: wp(10),
        marginBottom: hp(1)
    },
    bottomSheetContainer: {
        height: PLATFORM_IOS ? SCREEN_HEIGHT - hp(14) : SCREEN_HEIGHT - hp(9),
        width: wp(100),
        alignSelf: 'center',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: Colors.White,
        overflow: 'hidden'
    },
    customImageContainerStyle: {
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
    },
    customImageStyle: {
        width: wp(100),
        height: wp(100) * 0.387,
        borderRadius: 0,
    },
    modalSelectorView: {
        marginBottom: hp(2.1),
        backgroundColor: Colors.APP_TAB_GRAY_COLOR,
        flexDirection: 'row',
        borderRadius: wp(10),
        alignItems: 'center',
        paddingVertical: PLATFORM_IOS ? hp(0.7) : 0,
        paddingLeft: wp(2.5),
    },
    chevronDownIcon: {
        width: wp(4),
        height: wp(4),
        marginLeft: PLATFORM_IOS ? wp(2.5) : -wp(1.75),
        marginRight: wp(2.5),
    },
    linearGradientStyle: {
        borderRadius: 50,
        alignSelf: 'center'
    },
    myRankObjectView: {
        position: 'absolute',
        bottom: hp(1),
        left: 0,
        right: 0,
        zIndex: 0,
    }
})
