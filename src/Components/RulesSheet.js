import React from 'react'
import { Image, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import Modal from "react-native-modal";
import { hp, isX, PLATFORM_IOS, wp } from '../Helper/ResponsiveScreen';
import { Colors } from '../Styles/Colors';
import { WebView } from 'react-native-webview';
import { Images } from '../Utils/images';
import { SCREEN_HEIGHT } from '../Constants';

const RulesSheet = (props) => {
    console.log('RulesSheet=======')
    const { extraMargin = 0 } = props
    return (
        <Modal
            isVisible={props?.isRulesSheetOpen}
            swipeDirection={'down'}
            useNativeDriverForBackdrop={true}
            statusBarTranslucent
            onSwipeComplete={props?.onClose}
            style={styles.modalView}>
            <View>
                <View style={[styles.bottomSheetContainer, { height: SCREEN_HEIGHT - extraMargin }]}>
                    <View style={{ flex: 1 }}>
                        <WebView
                            startInLoadingState={true}
                            originWhitelist={['*']}
                            style={{
                                flex: 1,
                                borderTopLeftRadius: wp(5),
                                borderTopRightRadius: wp(5),
                                paddingTop: hp(1),
                            }}
                            source={{ uri: props?.rulesLink }}
                        />
                    </View>
                    <TouchableWithoutFeedback
                        hitSlop={{ top: wp(5), left: wp(5), right: wp(5), bottom: wp(5) }}
                        onPress={() => {
                            // rules sheet close
                            props?.onClose()
                        }}>
                        <View
                            style={styles.backIconView}>
                            <Image
                                source={Images.BACK_ICON}
                                style={styles.backIcon}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </View>
        </Modal>
    )
}

export default RulesSheet

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
        width: wp(100),
        alignSelf: 'center',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        backgroundColor: Colors.White,
        overflow: 'hidden'
    },
    backIconView: {
        position: 'absolute',
        margin: wp(5),
        marginTop: PLATFORM_IOS ? isX ? wp(5) : wp(10) : wp(5),
        flexDirection: 'row',
        alignItems: 'center',
    },
    backIcon: {
        width: wp(10),
        height: wp(10)
    }
})