import { Alert, Image, ImageBackground, Linking, Share, StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { hp, wp } from '../../Helper/ResponsiveScreen';
import { SCREEN_HEIGHT, SCREEN_WIDTH, SERVER_BASE } from '../../Constants';
import CustomImage from '../CustomImage';
import Text from '../Text';
import moment from 'moment';
import { Images } from '../../Utils/images';
import { showPopup, successMessage } from '../../Actions';
import PopupBase from '../PopupBase';
import { CARD, Colors } from '../../Styles/Colors';
import Clipboard from '@react-native-community/clipboard';
import { LMSText } from '../../Languages/LMSText';
import Lang from '../../Languages/LanguageStr';
import FastImage from 'react-native-fast-image';

const MesGainsItem = ({ userProfile, item, openCameraOnPress }) => {

  const { createdAt, lot, mediaUrl } = item;
  const discountCode = lot.type == 'service' ? lot.discountCodes[0] : null;

  const openLinking = async (url) => {
    // Checking if the link is supported for links with custom URL scheme.
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      // Opening the link with some app, if the URL scheme is "http" the web link should be opened
      // by some browser in the mobile
      await Linking.openURL(url);
    } else {
      Alert.alert(`Can not open this URL: ${url}`);
    }
  };


  return (
    <View style={styles.mainView}>
      <View style={styles.imageView}>
        {mediaUrl ? (
          <FastImage
            source={{ uri: `${SERVER_BASE}${mediaUrl}` }}
            style={styles.image}
          />
        ) : (
          <CustomImage
            source={
              lot.media1Url
                ? { uri: `${SERVER_BASE}${lot.media1Url}` }
                : Images.GIFT_PACK
            }
            style={styles.image}
          />
        )}
      </View>
      <View style={styles.secondMainView}>
        <View style={{ width: wp(25) }}>
          <Text style={{
            color: Colors.APP_GRAY_COLOR,
            fontSize: 16,
            fontWeight: '700'
          }}>
            {lot?.name}
          </Text>
          <Text
            style={{
              color: Colors.DARK_GRAY,
              fontSize: 14,
              fontWeight: '700',
            }}>
            {moment(createdAt).format('DD/MM/YYYY')}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          onPress={async () => {
            await Share.share({
              message: `J'ai gagné un(e) ${lot?.name} sur EasyWin ! Viens gagner de nombreux cadeaux sur leur app en jouant GRATUITEMENT à des concours, grattages et mini jeux ! Télécharge EasyWin avec mon code de parrainage pour obtenir un bonus.\n➡️ Lien d'EasyWin : www.easy-win.io\n➡️ Mon code : ${userProfile?.sponsorCode}`,
            });
          }}>
          <Image source={Images.RIGHT_ARROW_ICON} style={styles.rightArrowIcon} />
        </TouchableOpacity>
        {!mediaUrl ? (
          <TouchableOpacity
            onPress={openCameraOnPress}>
            {lot.type != 'service' ? (
              <Image
                source={Images.CAMERA_ICON}
                style={styles.cameraIcons}
              />
            ) : (
              <TouchableOpacity
                onPress={() => {
                  //claim reward promo code
                  showPopup(
                    <PopupBase
                      popupStyle={{ maxHeight: SCREEN_HEIGHT * 0.85 }}
                      imgSrc={Images.DISCOUNT_POPUP_ICON}
                      imageStyle={styles.popupImage}
                      onButtonPress={() => {
                        if (discountCode?.link) {
                          openLinking(discountCode?.link);
                        }
                      }}
                      buttonTitle={"UTILISER"}>
                      <View style={styles.popupView}>
                        <Text style={{
                          fontWeight: 'bold',
                          fontSize: 24,
                          color: 'black',
                          marginBottom: hp(2)
                        }}>
                          Cadeau obtenu !
                        </Text>
                        <ImageBackground
                          source={Images.DISCOUNT_CARD}
                          resizeMode="cover"
                          style={{
                            width: SCREEN_WIDTH - wp(25),
                            height: (SCREEN_WIDTH - wp(25)) * 0.614,
                          }}>
                          <View style={styles.discountView}>
                            <Text style={{
                              fontWeight: '700',
                              color: 'white',
                              fontSize: 44,
                            }}> {discountCode?.amount}</Text>
                            <Text style={{
                              marginHorizontal: wp(2),
                              fontWeight: '700',
                              color: 'white',
                              fontSize: 18
                            }}>
                              {discountCode?.classification == 'percent'
                                ? '%'
                                : '€'}
                            </Text>
                            {discountCode?.description && <Text
                              numberOfLines={3}
                              style={{
                                flex: 1,
                                textAlign: 'center',
                                fontWeight: '700',
                                color: 'white',
                                fontSize: 18,
                              }}>
                              {discountCode?.description}
                            </Text>}
                          </View>
                        </ImageBackground>

                        <View style={styles.border} />
                        <Text
                          style={{
                            fontWeight: 'bold',
                            fontSize: 18,
                            color: 'black',
                            textAlign: 'center',
                            width: wp(55)
                          }}>
                          {discountCode?.amount}{discountCode?.classification == 'percent' ? '%' : '€'} de réduction
                        </Text>
                        <Text
                          style={{
                            fontWeight: 'bold',
                            fontSize: 18,
                            color: 'black',
                            textAlign: 'center',
                            width: wp(55)
                          }}>
                          chez{' '}{discountCode?.type}
                        </Text>
                        <View style={styles.codeView}>

                          <View style={styles.row}>
                            <View style={styles.codeTextView}>
                              <Text style={{ fontWeight: '700' }}>
                                {discountCode?.code}
                              </Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => {
                                Clipboard.setString(discountCode?.code);
                                successMessage(LMSText(Lang.user.discountCodeCopiedToClipboard));
                              }}>
                              <Image
                                source={Images.COPY_BLACK_ICON}
                                style={styles.copyBlackIcon}
                              />
                            </TouchableOpacity>
                          </View>
                          <Text style={{
                            marginTop: hp(1),
                            color: Colors.Black,
                            fontSize: 11,
                            alignSelf: 'center'
                          }}>
                            Date d'expiration :{' '}
                            {discountCode?.expireAt ? moment(discountCode?.expireAt).format('DD/MM/YYYY'): 'sans limite'}
                          </Text>
                        </View>
                      </View>
                    </PopupBase>,
                  );
                }}>
                <View
                  style={styles.obtenirTextView}>
                  <Text style={{
                    color: 'white',
                    fontSize: 12,
                    paddingHorizontal: wp(2)
                  }}>
                    OBTENIR
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  )
}

export default MesGainsItem

const styles = StyleSheet.create({
  mainView: {
    marginBottom: hp(2),
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageView: {
    height: wp(20),
    width: wp(20),
    borderWidth: 1,
    borderRadius: 5,
    borderColor: Colors.APP_TAB_GRAY_COLOR,
    backgroundColor: Colors.APP_LIGHT_GRAY_COLOR,
  },
  image: {
    alignSelf: 'center',
    height: wp(20),
    width: wp(20),
    borderRadius: 5,
    overflow: 'hidden',
  },
  secondMainView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: wp(2),
    flex: 1
  },
  rightArrowIcon: {
    width: wp(8),
    height: wp(8),
  },
  cameraIcons: {
    marginLeft: wp(3),
    width: wp(8),
    height: wp(8),
  },
  popupImage: {
    width: wp(35),
    height: wp(35),
    marginTop: -hp(8),
  },
  popupView: {
    alignItems: 'center',
    marginTop: -hp(2),
    width: '100%',
  },
  discountView: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    padding: wp(10),
    paddingTop: hp(5),
  },
  border: {
    width: '100%',
    height: 5,
    backgroundColor: Colors.APP_TAB_GRAY_COLOR,
    marginVertical: hp(2),
  },
  codeView: {
    ...CARD,
    width: wp(75),
    marginTop: hp(1),
  },
  row: {
    fontWeight: '700',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.Black,
    borderRadius: 50,
    padding: wp(3),
    paddingHorizontal: wp(4),
  },
  codeTextView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyBlackIcon: {
    height: wp(6),
    width: wp(6)
  },
  obtenirTextView: {
    backgroundColor: Colors.APP_BLUE_COLOR,
    marginLeft: wp(2),
    borderWidth: 2,
    borderColor: Colors.APP_BLUE_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    height: wp(8),
    borderRadius: 20,
  }
})


