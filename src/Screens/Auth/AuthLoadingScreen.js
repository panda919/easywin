import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import {
  fetchUserProfileAction,
  fetchRankRewardDetails,
} from '../../Actions';
import ImmersiveMode from 'react-native-immersive-mode';
import { PLATFORM_IOS } from '../../Constants';
import ScreenWrapper from '../../Components/ScreenWrapper';
import { Colors } from '../../Styles/Colors';
import { useDispatch, useSelector } from "react-redux";
import Loader from '../../Components/Loader';

const AuthLoadingScreen = (props) => {
  const dispatch = useDispatch()
  const userReducer = useSelector((state) => state?.userReducer)

  useEffect(() => {
    const fetchData = async () => {
      SplashScreen.hide();
      //some devices do not go immersiveModeOn until splash is hidden, e.g samsung S20
      if (!PLATFORM_IOS) {
        setTimeout(() => {
          ImmersiveMode.fullLayout(true);
          ImmersiveMode.setBarMode('BottomSticky');
          StatusBar.setBackgroundColor('transparent');
        }, 250);
      }

      if (userReducer?.token) {
        dispatch(fetchRankRewardDetails());
        let res = await dispatch(fetchUserProfileAction(true));
        if (res) {
          if (res.interests && res.interests.length > 0) {
            props.navigation.navigate('Home');
          } else {
            props.navigation.navigate('UserPrefScreen');
          }
        } else {
          props.navigation.navigate('Auth');
        }
      } else {
        props.navigation.navigate('Auth');
      }
    }
    fetchData()
  }, [])

  return (
    <ScreenWrapper
      withBg
      contentContainerStyle={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Loader color={Colors.White} />
    </ScreenWrapper>
  );
}
export default AuthLoadingScreen;
