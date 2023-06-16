import React, { useState } from 'react'
import { Image, StyleSheet, TouchableOpacity } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { hp, wp } from '../../Helper/ResponsiveScreen'
import { Colors } from '../../Styles/Colors'
import { Images } from '../../Utils/images'
import Text from '../Text'

const NormalClaimRewardButton = (props) => {
  const [normalRewardClaim, setNormalRewardClaim] = useState(false)
  const [isShowDoubler, setIsShowDoubler] = useState(false)

  let normalRewardClaimButtonColors = ['#FFDB0F', '#FFB406'];
  if (normalRewardClaim) {
    normalRewardClaimButtonColors = ['gray', 'silver'];
  }

  return (
    <>
      <TouchableOpacity
        style={styles.bottomStyle}
        disabled={normalRewardClaim}
        onPress={() => {
          props?.onPress();
          setNormalRewardClaim(true)
          setIsShowDoubler(true)
        }}>
        <LinearGradient
          colors={normalRewardClaimButtonColors}
          style={styles.linearStyle}>
          <Image
            source={Images.HAND_UP_ICON}
            style={styles.imageIcon}
          />
          <Text style={{
            color: Colors.Black,
            fontSize: 18,
            fontWeight: '700'
          }}>
            RÉCOLTER
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Doubler */}
      {isShowDoubler && (
        <TouchableOpacity
          style={styles.bottomStyle}
          onPress={() => {
            //playVideo
            props?.DoublerClick();
          }}>
          <LinearGradient
            colors={['#FFDB0F', '#FFB406']}
            style={styles.linearStyle}>
            <Image
              source={Images.VIDEO_PLAY_ICON}
              style={styles.imageIcon}
            />
            <Text style={{
              color: Colors.Black,
              fontSize: 18,
              fontWeight: '700'
            }}>
              DOUBLER
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </>
  )
}

export default NormalClaimRewardButton

const styles = StyleSheet.create({
  bottomStyle: {
    marginBottom: hp(1.5)
  },
  linearStyle: {
    flexDirection: 'row',
    padding: wp(2.5),
    paddingHorizontal: wp(5),
    borderRadius: 40,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIcon: {
    height: wp(5),
    width: wp(5),
    marginRight: wp(2.5)
  }
})