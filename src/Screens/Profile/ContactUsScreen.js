import { Image, Linking, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useRef, useState } from 'react'
import ScreenWrapper from '../../Components/ScreenWrapper'
import { hp, wp } from '../../Helper/ResponsiveScreen'
import { Images } from '../../Utils/images'
import { Colors } from '../../Styles/Colors'
import commonStyles from '../../Styles/index'
import LoadingButton from '../../Components/LoadingButton'
import Text from '../../Components/Text'
import { apiPost } from '../../Utils/functions'
import { errorMessage, successMessage } from '../../Actions'
import { LMSText } from '../../Languages/LMSText'
import TextInput from '../../Components/TextInput'
import Lang from '../../Languages/LanguageStr'

const ContactUsScreen = (props) => {

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const _sendMessageButton = useRef();

    const sendMessage = async () => {
        if (message) {
            setLoading(true)
            _sendMessageButton?.current?.showLoading();
            const data = { message };
            let res = await apiPost('/post_contact_us', data);
            setLoading(false)
            _sendMessageButton?.current?.hideLoading();
            if (res && res?.data) {
                successMessage(
                    res?.data?.message
                        ? res?.data?.message
                        : LMSText(Lang.app.messageSentSuccessfully),
                );
                props?.navigation?.goBack();
            } else {
                errorMessage(LMSText(Lang.app.couldNotSendMessage));
            }
        } else {
            errorMessage(LMSText(Lang.app.messageEmpty));
        }
    };

    return (
        <ScreenWrapper contentContainerStyle={commonStyles.screenWrapperContent}>
            <View style={{ marginHorizontal: wp(5) }}>
                <View style={styles.row}>
                    <TouchableOpacity
                        disabled={loading}
                        onPress={() => props.navigation.goBack()}>
                        <Image source={Images.BACK_ICON} style={styles.icon} />
                    </TouchableOpacity>
                    <Text style={{
                        color: Colors.Black,
                        fontSize: 16,
                        fontWeight: 'bold'
                    }}>
                        CONTACT
                    </Text>
                    <View style={styles.icon} />
                </View>
                <View style={{ marginTop: hp(4), alignItems: 'center' }}>
                    <Text
                        style={{
                            color: Colors.Black,
                            fontSize: 14,
                            fontWeight: '700',
                            marginBottom: hp(2),
                        }}>
                        Envoyez votre message ici :
                    </Text>
                    <TextInput
                        onChangeText={message => setMessage(message)}
                        value={message}
                        multiline
                        style={{ ...commonStyles.textWhiteBgStyle, height: hp(25) }}
                        textInputStyle={{
                            ...commonStyles.textWhiteBgTextStyle,
                            height: hp(25),
                            textAlignVertical:'top',
                            paddingTop: hp(1),
                            paddingBottom: hp(1),
                        }}
                        placeholder={'Écrire un message …'}
                    />
                    <LoadingButton
                        disabled={loading}
                        ref={_sendMessageButton}
                        title={'ENVOYER'}
                        style={{ backgroundColor: Colors.APP_COLOR }}
                        loadingColor="white"
                        titleStyle={{ color: Colors.White, fontSize: 18, fontWeight: 'bold' }}
                        onPress={() => sendMessage()}
                    />
                    <Text style={{
                        color: Colors.Black,
                        fontWeight: '700',
                        marginTop: hp(3),
                        marginBottom: hp(2)
                    }}>ou sur nos réseaux sociaux</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => Linking.openURL('https://www.instagram.com/easywin_io/')}>
                            <Image source={Images.INSTA_GRAY_ICON} style={styles.socialIcons} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => Linking.openURL('https://www.facebook.com/easywinio/')}>
                            <Image source={Images.FACEBOOK_GRAY_ICON} style={styles.socialIcons} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => Linking.openURL('https://twitter.com/EasyWin_io')}>
                            <Image source={Images.TWITTER_GRAY_ICON} style={styles.socialIcons} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScreenWrapper>
    )
}

export default ContactUsScreen

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    icon: {
        alignSelf: 'flex-end',
        width: wp(8),
        height: wp(8),
    },
    socialIcons: {
        height: wp(17),
        width: wp(17)
    },
})