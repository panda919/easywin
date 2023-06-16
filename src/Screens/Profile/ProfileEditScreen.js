import React, { useCallback, useEffect, useRef, useState } from 'react'
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useSelector, useDispatch } from 'react-redux'
import { Keyboard, Linking, NativeModules, Pressable, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { CLIENT_KEY, googleScope, PLATFORM_IOS, SERVER_BASE, twitterCosumerKey, twitterCosumerSecretKey, WEBCLIENTID } from '../../Constants/index'
import moment from 'moment';
import { apiPost, apiPostImage, fetchCity, makeAffiliate, missionsCheckAccount } from '../../Utils/functions';
import { errorMessage, fetchInterestsOptions, fetchMissionsAction, hidePopup, showPopup, signOutAction, successMessage, updateLocalUserProfileWithDataAction, updateUserProfileAction } from '../../Actions';
import PopupBase from '../../Components/PopupBase';
import LinearGradient from 'react-native-linear-gradient';
import Text from '../../Components/Text';
import { Colors } from '../../Styles/Colors';
import { LMSText } from '../../Languages/LMSText';
import { getCameraGalleryPermissions, permissionsAlert, pickFromGallery } from '../../Utils/camera';
import { Images } from '../../Utils/images';
import ScreenWrapper from '../../Components/ScreenWrapper';
import { PLATFORM_ANDROID, hp, wp } from '../../Helper/ResponsiveScreen';
import commonStyles from '../../Styles/index';
import CustomImage from '../../Components/CustomImage';
import ActionSheet from 'react-native-actionsheet';
import TextInput from '../../Components/TextInput';
import LoadingButton from '../../Components/LoadingButton';
import InstagramLogin from 'react-native-instagram-login';
import CitySheet from '../../Components/CitySheet';
import InputDialog from '../../Components/InputDialog';
import ProfileOption from '../../Components/ProfileOption';
// import { AccessToken, GraphRequest, GraphRequestManager, LoginManager } from 'react-native-fbsdk-next';
import ProfileHeader from '../../Components/ProfileHeader';
import { resetNavigateTo } from '../../Helper/NavigationHelper';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Lang from '../../Languages/LanguageStr';
import { useNavigation } from '@react-navigation/native';
import { readFile } from '../../Utils/file-storage';
import RNFS from 'react-native-fs';
import CameraModel from '../../Components/Camera/CameraModel';
import { useCameraDevices } from 'react-native-vision-camera';
import DeviceInfo from 'react-native-device-info';

const { RNTwitterSignIn } = NativeModules;


const ProfileEditScreen = (props) => {
  const navigation = useNavigation()
  const userProfile = useSelector((state) => state.userReducer?.userProfile);
  let date = userProfile?.dateOfBirth ? moment(userProfile?.dateOfBirth).format('DD-MM-YYYY') : null;

  const [firstname, setFirstname] = useState(userProfile?.firstname ?? '');
  const [lastname, setLastname] = useState(userProfile?.lastname ?? '');
  const [gender, setGender] = useState(userProfile?.gender ?? null);
  const [email, setEmail] = useState(userProfile?.email ?? '');
  const [affiliate, setAffiliate] = useState(userProfile?.affiliate ?? null);
  const [city, setCity] = useState(null);
  const [phone, setPhone] = useState(userProfile?.phone ?? null);
  const [address, setAddress] = useState(userProfile?.address ?? null);
  const [dateOfBirth, setDateOfBirth] = useState(date ?? null);
  const [facebook, setFacebook] = useState(userProfile?.facebook ?? null);
  const [instagram, setInstagram] = useState(userProfile?.instagram ?? null);
  const [twitter, setTwitter] = useState(userProfile?.twitter ?? null);
  const [snapchat, setSnapchat] = useState(userProfile?.snapchat ?? null);
  const [discord, setDiscord] = useState(userProfile?.discord ?? null);
  const [youtube, setYoutube] = useState(userProfile?.youtube ?? null);
  const [verificationDialogVisible, setVerificationDialogVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatarUrl ?? null);
  const [localImage, setLocalImage] = useState(false)
  const [affiliateCode, setAffiliateCode] = useState('')
  const [instagramUserId, setInstagramUserId] = useState(userProfile?.instagram ?? '');
  const [facebookData, setFacebookData] = useState(userProfile?.facebook ?? '');
  const [youtubeData, setYoutubeData] = useState('')
  const [twitterData, setTwitterData] = useState(userProfile?.twitter ?? '');
  const [selectedCityObject, setSelectedCityObject] = useState(null)
  const [verificationError, setVerificationError] = useState(false);
  const [inputDialogText, setInputDialogText] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isShow, setIsShow] = useState(false)

  const actionSheetRef = useRef();
  const genderActionSheetRef = useRef();
  const instagramLogin = useRef();
  const camera = useRef()
  const devices = useCameraDevices();
  const device = devices['back'];

  const dispatch = useDispatch()

  useEffect(() => {
    async function renderData() {
      Linking.getInitialURL()
        .then(ev => {
          if (ev) {
            console.log('ev', ev);
          }
        })
        .catch(err => {
          console.warn('An error occurred', err);
        });

      let selectedCityObject = null;
      if (userProfile?.city) {
        selectedCityObject = await fetchCity(userProfile?.city);

        if (selectedCityObject) {
          setSelectedCityObject(selectedCityObject)
          setCity(selectedCityObject.name)
        }
      }

      //popup
      if (phone && phone != '' && userProfile?.phoneVerified == false &&
        phone?.length && phone?.length > 11) {
        showPopup(
          <PopupBase
            title={'Vérification du téléphone'}
            description={'Votre numéro de téléphone n’a pas été vérifié'}
            buttonTitle={'Entrer le code de vérification'}
            onButtonPress={async () => {
              setLoading(false)
              setVerificationDialogVisible(true)
            }}
            onClose={async () => { }}>
            <Pressable
              onPress={async () => {
                hidePopup();
                const res = await apiPost('/users/resend_phone_sms', { phone });
                if (res && res?.data) {
                  setLoading(false)
                  setVerificationDialogVisible(true)
                }
              }}>
              <LinearGradient
                colors={[Colors.LIGHT_YELLOW, Colors.YELLOW]}
                style={{
                  flexDirection: 'row',
                  padding: wp(2),
                  paddingHorizontal: wp(5),
                  borderRadius: 40,
                  marginVertical: hp(2),
                  alignSelf: 'stretch',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{ color: Colors.Black, fontSize: 18, fontWeight: '700' }}>
                  Renvoyer le code
                </Text>
              </LinearGradient>
            </Pressable>
          </PopupBase>,
        );
      }
    }
    renderData()
  }, [])


  // const twitterLoginData = async () => {
  //   RNTwitterSignIn.init(twitterCosumerKey, twitterCosumerSecretKey);
  //   const { name } = await RNTwitterSignIn.logIn();
  //   setTwitterData(name);
  // };

  const authWithGoogleData = async () => {
    GoogleSignin.configure({
      webClientId: WEBCLIENTID,
      scopes: [googleScope],
    });
    try {
      await GoogleSignin.hasPlayServices();
      const googleSigninRes = await GoogleSignin.signIn();
      const { accessToken } = await GoogleSignin.getTokens();
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&key=${CLIENT_KEY}&access_token=${accessToken}`,
      );
      setYoutubeData(googleSigninRes?.user?.email)

      return googleSigninRes;
    } catch (error) {
      console.log('error', error);
      if (error.code == -5) {
        return false;
      } else {
        throw 'Something went wrong';
      }
    }
  };

  // const _responseInfoCallback = (error, result) => {
  //   if (error) {
  //     alert('Error fetching data: ' + error.toString());
  //   } else {
  //     console.log('resule of facebook', result);
  //     setFacebookData(result?.first_name + ' ' + result?.last_name)
  //   }
  // };

  const onFacebookButtonPress = async () => {
    // try {
    //   const result = await LoginManager.logInWithPermissions([
    //     'public_profile',
    //     'email',
    //   ]);
    //   if (result.isCancelled) {
    //     throw 'User cancelled the login process';
    //   }
    //   const datas = await AccessToken.getCurrentAccessToken().then(() => {
    //     const infoRequests = new GraphRequest(
    //       '/me?fields=first_name,last_name,picture,location{location},email',
    //       null,
    //       _responseInfoCallback(),
    //     );
    //     new GraphRequestManager().addRequest(infoRequests).start();
    //   });

    //   if (!datas) {
    //     throw 'Something went wrong obtaining access token';
    //   }
    // } catch (error) {
    //   console.log('errr', error);
    // }
  };

  const setIgToken = async (data, result) => {
    let URL = `https://graph.instagram.com/v11.0/me?fields=id,username&access_token=${data?.access_token}`;
    await fetch(URL).then(resp => {
      resp.json()?.then(resp => {
        setInstagramUserId(resp?.username)
      });
    });
  };

  const updatePhone = async () => {
    if (phone) {
      if (phone?.length > 11) {
        try {
          const res = await apiPost('/users/update_phone', { phone });

          if (res && res?.data) {
            return true;
          } else {
            const errorData = res?.error?.data;
            if (
              errorData?.['hydra:description'] ===
              'Allmysms server returned error with message: no valid recipient found'
            ) {
              errorMessage(LMSText(Lang.user.invalidPhone));
              //todo: if phone already in use
            } else if (
              errorData?.['hydra:description'] ===
              'Error! This phone is already in use.'
            ) {
              errorMessage(LMSText(Lang.user.phoneAlreadyInUse));
            } else {
              errorMessage(LMSText(Lang.user.invalidPhone));
            }
            return false;
          }
        } catch (error) {
          errorMessage(LMSText(Lang.user.invalidPhone));
          console.log('phone validate error', error.message);
          return false;
        }
      } else {
        errorMessage(LMSText(Lang.user.invalidPhone));
        setLoading(false)
        setVerificationDialogVisible(false)
        return false;
      }
    }
  };

  const onEditProfile = async () => {
    setLoading(true)
    let showCodeBox = false;
    let tryingPhoneUpdate = false;
    try {
      if (phone !== userProfile?.phone) {
        tryingPhoneUpdate = true;
        showCodeBox = await updatePhone();
      } else {
        console.log('phone NOT changed');
      }

      if (showCodeBox == false && tryingPhoneUpdate) {
        setLoading(false)
        setVerificationDialogVisible(false)
        Keyboard.dismiss();
        return;
      }

      if (showCodeBox == true && tryingPhoneUpdate) {
        //if phone is not vrified after profile update, show dialog
        setLoading(false)
        setVerificationDialogVisible(true)
        return;
      }

      if (localImage) {
        await uploadImageAsync(localImage);
      }
      if (affiliate == null && affiliateCode) {
        let res = await makeAffiliate(affiliateCode);
        if (res && res.error) {
          if (
            res.error.data &&
            res.error.data['hydra:description'] &&
            res.error.status == 500
          ) {
            errorMessage(res.error.data['hydra:description']);
            setLoading(false)
            return false;
          }
        } else if (res && res.data) {
          //affiliated success
        } else {
          //could not get response
        }
      }

      let dataObject = {
        firstname,
        lastname,
        gender,
        email,
        address,
        city: selectedCityObject ? selectedCityObject['@id'] : null,
        facebook: facebook ? facebook : facebookData,
        instagram: instagram ? instagram : instagramUserId,
        twitter: twitter ? twitter : twitterData,
        snapchat,
        discord,
        youtube: youtube ? youtube : youtubeData,
      };
      if (dateOfBirth) {
        dataObject.dateOfBirth = dateOfBirth;
      }

      //TODO: run validity checks from bots if to be done on front end
      // eg . checkFacebookIdentifier()
      //if all valid, update profile, other wise return here

      let res = await dispatch(updateUserProfileAction(dataObject));
      if (res && res.data) {
        //if all socials are valid, make checks true if to be done on front end based on which socials are available
        const {
          facebook,
          instagram,
          twitter,
          snapchat,
          discord,
          youtube,
        } = res?.data;
        const {
          checkDiscordAccount,
          checkFacebookAccount,
          checkInstagramAccount,
          checkSnapchatAccount,
          checkTwitterAccount,
          checkYoutubeAccount,
        } = res?.data?.xp;
        if (facebook && !checkFacebookAccount) {
          const newUserProfileData = await missionsCheckAccount(
            'check_facebook',
          );
          if (newUserProfileData) {
            dispatch(updateLocalUserProfileWithDataAction(newUserProfileData));
          }
        }
        if (instagram && !checkInstagramAccount) {
          const newUserProfileData = await missionsCheckAccount(
            'check_instagram',
          );
          if (newUserProfileData) {
            dispatch(updateLocalUserProfileWithDataAction(newUserProfileData));
          }
        }
        if (twitter && !checkTwitterAccount) {
          const newUserProfileData = await missionsCheckAccount(
            'check_twitter',
          );
          if (newUserProfileData) {
            dispatch(updateLocalUserProfileWithDataAction(newUserProfileData));
          }
        }
        if (snapchat && !checkSnapchatAccount) {
          const newUserProfileData = await missionsCheckAccount(
            'check_snapchat',
          );
          if (newUserProfileData) {
            dispatch(updateLocalUserProfileWithDataAction(newUserProfileData));
          }
        }
        if (discord && !checkDiscordAccount) {
          const newUserProfileData = await missionsCheckAccount(
            'check_discord',
          );
          if (newUserProfileData) {
            dispatch(updateLocalUserProfileWithDataAction(newUserProfileData));
          }
        }
        if (youtube && !checkYoutubeAccount) {
          const newUserProfileData = await missionsCheckAccount(
            'check_youtube',
          );
          if (newUserProfileData) {
            dispatch(updateLocalUserProfileWithDataAction(newUserProfileData));
          }
        }
        //fetch missions because data is made in action not in screen itself, so it wont update if profile is update when going back
        dispatch(fetchMissionsAction());
        if (showCodeBox == true) {
          //if phone is not vrified after profile update, show dialog
          setLoading(false)
          setVerificationDialogVisible(true)
          return;
        }
        setLoading(false)
        successMessage(LMSText(Lang.user.profileUpdatedSuccessfully));
        //navigation.goBack();
      } else {
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
    }
  };

  const _pickFromGallery = async () => {
    let localImage = await pickFromGallery();
    if (localImage) {
      setLocalImage(localImage)
    }
  };

  const _pickFromCamera = async () => {
    let havePermission = await getCameraGalleryPermissions();
    if (!havePermission) {
      permissionsAlert();
      return false;
    } else {
      setIsShow(true)
    }
  };

  const uploadImageAsync = async localImage => {
    let data = new FormData();
    data.append('file', {
      name: `rnd-${localImage.filename ? localImage.filename : 'profileimg'}.jpg`,
      type: 'image/jpeg',
      uri: localImage.path,
    });
    let res = await apiPostImage('/users/avatar', data);
    return res;
  };

  let imgSrc = Images.PROFILE_ICON;
  if (localImage) {
    imgSrc = { uri: `data:${localImage.mime};base64,${localImage.data}` };
  } else if (avatarUrl) {
    imgSrc = { uri: `${SERVER_BASE}${avatarUrl}` };
  }

  const logOut = async () => {
    resetNavigateTo(navigation, 'Auth');
    await dispatch(signOutAction())
  }

  const handleConfirm = (date) => {
    setDateOfBirth(moment(new Date(date)).format("DD-MM-YYYY"))
    setDatePickerVisibility(false);
  };

  const takePhoto = useCallback(async () => {
    try {
      if (camera.current == null) throw new Error('Camera ref is null!');
      const localImage = await camera.current.takePhoto({
        photoCodec: 'jpeg',
        qualityPrioritization: 'speed',
        quality: 100,
        skipMetadata: true
      });
      const data = await readFile(localImage?.path)
      const fullPath = RNFS.DocumentDirectoryPath + localImage?.path;
      const fullPathPrefixed = PLATFORM_ANDROID ? 'file://' + fullPath : fullPath;
      setLocalImage({
        data: data,
        width: localImage.width,
        height: localImage.height,
        mime: "image/jpeg",
        path: fullPathPrefixed
      })
      setIsShow(false)
    } catch (e) {
      console.error('Failed to take photo!', e);
    }
  }, [camera]);

  return (
    <ScreenWrapper contentContainerStyle={commonStyles.screenWrapperContent}>
      <View style={{ marginHorizontal: wp(5) }}>
        <ProfileHeader
          type={props?.route?.params?.type}
          backDisabled={loading}
          checkDisabled={loading}
          loading={loading}
          checkPress={() => onEditProfile()}
        />
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Pressable onPress={() => actionSheetRef?.current?.show()}>
          <CustomImage source={imgSrc} style={styles.userProfileIcon} />
        </Pressable>
        <TextInput
          value={firstname}
          onChangeText={firstname => setFirstname(firstname)}
          placeholder={'Prénom'}
          style={commonStyles.textWhiteBgStyle}
          textInputStyle={commonStyles.textWhiteBgTextStyle}
        />
        <TextInput
          value={lastname}
          onChangeText={lastname => setLastname(lastname)}
          placeholder={'Nom'}
          style={commonStyles.textWhiteBgStyle}
          textInputStyle={commonStyles.textWhiteBgTextStyle}
        />
        <TouchableWithoutFeedback onPress={() => genderActionSheetRef?.current?.show()}>
          <View style={styles.genderTextInput}>
            <Text
              style={{
                width: wp(95),
                borderWidth: 0,
                padding: 0,
                color:
                  gender == 0 || gender == 1
                    ? Colors.FONT_GRAY_COLOR
                    : Colors.PLACEHOLDER_COLOR,
              }}>
              {gender == 0 ? 'Homme' : gender == 1 ? 'Femme' : 'Genre'}
            </Text>
          </View>
        </TouchableWithoutFeedback>
        <ActionSheet
          ref={genderActionSheetRef}
          title={'Veuillez sélectionner votre genre'}
          options={['Homme', 'Femme', 'Annuler']}
          cancelButtonIndex={2}
          onPress={index => {
            if (index == 0 || index == 1) {
              setGender(index)
            } else {
              setGender(null)
            }
          }}
        />
        <TextInput
          value={email}
          onChangeText={email => setEmail(email)}
          placeholder={'E-mail'}
          style={commonStyles.textWhiteBgStyle}
          textInputStyle={commonStyles.textWhiteBgTextStyle}
        />
        <TextInput
          keyboardType="phone-pad"
          value={phone}
          onChangeText={phone => setPhone(phone)}
          placeholder={'0033xxxxxxxxx'}
          style={commonStyles.textWhiteBgStyle}
          textInputStyle={commonStyles.textWhiteBgTextStyle}
        />
        <TextInput
          value={address}
          onChangeText={address => setAddress(address)}
          placeholder={'Adresse'}
          style={commonStyles.textWhiteBgStyle}
          textInputStyle={commonStyles.textWhiteBgTextStyle}
        />
        <Text style={styles.desText}>
          Votre adresse est nécessaire pour l'envoi des lots gagnés
        </Text>
        <TouchableWithoutFeedback onPress={() => setIsOpen(true)}>
          <View style={styles.cityTextInput}>
            <Text style={{ color: city ? Colors.FONT_GRAY_COLOR : Colors.PLACEHOLDER_COLOR }}>
              {city ? city : 'Ville'}
            </Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => setDatePickerVisibility(true)}>
          <View style={styles.genderTextInput}>
            <Text
              style={{
                width: wp(95),
                borderWidth: 0,
                padding: 0,
                color: dateOfBirth ? Colors.FONT_GRAY_COLOR : Colors.PLACEHOLDER_COLOR,
              }}>
              {dateOfBirth ? dateOfBirth : 'Date de naissance'}
            </Text>
          </View>
        </TouchableWithoutFeedback>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          format="DD-MM-YYYY"
          minDate="01-01-1950"
          maxDate={moment().subtract('18', 'years').format('DD-MM-YYYY')}
          locale={'fr'}
          onConfirm={handleConfirm}
          onCancel={() => setDatePickerVisibility(false)}
        />
        {!affiliate && (
          <TextInput
            value={affiliateCode}
            onChangeText={affiliateCode => setAffiliateCode(affiliateCode)}
            placeholder={'Code parrain'}
            style={commonStyles.textWhiteBgStyle}
            textInputStyle={commonStyles.textWhiteBgTextStyle}
          />
        )}
        <Pressable onPress={() => onFacebookButtonPress()}>
          <TextInput
            value={`${facebook ? facebook : facebookData}`}
            onChangeText={facebook => setFacebookData(facebook)}
            placeholder={'Identifiant Facebook'}
            style={commonStyles.textWhiteBgStyle}
            textInputStyle={commonStyles.textWhiteBgTextStyle}
            editable={false}
          />
        </Pressable>

        <Pressable onPress={() => instagramLogin?.current?.show()}>
          <TextInput
            value={`${instagram ? instagram : instagramUserId}`}
            onChangeText={instagram => setInstagramUserId(instagram)}
            placeholder={'Identifiant Instagram'}
            style={commonStyles.textWhiteBgStyle}
            textInputStyle={commonStyles.textWhiteBgTextStyle}
            editable={false}
          />
        </Pressable>
        {/* {!PLATFORM_IOS && (
          <Pressable onPress={() => twitterLoginData()}>
            <TextInput
              value={twitter ? twitter : twitterData}
              onChangeText={twitter => setTwitterData(twitter)}
              placeholder={'Identifiant Twitter'}
              style={commonStyles.textWhiteBgStyle}
              textInputStyle={commonStyles.textWhiteBgTextStyle}
              editable={false}
            />
          </Pressable>
        )} */}

        {/* {youtube ? (
          <TextInput
            value={youtube}
            onChangeText={youtube => setYoutube(youtube)}
            placeholder={'Identifiant Youtube'}
            style={commonStyles.textWhiteBgStyle}
            editable={true}
            textInputStyle={commonStyles.textWhiteBgTextStyle}
          />
        ) : (
          <Pressable
            disabled={youtubeData ? true : false}
            onPress={() => authWithGoogleData()}>
            <TextInput
              value={youtubeData}
              onChangeText={youtube => setYoutubeData(youtube)}
              placeholder={'Identifiant Youtube'}
              style={commonStyles.textWhiteBgStyle}
              editable={false}
              textInputStyle={commonStyles.textWhiteBgTextStyle}
            />
          </Pressable>
        )} */}

        <ProfileOption
          title={"VOS CENTRES D'INTÉRÊT"}
          onPress={async () => {
            await dispatch(fetchInterestsOptions());
            navigation.navigate('ChangeInterestsScreen')
          }}
          style={{ marginTop: hp(1) }}
        />
        <ProfileOption
          title={'MODIFIER LE MOT DE PASSE'}
          onPress={() => navigation.navigate('ChangePasswordScreen')}
        />
        <ProfileOption
          title={'CONTACT'}
          onPress={() => navigation.navigate('ContactUsScreen')}
        />
        <ProfileOption
          title={'FAQ'}
          onPress={() => Linking.openURL('https://www.easy-win.io/faq')}
        />
        <LoadingButton
          title={'SE DÉCONNECTER'}
          onPress={() => logOut()}
          style={{ marginVertical: hp(3), backgroundColor: Colors.ORANGE }}
          titleStyle={{ color: Colors.White, fontWeight: 'bold' }}
        />
        <View style={{ paddingVertical: hp(1), justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{
            color: Colors.APP_GRAY_COLOR,
            fontSize: 16,
            fontWeight: '600'
          }} >versionName: {DeviceInfo.getVersion()}</Text>
        </View>
        <InstagramLogin
          ref={instagramLogin}
          appId="322677235406759"
          appSecret="017457fffbc0d71c3437cf230f3cf4aa"
          redirectUrl="https://www.easy-win.io/"
          scopes={['user_profile']}
          onLoginSuccess={() => setIgToken()}
          onLoginFailure={data => console.log(data)}
          response_type={'code'}
        />
      </ScrollView>
      <CitySheet
        isVisible={isOpen}
        swipeDirection={'down'}
        colseModal={() => setIsOpen(false)}
        onSwipeComplete={() => setIsOpen(false)}
        onCitySelect={(selectedCityObject) => {
          setCity(selectedCityObject?.name);
          setSelectedCityObject(selectedCityObject)
          setIsOpen(false);
        }}
      />
      <ActionSheet
        ref={actionSheetRef}
        title={'veuillez sélectionner une option'}
        options={['Galerie', 'Appareil photo', 'Annuler']}
        cancelButtonIndex={2}
        onPress={index => {
          index == 0
            ? _pickFromGallery()
            : index == 1
              ? _pickFromCamera()
              : null;
        }}
      />
      <InputDialog
        title={'Vérification du téléphone'}
        description={
          verificationError
            ? LMSText(Lang.user.InvalidVerificationCode)
            : LMSText(Lang.user.enterVerificationCode)
        }
        loading={loading}
        visible={verificationDialogVisible}
        inputDialogText={inputDialogText} //value of text field
        keyboardType="numeric"
        onChangeText={_inputDialogText => {
          let inputDialogText = _inputDialogText.replace(/[^0-9]/g, '');
          setInputDialogText(inputDialogText);
        }}
        onCancelPress={() => {
          setInputDialogText('');
          setVerificationDialogVisible(false)
          setVerificationError(false)
        }}
        onSavePress={async () => {
          setLoading(true)
          const res = await apiPost('/users/verify_phone', {
            verificationCode: inputDialogText,
          });
          console.log('phone',res.data);
          if (res && res.data && res.data.error === undefined) {
            userProfile.phone = phone;
            await dispatch(updateLocalUserProfileWithDataAction(res.data));

            setInputDialogText('');
            setVerificationDialogVisible(false)
            setLoading(false)
            setVerificationError(false)
            successMessage(LMSText(Lang.user.profileUpdatedSuccessfully));

            onEditProfile();
          } else {
            setVerificationDialogVisible(true)
            setVerificationError(true)
            setLoading(false)
          }
        }}
      />

      {/* open camera view  */}
      {isShow &&
        <CameraModel
          isShow={isShow}
          onClose={() => setIsShow(false)}
          camera={camera}
          takePhoto={takePhoto}
          device={device}
        />
      }
    </ScreenWrapper>
  )
}

export default ProfileEditScreen

const styles = StyleSheet.create({
  userProfileIcon: {
    marginBottom: hp(2),
    alignSelf: 'center',
    width: wp(20),
    height: wp(20),
    borderRadius: wp(50),
    overflow: 'hidden',
  },
  genderTextInput: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderColor: 'white',
    borderWidth: 2,
    borderRadius: 22,
    width: wp(100),
    backgroundColor: Colors.InputBgColor,
    height: PLATFORM_IOS ? hp(5) : hp(5.5),
    paddingHorizontal: wp(2.5),
    ...commonStyles.textWhiteBgStyle,
  },
  cityTextInput: {
    ...commonStyles.textWhiteBgStyle,
    height: PLATFORM_IOS ? hp(5) : hp(5.5),
    justifyContent: 'center',
    paddingHorizontal: wp(2.5),
    borderRadius: 22,
    borderWidth: 2,
  },
  desText: {
    width: wp(100),
    marginBottom: hp(1),
    marginHorizontal: wp(3),
    fontSize: 11,
    color: Colors.Gray2,
  },
  datePickerStyle: {
    ...commonStyles.textWhiteBgStyle,
    borderRadius: 22,
    borderWidth: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentContainer: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(1),
  }
})
