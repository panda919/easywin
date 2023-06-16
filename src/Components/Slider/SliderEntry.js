import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import CustomImage from '../CustomImage';
import { SERVER_BASE } from '../../Constants';
import { Images } from '../../Utils/images';
import { hp, wp } from '../../Helper/ResponsiveScreen';
import { Colors } from '../../Styles/Colors';
import Text from '../Text';

const SliderEntry = (props) => {
  const {
    item,
    sliderLink,
    onRulesPress,
    onPressSliderLink,
  } = props;

  return (
    <View style={{}}>
      <CustomImage
        source={{ uri: `${SERVER_BASE}${item?.contentUrl}` }}
        style={styles.customViewStyle}
        imageStyle={styles.customViewImageStyle}
        contentContainerStyle={styles.customContainerStyle}>
        <View
          style={styles.imagePositionView}>
          {!!sliderLink ? (
            <TouchableOpacity onPress={onPressSliderLink}>
              <View
                style={styles.giftView}>
                <Text>VOIR LE PRODUIT</Text>
                <Image
                  source={Images.BLACK_GIFT_ICON}
                  style={styles.giftIcon}
                />
              </View>
            </TouchableOpacity>
          ) : (
            <View />
          )}
          <TouchableOpacity
            onPress={() => {
              onRulesPress('https://www.easy-win.io/reglement-concours-1');
            }}>
            <View
              style={styles.infoView}>
              <Image
                source={Images.INFO_ICON}
                style={styles.infoIcon}
              />
            </View>
          </TouchableOpacity>
        </View>
      </CustomImage>
    </View>
  );
}

export default SliderEntry;

const styles = StyleSheet.create({
  customContainerStyle: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  customViewStyle: {
    width: wp(100),
    height: hp(28),
    borderRadius: 0,
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
  },
  customViewImageStyle: {
    width: wp(100),
    height: hp(28),
    resizeMode: 'cover',
    borderRadius: 0,
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
  },
  imagePositionView: {
    position: 'absolute',
    top: hp(1.5),
    right: wp(2.5),
    left: 0,
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  giftView: {
    flexDirection: 'row',
    backgroundColor: Colors.Black,
    justifyContent: 'center',
    padding: wp(2.5),
    paddingVertical: hp(0.5),
    borderTopRightRadius: wp(5),
    borderBottomRightRadius: wp(5),
  },
  giftIcon: {
    width: wp(5),
    height: wp(5),
    backgroundColor: Colors.White,
    borderRadius: wp(2.5),
    padding: hp(0.2),
    marginLeft: wp(2.5),
  },
  infoView: {
    flexDirection: 'row',
    backgroundColor: Colors.Black,
    justifyContent: 'center',
    padding: hp(0.4),
    borderRadius: wp(5),
  },
  infoIcon: {
    width: wp(5),
    height: wp(5),
    backgroundColor: Colors.White,
    borderRadius: wp(2.5),
    padding: hp(0.2),
  }
})
