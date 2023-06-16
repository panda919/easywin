import { Image, Share, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SCREEN_WIDTH } from '../Constants';
import { useSelector } from 'react-redux';
import { Images } from '../Utils/images';
import { hp, isX, wp } from '../Helper/ResponsiveScreen';
import { CARD, Colors } from '../Styles/Colors';
import Text from './Text';
import CustomImage from './CustomImage';
import LinearGradient from 'react-native-linear-gradient';
import Modal from "react-native-modal";
import Clipboard from '@react-native-community/clipboard';
import Lang from '../Languages/LanguageStr';
import { successMessage } from '../Actions';

const ShareCodeSheet = ({ isVisible, onSwipeComplete, closeModal, message }) => {

  const userProfile = useSelector(state => state?.userReducer?.userProfile);

  return (
    <Modal
      isVisible={isVisible}
      swipeDirection={'down'}
      useNativeDriverForBackdrop={true}
      statusBarTranslucent
      onSwipeComplete={onSwipeComplete}
      style={styles.modalView}>
      <View>
        <View style={styles.topborder} />
        <View style={styles.bottomSheetContainer}>
          <CustomImage
            source={Images.PARRAIN_SHARE}
            style={styles.parrainShareImage}
            contentContainerStyle={{
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
            }}
          />
          <Text style={{
            color: Colors.Black,
            fontSize: 20,
            fontWeight: 'bold',
            marginVertical: hp(2)
          }}>
            Envie de gagner des cadeaux ?
          </Text>
          <Text style={{
            color: Colors.Black,
            fontSize: 16,
            fontWeight: '400',
            textAlign: 'center',
          }}>
            {`Invitez vos amis sur EasyWin\npour obtenir des `}
            <Text style={{
              color: Colors.Black,
              fontSize: 17,
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              récompenses
            </Text>
          </Text>

          <View style={styles.coinView}>
            <Text style={{
              color: Colors.Black,
              fontSize: 24,
              fontWeight: 'bold'
            }}>1</Text>
            <Image source={Images.PERSON_YELLOW_ICON} style={styles.personYellowIcon} />
            <Text style={{
              color: Colors.Black,
              fontSize: 24,
              fontWeight: 'bold',
              marginHorizontal: wp(4)
            }}>=</Text>

            {userProfile?.affiliateType ? (
              <>
                <Text style={{
                  color: Colors.Black,
                  fontSize: 24,
                  fontWeight: 'bold',
                  marginRight: wp(1)
                }}>{userProfile?.affiliateAmount}</Text>
                <Image
                  source={
                    userProfile?.affiliateType === 'coins'
                      ? Images.COINS_ICON
                      : Images.MONEY_ICON
                  }
                  style={[
                    userProfile?.affiliateType === 'coins'
                      ? { height: wp(8), width: wp(8), marginHorizontal: wp(1) }
                      : { height: wp(8), width: wp(8), marginHorizontal: wp(1) },
                  ]}
                />
              </>
            ) : null}
          </View>

          <Text style={{
            color: Colors.Black,
            fontSize: 16,
            textAlign: 'center'
          }}>
            {`Et tentez de devenir le Parrain d’Or\npour remporter des `}
            <Text style={{
              color: Colors.Black,
              fontSize: 17,
              fontWeight: 'bold',
              textAlign: 'center'
            }}>cadeaux exclusifs</Text>
          </Text>

          <View style={styles.border} />

          <View style={styles.copyBottomContainer}>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{
                color: Colors.Black,
                fontSize: 18,
                fontWeight: '700'
              }}>Code de parrainage</Text>
              <View style={styles.copyView}>
                <Text style={{
                  color: Colors.Black,
                  fontSize: 20,
                  fontWeight: 'bold'
                }}>
                  {userProfile?.sponsorCode}
                </Text>
                <TouchableOpacity onPress={() => {
                  Clipboard.setString(userProfile?.sponsorCode);
                  successMessage(Lang.user.codeCopiedToClipboard);
                }}>
                  <Image
                    source={Images.COPY_ICON}
                    resizeMode="contain"
                    style={styles.copyIcons}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <LinearGradient
              colors={[Colors.LIGHT_YELLOW, Colors.YELLOW]}
              style={{ borderRadius: 50, alignSelf: 'stretch' }}>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await Share.share({
                      message: message,
                    });
                  } catch (error) {
                    console.log(error.message);
                  }
                  closeModal()
                }}>
                <Text style={{
                  textAlign: 'center',
                  color: Colors.Black,
                  fontWeight: '400',
                  fontSize: 20,
                  padding: 10,
                  paddingHorizontal: 20
                }}>PARTAGER VOTRE CODE</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ShareCodeSheet;

const styles = StyleSheet.create({
  topborder: {
    backgroundColor: Colors.Gray2,
    height: hp(1),
    alignSelf: "center",
    width: wp(15),
    borderRadius: wp(10),
    marginBottom: hp(1)
  },
  modalView: {
    justifyContent: 'flex-end',
    margin: 0
  },
  bottomSheetContainer: {
    height: isX ? hp(80) : hp(88),
    width: wp(100),
    alignSelf: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  parrainShareImage: {
    overflow: 'hidden',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.387,
    borderRadius: 0,
  },
  copyIcons: {
    height: wp(5),
    width: wp(5),
    marginLeft: wp(2),
  },
  copyView: {
    marginTop: hp(2),
    alignItems: 'center',
    flexDirection: 'row',
    padding: wp(10),
    borderWidth: 1,
    borderColor: Colors.APP_BORDER_GRAY_COLOR,
    borderRadius: 10,
    ...CARD,
  },
  copyBottomContainer: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  border: {
    height: 1,
    backgroundColor: Colors.APP_BORDER_GRAY_COLOR,
    width: wp(50),
    marginVertical: hp(3),
  },
  personYellowIcon: {
    height: wp(6),
    width: wp(6),
    marginHorizontal: wp(1)
  },
  coinView: {
    marginVertical: hp(2),
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.APP_BORDER_GRAY_COLOR,
    ...CARD,
  }
});
