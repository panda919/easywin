import React, { useState } from 'react'
import CheckBox from '@react-native-community/checkbox';
import { View, Image, Pressable, StyleSheet } from 'react-native';
import { hidePopup } from '../Actions';
import { Colors } from '../Styles/Colors';
import { Images } from '../Utils/images';
import LoadingButton from './LoadingButton';
import Text from './Text';
import { hp, wp } from '../Helper/ResponsiveScreen';

const AgeCheckPopup = ({ onButtonPress }) => {
  const [checkboxValue, setCheckboxValue] = useState(false)

  return (
    <View
      style={styles.mainContent}>
      <View>
        <Pressable
          onPress={() => {
            hidePopup();
          }}
          style={{ alignSelf: 'flex-end' }}>
          <Image
            source={Images.VIDEO_CROSS_ICON}
            style={styles.crossIconImage}
          />
        </Pressable>
        <View
          style={styles.checkBoxView}>
          <CheckBox
            disabled={false}
            value={checkboxValue}
            onValueChange={checkboxValue => setCheckboxValue(checkboxValue)}
            tintColors={{ true: Colors.White, false: Colors.White }}
            tintColor={Colors.White}
            onCheckColor={Colors.White}
            onTintColor={Colors.White}
          />
          <View style={styles.checkBoxTextView}>
            <Text>
              Je confirme être âgé de 18 ans ou plus et avoir lu et appouvé les conditions générales d'utilisation.
            </Text>
          </View>
        </View>
        <LoadingButton
          style={{
            marginTop: hp(3),
            backgroundColor: checkboxValue
              ? Colors.White
              : Colors.Gray,
          }}
          disabled={!checkboxValue}
          onPress={onButtonPress}
          title={'Créer un compte'}
          titleStyle={styles.buttonText}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  mainContent: {
    backgroundColor: Colors.APP_BLUE_COLOR,
    padding: wp(5),
    borderRadius: 20,
  },
  crossIconImage: {
    height: wp(11), width: wp(11)
  },
  checkBoxView: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    width: wp(100) * 0.8,
    marginLeft: wp(1),
  },
  checkBoxTextView: {
    marginLeft: wp(2.5),
    width: wp(65)
  },
  buttonText: {
    color: Colors.FONT_BLUE_COLOR,
    fontWeight: '500',
    fontSize: 21,
  }
})

export default AgeCheckPopup