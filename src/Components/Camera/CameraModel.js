import React from 'react'
import { Image, Pressable, StatusBar, StyleSheet, View } from 'react-native'
import Modal from 'react-native-modal';
import { hp, wp } from '../../Helper/ResponsiveScreen';
import { Camera } from 'react-native-vision-camera';
import { Colors } from '../../Styles/Colors';
import { Images } from '../../Utils/images';

const CameraModel = (props) => {
    return (
        <Modal
            animationType="fade"
            visible={props?.isShow}
            onRequestClose={() => props?.onClose()}
            supportedOrientations={['landscape', 'portrait']}
        >
            <StatusBar translucent backgroundColor={Colors.Black} />
            <Camera
                style={{ height: hp(100) }}
                captureAudio={false}
                device={props?.device}
                isActive={true}
                photo={true}
                orientation={'landscapeRight'}
                ref={props?.camera}
            />

            {/* Go Back Button */}
            <View style={styles.backButtonView}>
                <Pressable onPress={() => props?.onClose()}>
                    <Image
                        source={Images.BACK_ICON}
                        style={styles.icons}
                    />
                </Pressable>
            </View>

            {/* Camera Click Button */}
            <View style={styles.cameraClickView} >
                <Pressable style={styles.cameraButton} onPress={() => props?.takePhoto()}>
                    <View style={styles.cameraButtonInnerView}></View>
                </Pressable>
            </View>
        </Modal>
    )
}

export default CameraModel

const styles = StyleSheet.create({
    backButtonView: {
        position: 'absolute',
        top: 0,
        left: 0
    },
    icons: {
        alignSelf: 'flex-end',
        width: wp(8),
        height: wp(8),
    },
    cameraClickView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    cameraButton: {
        position: 'absolute',
        bottom: hp(3),
        backgroundColor: Colors.APP_DARK_GRAY_COLOR,
        height: wp(18),
        width: wp(18),
        borderRadius: 50
    },
    cameraButtonInnerView: {
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        width: wp(16),
        height: wp(16),
        borderRadius: 50,
        alignSelf: 'center',
        top: hp(0.5),
        backgroundColor: Colors.APP_GRAY_COLOR
    }
})