import { View, StyleSheet, TouchableWithoutFeedback, Linking, TouchableOpacity, Image, Share, Modal, Animated, PanResponder } from 'react-native'
import React, { useRef, useState } from 'react'
import { Colors } from '../../Styles/Colors'
import { hp, wp } from '../../Helper/ResponsiveScreen'
import { PLATFORM_IOS, SCREEN_HEIGHT, SCREEN_WIDTH, SERVER_BASE } from '../../Constants'
import CustomImage from '../CustomImage'
import { Images } from '../../Utils/images'
import { updateStatistics } from '../../Utils/functions'
import Loader from '../Loader'
import Text from '../Text'
import commonStyles from '../../Styles/index';
import Lang from '../../Languages/LanguageStr'
import { errorMessage, showPopup } from '../../Actions'
import { LMSText } from '../../Languages/LMSText'
import AsyncStorage from '@react-native-community/async-storage'
import PopupBase from '../PopupBase'
import ScratchView from 'react-native-scratch'
import moment from "moment";

const ScratchSheet = (props) => {
    const child = useRef(null);
    const [gesturedy, setGesturedy] = useState(0)
    const pan = useRef(new Animated.ValueXY()).current;
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onPanResponderMove: (e, gestureState) => {
                if (gestureState.dy > 0) {
                    Animated.event([null, { dy: pan.y }], { useNativeDriver: false })(
                        e,
                        gestureState,
                    );
                }
            },
            onPanResponderRelease: (e, gesture) => {
                setGesturedy(gesture.dy)
                if (gesture.dy > 50) {
                    props?.onClose();
                    pan.setValue({ x: 0, y: 0 });
                } else {
                    Animated.spring(pan, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: false,
                    }).start();
                }
            },
            onResponderTerminationRequest: () => true,  // Allow touch events to be passed through to child components
        })
    ).current;

    const competitionParticipationsDetails = props?.competitionParticipationsDetails
    const participationIndex = competitionParticipationsDetails?.findIndex(
        competitionParticipation =>
            competitionParticipation?.scratch &&
            competitionParticipation?.scratch['@id']?.substring(11) == props?.selectedScratch?.id,
    );

    if (participationIndex > -1) {
        let participation = competitionParticipationsDetails[participationIndex];
        if (participation?.scratch?.winner === props?.userReducer?.userProfile['@id']) {
            result = 'GAGNÉ';
        }
    }

    if (!props?.isScratchSheetOpen) return null
    return (
        <Modal
            visible={props?.isScratchSheetOpen}
            animationType="slide"
            transparent={true}
            statusBarTranslucent
            onRequestClose={() => {
                props?.onClose();
                pan.setValue({ x: 0, y: 0 }); // Reset default value
            }}
            style={styles.modalView}>
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <Animated.View
                    style={[{
                        transform: pan.getTranslateTransform(),
                    }]}
                    {...gesturedy < 0 && panResponder.panHandlers}
                >
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        marginTop: -hp(12),
                        backgroundColor: 'transparent',
                    }} {...panResponder.panHandlers}>
                    </View>
                    <TouchableOpacity onPress={() => {
                        props?.onClose();
                        pan.setValue({ x: 0, y: 0 })
                    }}>
                        <View
                            style={styles.topborder}
                        />
                    </TouchableOpacity>
                    <View style={styles.bottomSheetContainer}>
                        <CustomImage
                            source={
                                props?.selectedScratch?.imageBackgroundUrl && props?.showScratchBgImage
                                    ? { uri: `${SERVER_BASE}${props?.selectedScratch?.imageBackgroundUrl}` }
                                    : null
                            }
                            defaultSource={Images.DEFAULT_SOURCE}
                            style={{
                                borderRadius: 20,
                                backgroundColor: Colors.White,
                                height: hp(92),
                                width: wp(100)
                            }}
                            imageStyle={{ resizeMode: 'stretch' }}>
                            <TouchableWithoutFeedback
                                disabled={!props?.selectedScratch?.backgroundUrl}
                                onPress={async () => {
                                    if (typeof props?.selectedScratch?.statistic === 'string') {
                                        const statisticId = props?.selectedScratch?.statistic.split('/')[2];
                                        updateStatistics(statisticId, { toIncrementBackgroundImage: 1 });
                                    } else if (props?.selectedScratch?.statistic?.id) {
                                        updateStatistics(props?.selectedScratch?.statistic.id, { toIncrementBackgroundImage: 1 });
                                    }
                                    Linking.openURL(props?.selectedScratch?.backgroundUrl);
                                }}>
                                <View
                                    style={styles.firstView}>
                                    <View
                                        style={styles.firstSubView}>
                                        <TouchableOpacity
                                            activeOpacity={1}
                                            disabled={props?.loadingLots}
                                            onPress={() => {
                                                if (typeof props?.selectedScratch?.statistic === 'string') {
                                                    const statisticId = props?.selectedScratch?.statistic.split('/')[2];
                                                    updateStatistics(statisticId, { toIncrementSeeProduct: 1 });
                                                } else if (props?.selectedScratch?.statistic?.id) {
                                                    updateStatistics(props?.selectedScratch?.statistic?.id, { toIncrementSeeProduct: 1 });
                                                }
                                                // open lots sheet
                                                props?.onOpenLotsSheet()
                                            }}>
                                            <View
                                                style={styles.giftButtonView}>
                                                <Text>LOTS À GAGNER</Text>
                                                <Image
                                                    source={Images.BLACK_GIFT_ICON}
                                                    style={styles.giftIcon}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            activeOpacity={1}
                                            disabled={props?.loadingLots}
                                            onPress={() => {
                                                props?.setRulesLink('https://www.easy-win.io/reglement-grattage-1')
                                                // open rules sheet
                                                props?.onOpenRulesSheet()
                                            }}>
                                            <View
                                                style={styles.infoButtonView}>
                                                <Image
                                                    source={Images.INFO_ICON}
                                                    style={styles.infoIcon}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                            <View
                                style={styles.scratchMainView}>
                                {props?.loadingMakeParticipation ? (
                                    <Loader size="large" />
                                ) : (
                                    <View
                                        style={styles.scratchView}>
                                        <View
                                            style={styles.scratchSubView}>
                                            <Text
                                                style={{
                                                    color: Colors.Black,
                                                    fontSize: 28,
                                                    fontWeight: 'bold',
                                                }}>
                                                {props?.scratchDone && props?.gameResult}
                                            </Text>
                                            <ScratchView
                                                ref={child}
                                                value={100}
                                                onLayout={() => {
                                                    console.log("child.current", child.current); // should log the component instance
                                                }}
                                                id={props?.scratchid} // ScratchView id (Optional)
                                                brushSize={40} // Default is 10% of the smallest dimension (width/height)
                                                threshold={10} // Report full scratch after 70 percentage, change as you see fit. Default is 50
                                                fadeOut={false} // Disable the fade out animation when scratch is done. Default is true
                                                placeholderColor="transparent" // Scratch color while image is loading (or while image not present)
                                                resourceName="scratch_img" // An image resource name (without the extension like '.png/jpg etc') in the native bundle of the app (drawble for Android, Images.xcassets in iOS) (Optional)
                                                resizeMode="cover|contain|stretch" // Resize the image to fit or fill the scratch view. Default is stretch
                                                onScratchProgressChanged={progress => {
                                                    //  console.log('scratch progress', progress);
                                                }} // Scratch progress event while scratching
                                                onScratchDone={() => {
                                                    console.log('onScratchDone', props?.gameResult);
                                                    props?.setScratchDone(true)
                                                    props?._postGameResult();
                                                }} // Scratch is done event
                                            />
                                        </View>
                                        {(props?.scratchLot &&
                                            props?.scratchDone &&
                                            props?.gameResult === 'GAGNÉ') ? (
                                            <Text
                                                style={{
                                                    color: Colors.Black,
                                                    fontSize: 16,
                                                    fontWeight: '700',
                                                    marginHorizontal: hp(0.5),
                                                    marginTop: wp(2.5),
                                                }}>
                                                Vous avez gagné {props?.scratchLot?.name}
                                            </Text>
                                        ) : <></>}
                                    </View>
                                )}
                            </View>

                            {(props?.gameResult === 'GAGNÉ' && props?.scratchDone) && (
                                <TouchableOpacity
                                    onPress={async () => {
                                        await Share.share({
                                            message: `J'ai gagné un(e) ` + props?.scratchLot?.name  + ` sur EasyWin ! Viens gagner de nombreux cadeaux sur l'app en jouant GRATUITEMENT à des concours, grattages et mini jeux ! Télécharge EasyWin avec mon code de parrainage pour obtenir un bonus.\n➡️ Lien d'EasyWin : www.easy-win.io\n➡️ Mon code : ` + props?.userReducer?.userProfile?.sponsorCode
                                        });
                                    }}>
                                    <View
                                        style={{
                                            ...commonStyles.SMALL_SHADOW,
                                            width: SCREEN_WIDTH * 0.75,
                                            margin: wp(5),
                                            height: hp(4.5),
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderRadius: wp(5.5),
                                        }}>
                                        <Text
                                            style={{
                                                color: Colors.FONT_BLUE_COLOR,
                                                fontSize: 18,
                                                fontWeight: '700',
                                            }}>
                                            PARTAGER
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                onPress={async () => {
                                    const participationIndex = props?.competitionParticipationsDetails?.findIndex(
                                        competitionParticipation =>
                                            competitionParticipation?.scratch &&
                                            competitionParticipation?.scratch['@id']?.substring(11) == props?.selectedScratch?.id,
                                    );

                                    const endDateTime = moment(new Date(props?.selectedScratch?.endAt)).format("YYYY-MM-DD HH:mm");
                                    const curentDateTime = moment(new Date()).format("YYYY-MM-DD HH:mm")

                                    if (endDateTime == curentDateTime) {
                                        errorMessage(LMSText(Lang.user.scratchExpired));
                                        // close scratch sheet
                                        props?.onClose()
                                        props?._handleRefresh();
                                    } else {
                                        if (props?.withCoins == false) {

                                            if (props?.userReducer?.userProfile?.wallet?.scratchCredit > 0 || props?.selectedScratch?.type == 'sponsored') {
                                                props?.setScratchDone(false)
                                                if (participationIndex > -1) {
                                                    //have participated
                                                    const participation = props?.competitionParticipationsDetails[participationIndex];

                                                    if (participation?.scratchLimitPerDay > 0) {
                                                        // child?.current?.reset();
                                                        props?._playVideo(props?.selectedScratch);
                                                        props?._getLots(props?.selectedScratch?.competitionLots);
                                                    } else {
                                                        // close scratch sheet
                                                        props?.onClose()
                                                        errorMessage(LMSText(Lang.user.scratchParticipationLimitReached));
                                                    }

                                                } else {
                                                    props?.setScratchDone(false)
                                                    // child?.current?.reset();
                                                    props?._playVideo(props?.selectedScratch);
                                                    props?._getLots(props?.selectedScratch?.competitionLots);
                                                }
                                            } else {
                                                // close scratch sheet
                                                props?.onClose()

                                                let lastShared = await AsyncStorage.getItem('LAST_SHARED');
                                                if (lastShared != null) {
                                                    const parseData = JSON.parse(lastShared);

                                                    let filterid = parseData?.filter(obj => obj?.uId == props?.userReducer?.userProfile['@id'] && obj?.sharedDate == moment(new Date()).format('DD-MM-YYYY'))

                                                    if (filterid.length > 0 && filterid[0]?.sharedDate == moment(new Date()).format('DD-MM-YYYY')) {
                                                        errorMessage(LMSText(Lang.user.insufficientScratchCredits));
                                                    }
                                                    else {
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
                                                                onButtonPress={() => props?.showsharePopup(props?.userReducer?.userProfile?.sponsorCode)
                                                                }
                                                            />,
                                                        );
                                                    }

                                                }
                                                else {
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
                                                            onButtonPress={() => props?.showsharePopup(props?.userReducer?.userProfile?.sponsorCode)}
                                                        />,
                                                    );
                                                }
                                            }
                                        }
                                        else {
                                            if (props?.userReducer?.userProfile?.wallet?.coin >= props?.selectedScratch?.coins) {
                                                props?.setScratchDone(false)

                                                if (participationIndex > -1) {
                                                    //have participated
                                                    const participation =
                                                        props?.competitionParticipationsDetails[participationIndex];

                                                    //pecies
                                                    if (participation?.scratchCoinsLimitPerDay == false) {
                                                        //have limit available
                                                        // child?.current?.reset();
                                                        props?._coinsParticipation(props?.selectedScratch, props?.withCoins);
                                                        props?._getLots(props?.selectedScratch?.competitionLots);

                                                    } else {
                                                        // close scratch sheet
                                                        props?.onClose()
                                                        errorMessage(LMSText(Lang.user.scratchParticipationCoinsLimitReached));
                                                    }
                                                } else {
                                                    // close scratch sheet
                                                    props?.onClose()
                                                    props?.setScratchDone(false)
                                                    errorMessage(LMSText(Lang.user.scratchParticipationCoinsLimitReached));
                                                }
                                            }
                                            else {
                                                // close scratch sheet
                                                props?.onClose()
                                            }
                                        }
                                    }
                                }}>
                                <View
                                    style={{
                                        ...commonStyles.SMALL_SHADOW,
                                        backgroundColor: Colors.APP_BLUE_COLOR,
                                        width: SCREEN_WIDTH * 0.75,
                                        marginBottom: hp(10),
                                        height: hp(4.5),
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: wp(5.5),
                                    }}>
                                    <Text style={{ color: Colors.White, fontSize: 18, fontWeight: '700' }}>
                                        REJOUER
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </CustomImage>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    )
}

