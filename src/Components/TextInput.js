import React from 'react';
import { TextInput as RNTextInput, View } from 'react-native';
import { Colors } from '../Styles/Colors';
import { hp, PLATFORM_IOS, wp } from '../Helper/ResponsiveScreen';
import { DEFAULT_FONT_SIZE } from '../Constants';

const TextInput = props => {
  let finalFontSize = DEFAULT_FONT_SIZE;
  if (props.style && props.style.forceFontSize) {
    finalFontSize = props.style.forceFontSize;
  } else if (props.style && props.style.fontSize) {
    finalFontSize = props.style.fontSize;
  }
  // useEffect(() => {
  //   return () => {
  //     ImmersiveMode.fullLayout(true);
  //     ImmersiveMode.setBarMode('BottomSticky');
  //   };
  // }, []);

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        borderColor: Colors.White,
        borderWidth: 2,
        borderRadius: 22,
        width: wp(100) * 0.8,
        backgroundColor: Colors.InputBgColor,
        height: PLATFORM_IOS ? hp(5) : hp(5.5),
        paddingHorizontal: wp(2.5),
        ...props.style,
      }}>
      <RNTextInput
        ref={props.setRef}
        spellCheck={false}
        autoCorrect={false}
        autoCapitalize={'none'}
        editable={props.editable}
        placeholderTextColor={
          props.placeholderTextColor
            ? props.placeholderTextColor
            : Colors.PLACEHOLDER_COLOR
        }
        underlineColorAndroid={'transparent'}
        {...props} //props aboove this will act like default, position is important
        style={{
          fontFamily: 'Montserrat',
          color: Colors.FONT_LIGHT_GRAY_COLOR,
          width: wp(85),
          borderWidth: 0,
          padding: 0,
          ...props.textInputStyle,
          fontSize: finalFontSize,
        }}
      />
      {props.rightComponent && props.rightComponent}
    </View>
  );
};

export default TextInput