import React from 'react';
import { View, Image, StyleSheet, Pressable } from 'react-native';
import Text from './Text';
import { Colors } from '../Styles/Colors';
import { Images } from '../Utils/images';
import { hp, wp } from '../Helper/ResponsiveScreen';
import { PLATFORM_IOS } from '../Constants';

const WalletCard = ({ name, description, onPress }) => {
  return (
    <Pressable disabled={!onPress} onPress={onPress}>
      <View
        style={styles.Content}>
        <View
          style={styles.listView}>
          <Image
            style={styles.wheelIcon}
            source={Images.MISSION_WHEEL}
          />
          <View style={{ flex: 2 }}>
            <Text
              style={{
                paddingHorizontal: wp(4),
                fontSize: PLATFORM_IOS ? 13 : 11,
                fontWeight: '400',
                color: Colors.Black
              }}>
              {name}
            </Text>
            <Text
              style={{
                paddingHorizontal: wp(4),
                fontSize: PLATFORM_IOS ? 12 : 10,
                fontWeight: '300',
                color: Colors.APP_GRAY_COLOR,
                marginTop: hp(0.2)
              }}>
              {description}
            </Text>
          </View>
          <Image
            style={styles.rightIcon}
            source={Images.CHEVRON_RIGHT_ICON}
          />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  Content: {
    marginVertical: hp(0.5),
    marginHorizontal: wp(7),
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: Colors.APP_GRAY_COLOR,
  },
  listView: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    padding: wp(5),
  },
  wheelIcon: {
    height: wp(7),
    width: wp(7)
  },
  rightIcon: {
    height: wp(5.5),
    width: wp(5.5)
  }
})

export default WalletCard
