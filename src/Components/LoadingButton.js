import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Colors } from '../Styles/Colors'
import {
  ActivityIndicator,
  View,
  Pressable,
  StyleSheet
} from 'react-native';
import { hp, wp } from '../Helper/ResponsiveScreen';
import Text from './Text';

const LoadingButton = (props, ref) => {
  const [isLoading, setIsLoading] = useState(false)

  useImperativeHandle(ref, () => ({
    showLoading: () => setIsLoading(true),
    hideLoading: () => setIsLoading(false)
  }));

  return (
    <Pressable
      disabled={props.disabled}
      style={{ ...styles.button, ...props.style }}
      activeOpacity={0.7}
      onPress={!isLoading ? props.onPress : null}
    >
      <>
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={props.loadingColor || Colors.APP_LOADER_COLOR}
          />
        ) : (
          <>
            {props.leftComponent ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  ...props.leftComponentContainerStyle,
                }}>
                {props.leftComponent}
                <Text style={{ ...styles.title, ...props.titleStyle, fontWeight: '500' }}>
                  {props.title}
                </Text>
              </View>
            ) : (
              <Text style={{ ...styles.title, ...props.titleStyle, fontWeight: '500' }}>
                {props.title}
              </Text>
            )}
          </>
        )}
      </>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    width: wp(100) * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    height: hp(5),
    borderRadius: 22,
    backgroundColor: Colors.White,
    marginBottom: hp(2),
  },
  title: {
    fontSize: 21,
    color: Colors.FONT_BLACK_COLOR,
  },
});

export default forwardRef(LoadingButton);