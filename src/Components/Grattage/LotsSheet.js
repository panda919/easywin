import React from 'react'
import { Image, Linking, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import Modal from "react-native-modal";
import { Images } from '../../Utils/images';
import { Colors } from '../../Styles/Colors';
import { apiPut } from '../../Utils/functions';
import CustomImage from '../CustomImage';
import { SCREEN_HEIGHT, SERVER_BASE } from '../../Constants';
import { PLATFORM_IOS, hp, wp } from '../../Helper/ResponsiveScreen';

const LotsSheet = (props) => {
    let principalLots = [];
    let secondaireLots = [];
    if (props?.selectedScratchLots && props?.selectedScratchLots?.length) {
        props?.selectedScratchLots.forEach(lot => {
            if (lot?.lotCondition == 'gagnant') {
                principalLots.push(lot);
            } else {
                secondaireLots.push(lot);
            }
        });
    }

    return (
        <Modal
            isVisible={props?.isLotsSheetOpen}
            swipeDirection={'down'}
            useNativeDriverForBackdrop={true}
            statusBarTranslucent
            onSwipeComplete={props?.onClose}
            style={styles.modalView}>
            <View>
                <View style={styles.topborder} />
                <View style={styles.bottomSheetContainer}>
                    <TouchableWithoutFeedback
                        hitSlop={{ top: wp(5), left: wp(5), right: wp(5), bottom: wp(5) }}
                        onPress={() => {
                            // lots sheet close
                            props?.onClose();
                        }}>
                        <View
                            style={styles.backView}>
                            <Image
                                source={Images.BACK_ICON}
                                style={styles.backIcon}
                            />
                            <View style={styles.lotsTextView}>
                                <Text
                                    style={{
                                        fontSize: 16,
                                        fontWeight: '700',
                                        color: Colors.Black,
                                        textAlign: 'center',
                                        alignSelf: 'stretch',
                                        fontFamily: 'Montserrat-Bold',
                                    }}>
                                    LOTS À GAGNER
                                </Text>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                    <ScrollView>
                        {principalLots?.length > 0 && (
                            <Text
                                style={{
                                    color: Colors.Black,
                                    margin: wp(2.5),
                                    fontSize: 14,
                                    fontWeight: '400',
                                    fontFamily: 'Montserrat-Medium'
                                }}>
                                Lot principaux
                            </Text>
                        )}
                        {principalLots?.length > 0 &&
                            principalLots.map((lot) => {
                                const {
                                    name,
                                    quantity,
                                    media1Url,
                                    link,
                                } = lot;
                                return (
                                    <TouchableWithoutFeedback>
                                        <View style={styles.lotsListMain}>
                                            <View
                                                style={styles.lotsListContent}>
                                                <TouchableOpacity
                                                    disabled={!link}
                                                    onPress={async () => {
                                                        await apiPut(
                                                            `/competition_lots/${lot?.id}`,
                                                            { toIncrementSeeDetailLot: 1 },
                                                        );
                                                        Linking.openURL(link);
                                                    }}>
                                                    <CustomImage
                                                        source={
                                                            media1Url
                                                                ? { uri: `${SERVER_BASE}${media1Url}` }
                                                                : Images.DEFAULT_SOURCE
                                                        }
                                                        style={styles.media1UrlStyle}
                                                        imageStyle={{ resizeMode: 'cover' }}
                                                    />
                                                </TouchableOpacity>
                                                <View
                                                    style={styles.nameView}>
                                                    <Text
                                                        numberOfLines={2}
                                                        style={{
                                                            color: Colors.Black,
                                                            fontSize: 16,
                                                            fontWeight: '700',
                                                        }}>
                                                        {name}
                                                    </Text>
                                                    <Text
                                                        style={{
                                                            color: Colors.Gray2,
                                                            fontSize: 12,
                                                            marginTop: hp(0.5)
                                                        }}>
                                                        quantité : {quantity}
                                                    </Text>
                                                </View>
                                                <TouchableOpacity
                                                    disabled={!link}
                                                    onPress={async () => {
                                                        await apiPut(
                                                            `/competition_lots/${lot?.id}`,
                                                            { toIncrementSeeDetailLot: 1 },
                                                        );
                                                        Linking.openURL(link);
                                                    }}>
                                                    <View style={styles.voirView}>
                                                        <Text style={{
                                                            color: Colors.APP_BLUE_COLOR,
                                                            fontSize: 14,
                                                            fontWeight: '400',
                                                        }}>
                                                            VOIR
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </TouchableWithoutFeedback>
                                );
                            })}
                        {secondaireLots?.length > 0 && (
                            <Text style={{
                                color: Colors.Black,
                                margin: wp(2.5),
                                fontSize: 14,
                                fontWeight: '400',
                                fontFamily: 'Montserrat-Medium'
                            }}>
                                Lots secondaires
                            </Text>
                        )}
                        {secondaireLots?.length > 0 &&
                            secondaireLots.map((lot) => {
                                const {
                                    name,
                                    quantity,
                                    media1Url,
                                    link,
                                } = lot;
                                return (
                                    <TouchableWithoutFeedback>
                                        <View style={styles.lotsListMain}>
                                            <View
                                                style={styles.lotsListContent}>
                                                <CustomImage
                                                    source={
                                                        media1Url
                                                            ? { uri: `${SERVER_BASE}${media1Url}` }
                                                            : Images.DEFAULT_SOURCE
                                                    }
                                                    style={styles.media1UrlStyle}
                                                    imageStyle={{ resizeMode: 'cover' }}
                                                />
                                                <View style={styles.nameView}>
                                                    <Text
                                                        numberOfLines={2}
                                                        style={{
                                                            color: Colors.Black,
                                                            fontSize: 16,
                                                            fontWeight: '700',
                                                        }}>
                                                        {name}
                                                    </Text>
                                                    <Text style={{
                                                        color: Colors.Gray2,
                                                        fontSize: 12,
                                                        marginTop: hp(0.5)
                                                    }}>
                                                        quantité : {quantity}
                                                    </Text>
                                                </View>
                                                <TouchableOpacity
                                                    disabled={!link}
                                                    onPress={async () => {
                                                        await apiPut(
                                                            `/competition_lots/${lot?.id}`,
                                                            { toIncrementSeeDetailLot: 1 },
                                                        );
                                                        Linking.openURL(link);
                                                    }}>
                                                    <View style={styles.voirView}>
                                                        <Text style={{
                                                            color: Colors.APP_BLUE_COLOR,
                                                            fontSize: 14,
                                                            fontWeight: '400',
                                                        }}>
                                                            VOIR
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </TouchableWithoutFeedback>
                                );
                            })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    )
}

export default LotsSheet

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
    backView: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: wp(5),
    },
    backIcon: {
        width: wp(10),
        height: wp(10)
    },
    lotsTextView: {
        flex: 1,
        marginLeft: -wp(10)
    },
    lotsListMain: {
        padding: wp(2.5)
    },
    lotsListContent: {
        marginVertical: hp(1),
        marginLeft: wp(5),
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginHorizontal: wp(2.5)
    },
    media1UrlStyle: {
        height: wp(18.75),
        width: wp(18.75)
    },
    nameView: {
        justifyContent: 'center',
        marginLeft: wp(2.5),
        flex: 1,
    },
    voirView: {
        borderWidth: 1,
        borderColor: Colors.APP_BLUE_COLOR,
        borderRadius: 15,
        padding: hp(0.5),
        paddingHorizontal: wp(2)
    }
})