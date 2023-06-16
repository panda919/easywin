import React from 'react'
import { useNavigation } from '@react-navigation/native';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { hp, wp } from '../Helper/ResponsiveScreen';
import { errorMessage } from '../Actions';
import LinearGradient from 'react-native-linear-gradient';
import { Images } from '../Utils/images';
import Text from './Text';
import { Colors } from '../Styles/Colors';
import { useSelector } from 'react-redux'

const SocialFollowButton = (props) => {
    const navigation = useNavigation()
    const userReducer = useSelector((state) => state?.userReducer)

    const {
        competitionParticipationsDetail,
        URL,
        title,
        socialType,
        onFollowPress
    } = props;

    let availed = false;
    if (competitionParticipationsDetail[`follow${socialType}`]) availed = true;

    return (
        <View
            style={styles.socialView}>
            <TouchableOpacity
                onPress={() => {
                    if (!!!userReducer?.userProfile?.xp[`check${socialType}Account`]) {
                        props?.onSocialSheetClose()
                        props?.onChancesSheetClose()
                        navigation.navigate({
                            name: 'ProfileEditScreen',
                            params: { type: 'Social' },
                            merge: true,
                        });
                        errorMessage(
                            'Vous devez avant valider vos différents réseaux sociaux dans votre profil',
                        );
                    } else {
                        onFollowPress({
                            socialType,
                            URL,
                            follower_name: `${userReducer?.userProfile[socialType?.toLowerCase()]
                                }`,
                        });
                    }
                }}>
                <LinearGradient
                    colors={['#FFDB0F', '#FFB406']}
                    style={styles.linearStyle}>
                    {availed && (
                        <Image
                            source={Images.GREEN_CHECK_ICON}
                            style={styles.greenCheckIcon}
                            resizeMode="stretch"
                        />
                    )}
                    <Text style={{ color: Colors.Black, textAlign: 'center' }}>{title}</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    )
}

export default SocialFollowButton

const styles = StyleSheet.create({
    socialView: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp(2.3),
    },
    linearStyle: {
        marginVertical: hp(1),
        width: wp(100) * 0.8,
        borderRadius: 100,
        height: hp(5),
        justifyContent: 'center',
    },
    greenCheckIcon: {
        position: 'absolute',
        left: wp(5),
        width: wp(7.6),
        height: wp(7.6),
    }
})