import React, { useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Image,
  StatusBar,
  StyleSheet
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { PLATFORM_IOS, STATUSBAR_HEIGHT, wp } from '../Helper/ResponsiveScreen';
import { Images } from '../Utils/images';

const ScreenWrapper = ({ withBg, children, contentContainerStyle }) => {
  useEffect(() => {
    if (withBg) {
      StatusBar.setBarStyle('light-content');
    } else {
      StatusBar.setBarStyle('dark-content');
    }
  }, [])


  return (
    <>
      {withBg ?
        <View style={styles.withBgContent}>
          <LinearGradient
            colors={['#04249B', '#2B74E7']}
            style={styles.linearStyle}>
            <Image
              source={Images.bggifts}
              style={styles.bggiftsImg}
            />
            <SafeAreaView
              style={{ flex: 1, ...contentContainerStyle }}>
              {children}
            </SafeAreaView>
          </LinearGradient>
        </View>
        :
        <SafeAreaView
          style={[styles.withOutBgContent, { ...contentContainerStyle }]}>
          {children}
        </SafeAreaView>}
    </>
  );
}

const styles = StyleSheet.create({
  withBgContent: {
    flex: 1
  },
  linearStyle: {
    flex: 1,
    paddingTop: PLATFORM_IOS ? 0 : STATUSBAR_HEIGHT,
  },
  bggiftsImg: {
    width: wp(100),
    position: 'absolute',
    top: 0
  },
  withOutBgContent: {
    flex: 1,
    paddingTop: PLATFORM_IOS ? 0 : STATUSBAR_HEIGHT
  }
});

export default ScreenWrapper;
