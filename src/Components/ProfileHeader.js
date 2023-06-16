import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Text from './Text'
import { Images } from '../Utils/images'
import { Colors } from '../Styles/Colors'
import { wp } from '../Helper/ResponsiveScreen'
import { useNavigation } from '@react-navigation/native'
import Loader from './Loader'

const ProfileHeader = ({ backDisabled, title, checkDisabled, checkPress, loading, type }) => {
    const navigation = useNavigation();
    return (
        <View style={styles.row}>
            <TouchableOpacity
                disabled={backDisabled}
                onPress={() => type ? navigation.navigate({ name: 'ConcoursScreen', params: { type: type }, merge: true }) : navigation.goBack()}>
                <Image source={Images.BACK_ICON} style={styles.icons} />
            </TouchableOpacity>
            {title && <Text style={{
                color: Colors.Black,
                fontSize: 16,
                fontWeight: 'bold'
            }}>{title}</Text>}
            <TouchableOpacity
                disabled={checkDisabled}
                onPress={checkPress}>
                {loading ? (
                    <Loader style={styles.icons} />
                ) : (
                    <Image source={Images.BLUE_CHECK_ICON} style={styles.icons} />
                )}
            </TouchableOpacity>
        </View>
    )
}

export default ProfileHeader

const styles = StyleSheet.create({
    icons: {
        alignSelf: 'flex-end',
        width: wp(9),
        height: wp(9),
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }
})