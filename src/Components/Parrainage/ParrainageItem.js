import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SERVER_BASE } from '../../Constants'
import { hp, wp } from '../../Helper/ResponsiveScreen';
import { Colors } from '../../Styles/Colors';
import { Images } from '../../Utils/images';
import CustomImage from '../CustomImage';

const ParrainageItem = ({ item }) => {
    const { firstname, lastname, username, avatarUrl } = item;
    return (
        <View
            style={styles.content}>
            <CustomImage
                source={
                    avatarUrl
                        ? { uri: `${SERVER_BASE}${avatarUrl}` }
                        : Images.PROFILE_ICON
                }
                style={styles.customImgStyle}
            />
            <View>
                <Text
                    style={{ color: Colors.Black, fontSize: 14, fontWeight: '700' }}>
                    {`${firstname && lastname
                        ? lastname + ' ' + firstname
                        : lastname
                            ? lastname
                            : firstname
                                ? firstname
                                : username
                        }`}
                </Text>
            </View>
        </View>
    )
}

export default ParrainageItem;

const styles = StyleSheet.create({
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: hp(2),
    },
    customImgStyle: {
        height: wp(10),
        width: wp(10),
        marginRight: wp(2),
    }
})