import React, { Component, PureComponent } from 'react';
import { Image, View, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import Text from './Text';
import LinearGradient from 'react-native-linear-gradient';
import { SCREEN_HEIGHT } from '../Constants';
import { hidePopup } from '../Actions';
import { Images } from '../Utils/images';
import { Colors } from '../Styles/Colors';
import { hp, wp } from '../Helper/ResponsiveScreen';

const PopupBase = props => {
  const {
    noAutoHide,
    imgSrc,
    imageStyle,
    popupStyle,
    title,
    description,
    descriptionStyle,
    onButtonPress,
    buttonIcon,
    onClose,
    buttonTitle,
  } = props;
  return (
    <View
      style={{
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.White,
        width: wp(85),
        minHeight: SCREEN_HEIGHT / 3.5,
        maxHeight: SCREEN_HEIGHT / 2,
        backgroundColor: Colors.White,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: hp(2),
        ...popupStyle,
      }}>
      <Pressable
        onPress={() => {
          if (onClose && typeof onClose === 'function') {
            onClose();
          }
          hidePopup();
          if (noAutoHide) {
            return null;
          }
        }}
        style={{ position: 'absolute', right: 0 }}>
        <Image source={Images.VIDEO_CROSS_ICON} style={{ height: wp(11), width: wp(11) }} />
      </Pressable>
      {imgSrc && (
        <Image
          source={imgSrc}
          style={{
            width: wp(22),
            height: wp(22),
            marginTop: -hp(5),
            ...imageStyle,
          }}
          resizeMode="contain"
        />
      )}

      {title && (
        <Text
          style={{
            color: Colors.Black,
            marginVertical: hp(1),
            fontSize: 17,
            fontWeight: 'bold',
            textAlign: 'center',
          }}>
          {title}
        </Text>
      )}
      {description && (
        <Text
          style={{
            color: Colors.Black,
            marginTop: hp(2),
            marginBottom: hp(1),
            fontSize: 13,
            fontWeight: '700',
            textAlign: 'center',
            ...descriptionStyle,
          }}>
          {description}
        </Text>
      )}
      {props.children}
      {onButtonPress && (
        <TouchableOpacity
          onPress={() => {
            onButtonPress();
            if (noAutoHide) {
              return null;
            }
            hidePopup();
          }}>
          <LinearGradient
            colors={['#FFDB0F', '#FFB406']}
            style={styles.linearStyle}>
            {buttonIcon && (
              <Image
                source={buttonIcon}
                style={styles.buttonIconStyle}
              />
            )}
            <Text
              style={{
                color: Colors.Black,
                fontSize: 17,
                fontWeight: '700',
                textAlign: 'center',
              }}>
              {buttonTitle}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default PopupBase;

const styles = StyleSheet.create({
  linearStyle: {
    flexDirection: 'row',
    padding: wp(2.5),
    paddingHorizontal: wp(5),
    borderRadius: 40,
    marginVertical: hp(2.6),
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIconStyle: {
    height: wp(6),
    width: wp(6),
    marginRight: wp(2.5),
  }
})
