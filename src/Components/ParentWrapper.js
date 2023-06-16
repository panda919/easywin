import React, { useEffect, useState } from 'react';
import {
  Animated,
  LayoutAnimation,
  NativeModules,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Image,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {
  clearError,
  clearInfo,
  clearSuccess,
  hidePopup,
} from '../Actions';
import {
  SCREEN_HEIGHT,
  STATUSBAR_HEIGHT,
} from '../Constants';
import Text from './Text';
import LinearGradient from 'react-native-linear-gradient';
import { Images } from '../Utils/images';
import { Colors } from '../Styles/Colors';
import { hp, wp } from '../Helper/ResponsiveScreen';
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-native-modal";

const { UIManager } = NativeModules;
UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

let timeOut = null;
let infoAutoHideTime = 4000;
let ANIMATION_DURATION = 1000;

const ParentWrapper = (props) => {
  const dispatch = useDispatch();

  const [showError, setShowError] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const animateds = new Animated.Value(SCREEN_HEIGHT)

  const error = useSelector((state) => state?.errorHandler?.errorMessage);
  const success = useSelector((state) => state?.errorHandler?.successMessage);
  const errorAction = useSelector((state) => state?.errorHandler?.errorAction);
  const info = useSelector((state) => state?.errorHandler?.infoMessage);
  const showPopup = useSelector((state) => state?.errorHandler?.showPopup);
  const popupChildren = useSelector((state) => state?.errorHandler?.popupChildren);


  useEffect(() => {
    dispatch(clearError());
    dispatch(clearInfo());
    dispatch(clearSuccess());
    hidePopup();
  }, [])

  useEffect(() => {
    if (error !== null && error != '' && showError == false) {
      _showError();
    }
    if (success !== null && success != '' && showSuccess == false) {
      _showSuccess();
    }
    if (info !== null && info != '' && showInfo == false) {
      _showInfo();
    }
  }, [error, success, info])

  const _showError = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(250, 'easeInEaseOut', 'opacity'),
    );
    setShowError(true)
  };

  const _hideError = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(250, 'easeInEaseOut', 'opacity'),
    );
    setShowError(false)
    if (typeof errorAction === 'function') {
      errorAction();
    }
    dispatch(clearError());
  }

  const _showSuccess = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(250, 'easeInEaseOut', 'opacity'),
    );
    setShowSuccess(true);
  };

  const _hideSuccess = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(250, 'easeInEaseOut', 'opacity'),
    );
    setShowSuccess(false);
    dispatch(clearSuccess());
  };

  const _showInfo = () => {
    timeOut = setTimeout(_hideInfo, infoAutoHideTime);
    Animated.timing(animateds, {
      toValue: 0,
      duration: ANIMATION_DURATION,
    }).start();
    setShowInfo(true);
  };

  const _hideInfo = () => {
    clearTimeout(timeOut);
    Animated.timing(animateds, {
      toValue: SCREEN_HEIGHT,
      duration: ANIMATION_DURATION * 2,
    }).start(() => {
      setShowInfo(false)
      dispatch(clearInfo())
    })
  };

  const _renderErrorHandler = () => {
    return (
      <View style={styles.popupBGTransparentView}>
        <View style={styles.popupContainer}>
          <TouchableOpacity
            onPress={() => _hideError()}
            style={styles.crossIconView}>
            <Image source={Images.VIDEO_CROSS_ICON} style={styles.crossIconStyles} />
          </TouchableOpacity>
          <Image source={Images.ERROR_CROSS_ICON} style={styles.errorAndSuccessIcon} resizeMode="contain" />

          <Text style={{
            color: Colors.Black,
            marginVertical: hp(2),
            fontSize: 18,
            fontWeight: '700',
            textAlign: 'center',
          }}>
            {error}
          </Text>
          <TouchableOpacity onPress={() => _hideError()}>
            <LinearGradient
              colors={['#FFDB0F', '#FFB406']}
              style={styles.okButtonView}>
              <Text style={{
                color: Colors.Black,
                fontSize: 18,
                fontWeight: '700',
                paddingHorizontal: wp(2.8),
              }}>
                OK
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const _renderSuccessHandler = () => {
    return (
      <View style={styles.popupBGTransparentView}>
        <View style={styles.popupContainer}>
          <TouchableOpacity
            onPress={() => _hideSuccess()}
            style={styles.crossIconView}>
            <Image source={Images.VIDEO_CROSS_ICON} style={styles.crossIconStyles} />
          </TouchableOpacity>
          <Image source={Images.SUCCESS_CHECK_ICON} style={styles.errorAndSuccessIcon} resizeMode="contain" />
          <Text
            style={{
              color: Colors.Black,
              marginVertical: hp(2),
              fontSize: 18,
              fontWeight: '700',
              textAlign: 'center'
            }}>
            {success}
          </Text>
          <TouchableOpacity onPress={() => _hideSuccess()}>
            <LinearGradient
              colors={['#FFDB0F', '#FFB406']}
              style={styles.okButtonView}>
              <Text
                style={{
                  color: Colors.Black,
                  fontSize: 18,
                  fontWeight: '700',
                  paddingHorizontal: wp(2.8)
                }}>
                OK
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      {props.children}
      <Animated.View
        style={[
          { transform: [{ translateX: animateds }] },
          styles.animatedViewStyle
        ]}>
        <TouchableWithoutFeedback
          style={{ flex: 1 }}
          onPress={() => _hideInfo()}>
          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
            }}>
            <View
              style={styles.infoTextView}>
              <Text style={{
                fontSize: 13,
                margin: 3,
                textAlign: 'center'
              }}>
                {info}
              </Text>
            </View>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </Animated.View>
      {!!showPopup && (
        <Modal
          isVisible={true}
          backdropOpacity={1}
          backdropColor={Colors.POPUP_BG_TRANSPARENT_COLOR}>
          <View style={styles.popupBGTransparentView}>
            <StatusBar barStyle={"dark-content"} backgroundColor={'#4A4B4D'} animated />
            {popupChildren}
          </View>
        </Modal>
      )}
      {!!showError &&
        <Modal
          isVisible={true}
          backdropOpacity={1}
          backdropColor={Colors.POPUP_BG_TRANSPARENT_COLOR}>
          <StatusBar barStyle={"dark-content"} backgroundColor={'#4A4B4D'} animated />
          {_renderErrorHandler()}
        </Modal>
      }
      {!!showSuccess &&
        <Modal
          isVisible={true}
          backdropOpacity={1}
          backdropColor={Colors.POPUP_BG_TRANSPARENT_COLOR}>
          <StatusBar barStyle={"dark-content"} backgroundColor={'#4A4B4D'} animated />
          {_renderSuccessHandler()}
        </Modal>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  animatedViewStyle: {
    position: 'absolute',
    width: wp(100),
    flex: 1,
    top: STATUSBAR_HEIGHT * 2,
  },
  infoTextView: {
    flex: 1,
    width: wp(70),
    marginRight: -3,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    backgroundColor: Colors.APP_DARK_GRAY_COLOR,
    borderColor: Colors.APP_BORDER_GRAY_COLOR,
    borderRightColor: Colors.APP_DARK_GRAY_COLOR,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupBGTransparentView: {
    flex: 1,
    width: wp(100),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  popupContainer: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.White,
    width: wp(85),
    minHeight: hp(100) / 4,
    maxHeight: hp(100) / 2,
    backgroundColor: Colors.White,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
  },
  crossIconView: {
    position: 'absolute',
    right: 0
  },
  crossIconStyles: {
    height: wp(11),
    width: wp(11)
  },
  errorAndSuccessIcon: {
    width: wp(22),
    height: wp(22),
    marginTop: -hp(5),
  },
  okButtonView: {
    flexDirection: 'row',
    padding: wp(2.5),
    paddingHorizontal: wp(5),
    borderRadius: 40,
    marginVertical: hp(2.6),
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
})


export default ParentWrapper;
