import React from 'react';
import { Text as RNText, Platform } from 'react-native';
import { DEFAULT_FONT_SIZE } from '../Constants';
import { Colors } from '../Styles/Colors';

export default (Text = props => {
  let finalFontSize = DEFAULT_FONT_SIZE;
  let _fontFamily =
    Platform.OS === 'android' ? 'Montserrat-Regular' : 'Montserrat';
  if (
    Platform.OS == 'android' &&
    props.style &&
    props.style.fontFamily == undefined &&
    props.style.fontWeight
  ) {
    if (props.style.fontWeight == '400') {
      _fontFamily = 'Montserrat-SemiBold';
    }
    if (props.style.fontWeight == '700') {
      _fontFamily = 'Montserrat-Bold';
    }
    if (props.style.fontWeight == 'bold') {
      _fontFamily = 'Montserrat-ExtraBold';
    }
    delete props.style.fontWeight;
  }

  if (props.style && props.style.forceFontSize) {
    finalFontSize = props.style.forceFontSize;
    delete props.style.forceFontSize;
  } else if (props.style && props.style.fontSize) {
    finalFontSize = props.style.fontSize;
  }

  return (
    <RNText
      {...props}
      style={{
        fontFamily: _fontFamily,
        color: Colors.FONT_TRANS_GRAY_COLOR,
        ...props.style,
        fontSize: finalFontSize,
      }}>
      {props.children}
    </RNText>
  );
});
