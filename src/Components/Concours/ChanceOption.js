import React from 'react'
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { hp, wp } from '../../Helper/ResponsiveScreen';
import { Colors } from '../../Styles/Colors';
import { Images } from '../../Utils/images';
import Text from '../Text';

const ChanceOption = ({ title, availed, alwaysEnabled, onPress, video }) => {
  return (
    <TouchableOpacity disabled={availed && !alwaysEnabled} onPress={onPress}>
      <View
        style={styles.chanceContent}>
        <View
          style={styles.greenCheckView}>
          {availed && (
            <Image
              source={Images.GREEN_CHECK_ICON}
              style={styles.greenCheckIcon}
              resizeMode="stretch"
            />
          )}
        </View>
        <View style={styles.titleView}>
          <Text style={{
            color: Colors.Black,
            fontSize: 16,
            fontWeight: '600'
          }}>
            {title}
          </Text>
        </View>
        {video && (
          <View style={styles.videoContent}>
            <Text
              style={{
                fontWeight: '700',
                color: Colors.Black,
                paddingRight: hp(0.4)
              }}>
              1
            </Text>
            <Image
              source={Images.LIGHTNING_BLUE_FILLED_ICON}
              style={styles.lightningBlueIcon}
            />
          </View>
        )}
        <Image
          source={Images.CHEVRON_RIGHT_ICON}
          style={styles.chevronIcon}
        />
      </View>
    </TouchableOpacity>
  );
};

export default ChanceOption

const styles = StyleSheet.create({
  chanceContent: {
    paddingBottom: hp(1),
    marginTop: hp(1.6),
    borderBottomColor: Colors.APP_TAB_GRAY_COLOR,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenCheckView: {
    height: wp(5.5),
    width: wp(5.5),
    borderRadius: 13,
    borderWidth: 1,
    borderColor: Colors.DARK_GRAY,
    justifyContent: 'center',
    alignItems: 'center'
  },
  greenCheckIcon: {
    width: '125%',
    height: '125%'
  },
  titleView: {
    flex: 1,
    marginLeft: wp(2.5)
  },
  videoContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  lightningBlueIcon: {
    height: wp(6),
    width: wp(4)
  },
  chevronIcon: {
    height: wp(5),
    width: wp(5)
  }
})