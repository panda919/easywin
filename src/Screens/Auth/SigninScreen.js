import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Image, StatusBar } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SplashScreen from 'react-native-splash-screen';
import LoadingButton from '../../Components/LoadingButton';
import Logo from '../../Components/Logo';
import ScreenWrapper from '../../Components/ScreenWrapper';
import TextInput from '../../Components/TextInput';
import { emailValidationRegex } from '../../Constants';
import { hp, wp } from '../../Helper/ResponsiveScreen';
import { Colors } from '../../Styles/Colors';
import { authWithGoogle, hideBottomBar } from '../../Utils/functions';
import { Images } from '../../Utils/images';
import {
    signInWithEmailAndPasswordAction,
    authSSOAction,
    fetchUserProfileAction,
    errorMessage,
    showPopup,
    hidePopup,
} from '../../Actions';
import { LMSText } from '../../Languages/LMSText';
import AgeCheckPopup from '../../Components/AgeCheckPopup';
import Text from '../../Components/Text';
import { useDispatch } from "react-redux";
import appleAuth from '@invertase/react-native-apple-authentication';
import Lang from '../../Languages/LanguageStr';

const SigninScreen = ({ navigation, route }) => {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isAppleLoading, setIsAppleLoading] = useState(false)

    const passwordField = useRef()
    const _signinButton = useRef()
    const _googleButton = useRef()
    const _facebookButton = useRef()

    const dispatch = useDispatch();

    useEffect(() => {
        // Anything in here is fired on component mount.
        SplashScreen.hide();
        StatusBar.setBarStyle('light-content');
        hideBottomBar();
        if (__DEV__) {
            // setEmail('testM1@netick.fr')
            // setPassword('qwer')
            setEmail('benny_sudibyo@outlook.com')
            setPassword('rgs213515')
        }

        return () => {
            // Anything in here is fired on component unmount.
            hideBottomBar();
        }
    }, [])

    const _signInWithEmailAndPassword = async (_email, _password) => {
        if (_email && _password) {
            email = _email;
            password = _password;
        }
        // signInWithEmailAndPassword
        if (emailValidationRegex.test(email)) {
            if (password != '') {
                setLoading(true)
                hidePopup();
                _signinButton?.current?.showLoading();
                let res = await dispatch(signInWithEmailAndPasswordAction({
                    email,
                    password,
                }));
                if (res) {
                    res = await dispatch(fetchUserProfileAction(true));
                    if (res) {
                        _signinButton?.current?.hideLoading();
                        setLoading(false)
                        if (res?.interests && res?.interests?.length > 0) {
                            navigation.navigate('Home');
                        } else {
                            navigation.navigate('UserPrefScreen');
                        }
                    } else {
                        _signinButton?.current?.hideLoading();
                        setLoading(false)
                    }
                } else {
                    _signinButton?.current?.hideLoading();
                    setLoading(false)
                }
            } else {
                errorMessage(LMSText(Lang.auth.passwordCannotBeEmpty));
            }
        } else {
            errorMessage(LMSText(Lang.auth.enterValidEmailAddress));
        }
    };

    const _doFacebookLogin = async () => {
    };

    const _doGoogleLogin = async () => {
        _googleButton?.current?.showLoading();
        setLoading(true)
        hidePopup();
        try {
            let user = await authWithGoogle();
            if (user && user.idToken) {
                let res = await dispatch(authSSOAction(user.idToken, 'google'));
                if (res) {
                    res = await dispatch(fetchUserProfileAction(true));
                    _googleButton?.current?.hideLoading();
                    setLoading(false)
                    if (res) {
                        navigation.navigate('Home');
                    }
                } else {
                    _googleButton?.current?.hideLoading();
                    setLoading(false)
                }
            } else {
                _googleButton?.current?.hideLoading();
                setLoading(false)
            }
        } catch (error) {
            console.log('error in google', error);
            errorMessage('Cannot login using Google');
            _googleButton?.current?.hideLoading();
            setLoading(false)
        }
    };

    const _doAppleLogin = async () => {
        try {
            setLoading(true)
            setIsAppleLoading(true)
            let data = {};
            const appleAuthRequestResponse = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
            });
            // const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);
            // console.log('apple credentialState', credentialState);
            // if (credentialState === appleAuth.State.AUTHORIZED) {
            //   // user is authenticated
            //   console.log('apple is authorized')
            // }
            const credential = appleAuthRequestResponse;
            // signed in
            let firstName = null;
            let lastName = null;

            if (credential?.fullName) {
                if (credential?.fullName?.givenName || credential?.fullName?.familyName) {
                    if (credential?.fullName.givenName) {
                        firstName = credential?.fullName?.firstName;
                    }
                    if (credential?.fullName?.familyName) {
                        lastName = credential?.fullName?.familyName;
                    }
                }
            }
            data.appleId = credential?.user;
            data.token = credential?.identityToken;
            // data.token="eyJraWQiOiJlWGF1bm1MIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwiYXVkIjoiY29tLnNhdmUtbXktcGF5Y2hlY2stMTYwODAiLCJleHAiOjE2MDU4NjkyNjcsImlhdCI6MTYwNTc4Mjg2Nywic3ViIjoiMDAwOTE2LjU5NzNhNmNiOWI3YzQ1ZDY4MGVmNDNmZmYzMDMyNGNhLjA3MDYiLCJub25jZSI6IjMxNTcxMDA3OTQxZDdiYjdiZjRmOTlkMTNmNWJkZmRiZjEwYWEwNTQyMWI3MTdhMGQzMDcyNTg2MmMxNTg2ZjgiLCJjX2hhc2giOiJySDJaVk9XYVdRaUEwY2hwRWdfeDZnIiwiZW1haWwiOiI4d2loZnVudHp5QHByaXZhdGVyZWxheS5hcHBsZWlkLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjoidHJ1ZSIsImlzX3ByaXZhdGVfZW1haWwiOiJ0cnVlIiwiYXV0aF90aW1lIjoxNjA1NzgyODY3LCJub25jZV9zdXBwb3J0ZWQiOnRydWV9.2UcU85gOdwzNBuVho4spQqCY6tuCz1EyfqEKy4gavkDWnoqNz94mg8LUvJwd0CPyl28mP2Kt_9R3JHFTBy_yCYcy5egB4owOBcH63JAfgVeErPVx6ANXGb-e6fZNrxymdbvvTqaoa5fOnGJE3OSVL_2MpDGUICXbcroW9tNTFhODartkdWp2kzmKlE2fcGovEsT0t5b8NUWH7PoaG3GvzHcxWz10e9KXg9bfanxuM2CZezmGicmBR0APah8kOJzvwljnC4u_qHVFs95AMqwgU517wp2NVTmGWIGYASvkBiiPEjXp3oiQ44CH2fQ0B_ZgaTV2yrkMCAO18m9Avdd3Tg"
            if (firstName) {
                data.firstName = firstName;
            }
            if (lastName) {
                data.lastName = lastName;
            }

            if (data && data?.token) {
                let res = await dispatch(authSSOAction(data.token, 'apple', data));
                if (res) {
                    res = await dispatch(fetchUserProfileAction(true));
                    setLoading(false)
                    setIsAppleLoading(false)
                    if (res) {
                        navigation.navigate('Home');
                    }
                } else {
                    setLoading(false)
                    setIsAppleLoading(false)
                }
            } else {
                setLoading(false)
                setIsAppleLoading(false)
            }
        } catch (e) {
            console.log('apple auth error', e);
            console.log('apple  error code', e.code);
            setIsAppleLoading(false)
            setLoading(false)
            if (e.code === '1001') {
                // handle that the user canceled the sign-in flow
            } else {
                // handle other errors
                // alert('Could not sign in with apple')
            }
        }
    }

    return (
        <ScreenWrapper withBg>
            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.keyBoardContainer}
                keyboardShouldPersistTaps="handled"
            >
                <View />
                <Logo style={styles.logo} />
                <View style={{ alignItems: 'center' }}>
                    <TextInput
                        placeholder="Adresse e-mail"
                        autoCapitalize={'none'}
                        style={styles.marginBottomStyle}
                        onChangeText={email => setEmail(email)}
                        value={email}
                        onSubmitEditing={() => passwordField.current.focus()}
                    />
                    <TextInput
                        secureTextEntry
                        setRef={passwordField}
                        placeholder="Mot de passe"
                        autoCapitalize={'none'}
                        onChangeText={password => setPassword(password)}
                        value={password}
                        textInputStyle={{ width: wp(55) }}
                        rightComponent={
                            <Pressable
                                disabled={loading}
                                style={{ flex: 1, marginRight: wp(0.5) }}
                                onPress={() =>
                                    navigation.navigate({
                                        name: 'ForgotPasswordScreen',
                                        params: {
                                            email: email,
                                        }, merge: true
                                    })
                                }>
                                <Text style={{ fontSize: 14, textAlign: 'right' }}>
                                    oublié ?
                                </Text>
                            </Pressable>
                        }
                        onSubmitEditing={() => _signInWithEmailAndPassword()}
                    />

                    <LoadingButton
                        ref={_signinButton}
                        disabled={loading}
                        style={{ marginTop: hp(3) }}
                        onPress={() => _signInWithEmailAndPassword()}
                        title={'Se connecter'}
                        titleStyle={styles.signinButtonText}
                    />
                    <Text style={styles.marginBottomStyle}>ou</Text>
                    {/* {appleAuth.isSupported && appleAuth.isSignUpButtonSupported && (
                        <Pressable
                            activeOpacity={0.7}
                            style={{
                                backgroundColor: Colors.White,
                                marginBottom: hp(1.7),
                                borderRadius: 22,
                                height: hp(5),
                                width: wp(100) * 0.8,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                            {isAppleLoading ? (
                                <ActivityIndicator size="small" color={Colors.Black} />
                            ) : (
                                <AppleButton
                                    style={{ height: hp(5), width: wp(100) * 0.8 }}
                                    cornerRadius={22}
                                    buttonStyle={AppleButton.Style.WHITE}
                                    buttonType={AppleButton.Type.SIGN_IN}
                                    onPress={() => _doAppleLogin()}
                                />
                            )}
                        </Pressable>
                    )} */}
                    <LoadingButton
                        ref={_googleButton}
                        onPress={() =>
                            showPopup(<AgeCheckPopup onButtonPress={() => _doGoogleLogin()} />)
                        }
                        disabled={loading}
                        style={styles.marginBottomStyle}
                        title={'Se connecter avec Google'}
                        titleStyle={styles.titleButtonText}
                        leftComponentContainerStyle={styles.buttonLeftContainer}
                        leftComponent={
                            <Image
                                resizeMode="contain"
                                source={Images.GOOGLE_ICON}
                                style={styles.iconImage}
                            />
                        }
                    />
                    <LoadingButton
                        ref={_facebookButton}
                        onPress={() => _doFacebookLogin()}
                        disabled={loading}
                        style={styles.marginBottomStyle}
                        title={'Se connecter avec Facebook'}
                        titleStyle={styles.titleButtonText}
                        leftComponentContainerStyle={styles.buttonLeftContainer}
                        leftComponent={
                            <Image
                                resizeMode="contain"
                                source={Images.FACEBOOK_ICON}
                                style={styles.iconImage}
                            />
                        }
                    />

                    <Pressable
                        disabled={loading}
                        onPress={() => navigation.navigate('SignupScreen')}
                        style={styles.signupButton}>
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: '400',
                                textDecorationLine: 'underline'
                            }}>
                            S'inscrire
                        </Text>
                    </Pressable>
                </View>
            </KeyboardAwareScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    keyBoardContainer: {
        alignItems: 'center',
        flexGrow: 1,
        justifyContent: 'space-around',
    },
    logo: {
        marginBottom: hp(2.5)
    },
    marginBottomStyle: {
        marginBottom: hp(2)
    },
    signupButton: {
        alignSelf: 'center',
        marginVertical: hp(5)
    },
    iconImage: {
        width: wp(5),
        height: wp(5),
        marginHorizontal: wp(5),
        alignSelf: 'center'
    },
    titleButtonText: {
        fontWeight: '500',
        fontSize: 15,
        flex: 1
    },
    buttonLeftContainer: {
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    signinButtonText: {
        color: Colors.FONT_BLUE_COLOR,
        fontWeight: '500',
        fontSize: 21,
    }
});

export default SigninScreen;
