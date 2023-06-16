import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, Pressable, Linking } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Logo from '../../Components/Logo';
import ScreenWrapper from '../../Components/ScreenWrapper';
import TextInput from '../../Components/TextInput';
import { hp, wp } from '../../Helper/ResponsiveScreen';
import CheckBox from '@react-native-community/checkbox';
import LoadingButton from '../../Components/LoadingButton';
import { Colors } from '../../Styles/Colors';
import Text from '../../Components/Text';
import { hideBottomBar } from '../../Utils/functions';
import { emailValidationRegex } from '../../Constants';
import { errorMessage, hidePopup, showPopup, signUpWithEmailAndPasswordAction, successMessage } from '../../Actions';
import AgeCheckPopup from '../../Components/AgeCheckPopup';
import { LMSText } from '../../Languages/LMSText';
import { useDispatch } from "react-redux";
import Lang from '../../Languages/LanguageStr';

const SignupScreen = (props) => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false)
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sponsorCode, setSponsorCode] = useState('')
  const [policyCheckBox, setPolicyCheckBox] = useState(false)
  const [data_authorization, setData_authorization] = useState(false)

  const lastnameField = useRef();
  const emailField = useRef();
  const passwordField = useRef();
  const verifyPasswordField = useRef();
  const sponsorCodeField = useRef();
  const _signupButton = useRef();

  useEffect(() => {
    hideBottomBar();
    if (__DEV__) {
      setFirstname('testNom')
      setLastname('testPreNom')
      setEmail('testM1@netick.fr')
      setPassword('qwer')
    }

    return () => {
      hideBottomBar();
    }
  }, [])


  const _createUserWithEmailAndPassword = async () => {
    if (emailValidationRegex.test(email)) {
      if (firstname != '' && lastname != '') {
        if (password != '') {
            showPopup(
              <AgeCheckPopup
                onButtonPress={async () => {
                  _signupButton?.current?.showLoading();
                  setLoading(true);
                  hidePopup();
                  let res = await dispatch(signUpWithEmailAndPasswordAction({
                    loading,
                    firstname,
                    lastname,
                    email,
                    password,
                    data_authorization,
                    sponsorCode
                  }));
                  console.log('res.data=====', res.data)
                  if (res) {
                    _signupButton?.current?.hideLoading();
                    setLoading(false);
                    if (res.data && res.data.message) {
                      successMessage(res.data.message);
                      props.navigation.goBack();
                    }
                  } else {
                    _signupButton?.current?.hideLoading();
                    setLoading(false);
                  }
                }}
              />,
            );
        } else {
          errorMessage(LMSText(Lang.auth.passwordCannotBeEmpty));
        }
      } else {
        errorMessage(LMSText(Lang.auth.nameCannotBeEmpty));
      }
    } else {
      //Please enter a valid email address
      errorMessage(LMSText(Lang.auth.enterValidEmailAddress));
    }
  }

  return (
    <ScreenWrapper withBg>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        extraScrollHeight={hp(8)}
        contentContainerStyle={styles.keyBoardContainer}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid>
        <View />
        <Logo />
        <View>
          <TextInput
            placeholder="Prénom"
            style={styles.marginBottomStyle}
            onSubmitEditing={() => lastnameField.current.focus()}
            onChangeText={firstname => setFirstname(firstname)}
            value={firstname}
          />
          <TextInput
            setRef={lastnameField}
            placeholder="Nom"
            style={styles.marginBottomStyle}
            onSubmitEditing={() => emailField.current.focus()}
            onChangeText={lastname => setLastname(lastname)}
            value={lastname}
          />
          <TextInput
            setRef={emailField}
            placeholder="Adresse e-mail"
            autoCapitalize={'none'}
            style={styles.marginBottomStyle}
            onSubmitEditing={() => passwordField.current.focus()}
            onChangeText={email => setEmail(email)}
            value={email}
          />
          <TextInput
            setRef={passwordField}
            secureTextEntry
            autoCapitalize={'none'}
            placeholder="Mot de passe"
            style={styles.marginBottomStyle}
            onSubmitEditing={() => sponsorCodeField.current.focus()}
            onChangeText={password => setPassword(password)}
            value={password}
          />
          <TextInput
            setRef={sponsorCodeField}
            autoCapitalize={'none'}
            placeholder="Code de parrainage (facultatif)"
            style={styles.marginBottomStyle}
            onSubmitEditing={() => _createUserWithEmailAndPassword()}
            onChangeText={sponsorCode => setSponsorCode(sponsorCode)}
            value={sponsorCode}
          />
          <View
            style={styles.checkBoxView}>
            <CheckBox
              disabled={false}
              value={policyCheckBox}
              onValueChange={policyCheckBox =>
                setPolicyCheckBox(policyCheckBox)
              }
              tintColors={{ true: Colors.White, false: Colors.White }}
              tintColor={Colors.White}
              onCheckColor={Colors.White}
              onTintColor={Colors.White}
            />
            <View style={styles.checkBoxTextView}>
              <Text>
                J'accepte la{' '}
                <Text
                  style={{ textDecorationLine: 'underline' }}
                  onPress={() =>
                    Linking.openURL(
                      'https://www.easy-win.io/politique-confidentialite',
                    )
                  }>
                  politique de confidentialité
                </Text>{' '}
                du site EasyWin.
              </Text>
            </View>
          </View>
          <View
            style={[styles.checkBoxView, { marginTop: hp(1.2) }]}>
            <CheckBox
              disabled={false}
              value={data_authorization}
              onValueChange={data_authorization =>
                setData_authorization(data_authorization)
              }
              tintColors={{ true: Colors.White, false: Colors.White }}
              tintColor={Colors.White}
              onCheckColor={Colors.White}
              onTintColor={Colors.White}
            />
            <View style={styles.checkBoxTextView}>
              <Text>J’accepte que mes données soient utilisées.</Text>
            </View>
          </View>
          <LoadingButton
            ref={_signupButton}
            disabled={loading || !policyCheckBox}
            style={{
              marginTop: hp(2),
              backgroundColor: policyCheckBox
                ? Colors.White
                : Colors.Gray,
            }}
            title={'Créer un compte'}
            titleStyle={styles.signupButtonText}
            onPress={() => _createUserWithEmailAndPassword()}
          />
          <Pressable
            disabled={loading}
            onPress={() => props.navigation.navigate('SigninScreen')}
            style={{ alignSelf: 'center' }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '400',
                textDecorationLine: 'underline'
              }}>
              J’ai déjà un compte
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  keyBoardContainer: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'space-around',
  },
  marginBottomStyle: {
    marginBottom: hp(2)
  },
  checkBoxView: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    width: wp(100) * 0.8,
    marginLeft: wp(1),
  },
  checkBoxTextView: {
    marginLeft: wp(2.5),
    width: wp(65)
  },
  signupButtonText: {
    color: Colors.FONT_BLUE_COLOR,
    fontWeight: '500',
    fontSize: 21,
  },
});

export default SignupScreen;