export default ScratchSheet

const styles = StyleSheet.create({
    modalView: {
        // justifyContent: 'flex-end',
        // margin: 0,
    },
    topborder: {
        backgroundColor: Colors.Gray,
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
    firstView: {
        flex: 1,
        height: '100%',
        width: SCREEN_WIDTH,
        alignItems: 'center',
    },
    firstSubView: {
        position: 'absolute',
        top: hp(1.5),
        right: wp(2.5),
        left: 0,
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
    },
    giftButtonView: {
        flexDirection: 'row',
        backgroundColor: Colors.Black,
        justifyContent: 'center',
        padding: wp(2.5),
        paddingVertical: hp(0.5),
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
    },
    giftIcon: {
        width: wp(5),
        height: wp(5),
        backgroundColor: Colors.White,
        borderRadius: 10,
        padding: hp(0.2),
        marginLeft: wp(2.5),
    },
    infoButtonView: {
        flexDirection: 'row',
        backgroundColor: Colors.Black,
        justifyContent: 'center',
        padding: hp(0.4),
        borderRadius: 20,
    },
    infoIcon: {
        width: wp(5),
        height: wp(5),
        backgroundColor: Colors.White,
        borderRadius: wp(2.5),
        padding: hp(0.2),
    },
    scratchMainView: {
        marginBottom: wp(5),
        borderRadius: wp(2.5),
        overflow: 'hidden',
        backgroundColor: Colors.White,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    scratchView: {
        width: wp(62.5),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0,
        borderColor: Colors.APP_LIGHT_GRAY_COLOR,
        backgroundColor: Colors.APP_LIGHT_GRAY_COLOR,
        borderRadius: wp(2.5),
    },
    scratchSubView: {
        width: wp(62.5),
        height: hp(14),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0,
        borderColor: 'transparent',
        borderRadius: wp(2.5),
    }
})
