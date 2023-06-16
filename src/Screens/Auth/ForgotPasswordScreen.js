import React, { useRef, useState } from 'react';
import { View, Keyboard, Pressable, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { errorMessage, successMessage } from '../../Actions';
import LoadingButton from '../../Components/LoadingButton';
import Logo from '../../Components/Logo';
import ScreenWrapper from '../../Components/ScreenWrapper';
import Text from '../../Components/Text';
import TextInput from '../../Components/TextInput';
import { emailValidationRegex, PLATFORM_IOS, SCREEN_HEIGHT } from '../../Constants';
import { hp, wp } from '../../Helper/ResponsiveScreen';
import Lang from '../../Languages/LanguageStr';
import { LMSText } from '../../Languages/LMSText';
import { Colors } from '../../Styles/Colors';
import { recoverPassword } from '../../Utils/functions';

const ForgotPasswordScreen = (props) => {
  const _recoverButton = useRef()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState(props?.route?.params?.email || '')

  const _recover = async () => {
    if (emailValidationRegex.test(email)) {
      _recoverButton?.current?.showLoading();
      setLoading(true);
      const res = await recoverPassword(email);
      if (res && res?.data && res?.data?.message) {
        successMessage(res.data.message);
        props.navigation.goBack();
      } else if (
        res &&
        res?.error &&
        res?.error?.status == 403 &&
        res?.error?.data &&
        res?.error?.data?.message
      ) {
        //when requesting reset 2nd time it gives error with 403
        errorMessage(res?.data?.message);
        props.navigation.goBack();
      } else if (
        res &&
        res?.error &&
        res?.error?.status == 400 &&
        res?.error?.data['hydra:description']
      ) {
        errorMessage(res?.error?.data['hydra:description']);
      }
      setLoading(false);
      _recoverButton?.current?.hideLoading();
    } else {
      errorMessage(LMSText(Lang.auth.enterValidEmailAddress));
    }
  };

  return (
    <ScreenWrapper withBg>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ alignItems: 'center' }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
      >
        <View
          style={styles.mainContent}>
          <View style={styles.logoAndTextContent}>
            <Logo />
            <Text
              style={{
                color: Colors.FONT_TRANS_GRAY_COLOR,
                fontWeight: 'bold',
                fontSize: 22,
                marginBottom: hp(2)
              }}>
              Mot de passe oublié
            </Text>
            <Text
              style={{
                color: Colors.FONT_TRANS_GRAY_COLOR,
                fontSize: PLATFORM_IOS ? 14 : 12,
                marginBottom: hp(2),
                textAlign: 'center'
              }}>
                Entrez l'adresse email associé à votre compte EasyWin et recevez un lien
              <Text style={{ fontWeight: 'bold' }}>
                pour définir un nouveau mot de passe.
              </Text>{' '}
            </Text>
          </View>
          <View>
            <TextInput
              placeholder="Adresse e-mail"
              style={{ marginBottom: hp(2) }}
              onChangeText={email => setEmail(email)}
              value={email}
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            <LoadingButton
              ref={_recoverButton}
              disabled={loading}
              onPress={() => _recover()}
              title={'Réinitialiser le mot de passe'}
              titleStyle={styles.recoverButtonText}
            />
            <Pressable
              disabled={loading}
              onPress={() => props.navigation.navigate('SigninScreen')}
              style={styles.RetourButton}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '400',
                  color: Colors.FONT_TRANS_GRAY_COLOR,
                  textDecorationLine: 'underline'
                }}>
                Retour
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  mainContent: {
    height: SCREEN_HEIGHT * 0.9,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoAndTextContent: {
    flex: 1,
    marginHorizontal: wp(8),
    alignItems: 'center',
    justifyContent: 'center'
  },
  RetourButton: {
    alignSelf: 'center',
    marginVertical: hp(2)
  },
  recoverButtonText: {
    color: Colors.FONT_BLUE_COLOR,
    fontWeight: '500',
    fontSize: PLATFORM_IOS ? 20 : 18,
  }
})

export default ForgotPasswordScreen;
