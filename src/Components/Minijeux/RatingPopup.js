import AsyncStorage from '@react-native-community/async-storage'
import React, { useState } from 'react'
import { Linking, View } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { hp, PLATFORM_IOS, wp } from '../../Helper/ResponsiveScreen'
import { apiPost } from '../../Utils/functions'
import { Images } from '../../Utils/images'
import PopupBase from '../PopupBase'
import TextInput from '../TextInput'
import commonStyles from '../../Styles/index';
import Stars from 'react-native-stars';

const RatingPopup = () => {
    const [userRating, setUserRating] = useState(5)
    const [messageBox, setMessageBox] = useState(false)
    const [message, setMessage] = useState('')

    const onCallRating = async () => {
        let appVersion = DeviceInfo.getVersion();
        let buildNumber = DeviceInfo.getBuildNumber();
        const apiLevel = await DeviceInfo.getApiLevel();
        let brandName = DeviceInfo.getBrand();
        let modelName = PLATFORM_IOS
            ? DeviceInfo.getDeviceId()
            : DeviceInfo.getModel();

        await AsyncStorage.setItem('RATING_POPUP_SHOWN', 'yes');
        if (userRating > 3) {
            if (PLATFORM_IOS) {
                Linking.openURL('https://www.apple.com/app-store/');
            } else {
                Linking.openURL('https://play.google.com/store/apps');
            }
        } else {
            //use contact us api to send message if bad rating
            let res = await apiPost('/post_contact_us', {
                message: message,
                rating: userRating,
                appVersion,
                buildNumber,
                apiLevel,
                brandName,
                modelName,
            });
        }
    };

    return (
        <PopupBase
            popupStyle={{ minHeight: undefined, maxHeight: undefined }}
            description={"Que pensez-vous d'EasyWin ?"}
            descriptionStyle={{
                fontSize: 18,
                fontWeight: 'bold',
                marginTop: hp(3),
            }}
            onClose={async () =>
                await AsyncStorage.setItem(
                    'FIRST_BOOT',
                    Number(new Date()).toString(),
                )
            }
            onButtonPress={() => onCallRating()}
            buttonTitle="Soumettre">
            <View>
                <Stars
                    default={5}
                    update={userRating => {
                        setUserRating(userRating)
                        setMessageBox(userRating < 4)
                    }}
                    count={5}
                    half={false}
                    starSize={50}
                    fullStar={Images.STAR_ACTIVE_ICON}
                    emptyStar={Images.STAR_ICON}
                />
                {messageBox && (
                    <TextInput
                        onChangeText={message => setMessage(message)}
                        value={message}
                        multiline
                        style={{ ...commonStyles.textWhiteBgStyle, height: hp(10), width: wp(75) }}
                        textInputStyle={{
                            ...commonStyles.textWhiteBgTextStyle,
                            height: hp(10),
                            paddingTop: PLATFORM_IOS ? hp(1.2) : hp(0),
                            width: wp(70)
                        }}
                        placeholder={'Notre équipe est à votre écoute, dites nous tout!'}
                    />
                )}
            </View>
        </PopupBase>
    )
}

export default RatingPopup