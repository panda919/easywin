import { Image, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { hp, wp } from '../Helper/ResponsiveScreen'
import { Colors } from '../Styles/Colors'
import { Images } from '../Utils/images'

const ProfileOption = ({ title, onPress, style }) => {
  return (
    <TouchableOpacity disabled={!onPress} onPress={onPress}>
      <View
        style={{
          paddingBottom: hp(1),
          marginTop: hp(3),
          borderBottomColor: Colors.APP_TAB_GRAY_COLOR,
          borderBottomWidth: 1,
          flexDirection: 'row',
          alignItems: 'center',
          ...style,
        }}>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ color: Colors.Black, fontSize: 13 }}>
            {title}
          </Text>
        </View>
        <Image
          source={Images.CHEVRON_RIGHT_ICON}
          style={{ height: wp(5), width: wp(5) }}
        />
      </View>
    </TouchableOpacity>
  )
}

export default ProfileOption;