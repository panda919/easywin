import React from 'react'
import { Image, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import Header from '../../Components/Header'
import ScreenWrapper from '../../Components/ScreenWrapper'
import { wp, hp } from '../../Helper/ResponsiveScreen'
import { Images } from '../../Utils/images'
import commonStyles from '../../Styles/index'

const WheelSelectionScreen = ({ navigation }) => {
  return (
    <ScreenWrapper contentContainerStyle={commonStyles.screenWrapperContent}>
      <Header />
      <ScrollView
        style={{ marginTop: hp(1) }}
        contentContainerStyle={{ paddingBottom: hp(8) }}>
        <View style={styles.content}>
          <TouchableWithoutFeedback
            onPress={() =>
              navigation.navigate('WheelNormalScreen')
            }>
            <Image
              source={Images.WHEEL_NORMAL}
              resizeMode="contain"
              style={styles.wheelImg}
            />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={() =>
              navigation.navigate('WheelPremiumScreen')
            }>
            <Image
              source={Images.WHEEL_PREMIUM}
              resizeMode="contain"
              style={[styles.wheelImg, {
                marginTop: hp(2),
              }]}
            />
          </TouchableWithoutFeedback>
        </View>
      </ScrollView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center'
  },
  wheelImg: {
    width: wp(100),
    height: wp(100) * 0.8125
  }
})

export default WheelSelectionScreen