import { View } from 'react-native'
import React, { useState } from 'react'
import ScreenWrapper from '../../Components/ScreenWrapper'
import commonStyles from '../../Styles/index';
import { hp, wp } from '../../Helper/ResponsiveScreen';
import ProfileHeader from '../../Components/ProfileHeader';
import TextInput from '../../Components/TextInput';
import { LMSText } from '../../Languages/LMSText';
import { errorMessage, successMessage } from '../../Actions';
import Lang from '../../Languages/LanguageStr';
import { apiPost } from '../../Utils/functions';
import { PLATFORM_IOS } from '../../Constants';
import { Colors } from '../../Styles/Colors';

const ChangePasswordScreen = (props) => {

  const [loading, setLoading] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const onChangePassword = async () => {
    if (oldPass) {
      if (newPass) {
        if (newPass == confirmPass) {
          const data = {
            oldPassword: oldPass,
            newPassword: newPass,
          };
          setLoading(true);
          let res = await apiPost('/users/update_password', data);
          setLoading(false);
          if (res && res.data) {
            successMessage(LMSText(Lang.auth.passwordChangedSuccessfully));
            props.navigation.goBack();
          } else if (res && res.error && res.error.status == 500) {
            errorMessage(LMSText(Lang.auth.invalidOldPassword));
          }
        } else {
          errorMessage(LMSText(Lang.auth.passwordConfirmDoesNotMatch));
        }
      } else {
        errorMessage(LMSText(Lang.auth.enterPassword));
      }
    } else {
      errorMessage(LMSText(Lang.auth.enterExistingPassword));
    }
  };

  return (
    <ScreenWrapper contentContainerStyle={commonStyles.screenWrapperContent}>
      <View style={{ marginHorizontal: wp(5) }}>
        <ProfileHeader
          backDisabled={loading}
          checkDisabled={loading}
          loading={loading}
          title={'MOT DE PASSE'}
          checkPress={() => onChangePassword()}
        />
          <Text
            style={{
              marginVertical: hp(1),
              fontSize: PLATFORM_IOS ? 14 : 12,
              textAlign: 'center',
              color: Colors.Black
            }}>
            {`Modifiez votre mot de passe`}
          </Text>
        <View style={{ marginTop: hp(2.5) }}>
          <TextInput
            onChangeText={oldPass => setOldPass(oldPass)}
            value={oldPass}
            secureTextEntry
            style={commonStyles.textWhiteBgStyle}
            textInputStyle={commonStyles.textWhiteBgTextStyle}
            placeholder={'Mot de passe actuel'}
          />
          <TextInput
            onChangeText={newPass => setNewPass(newPass)}
            value={newPass}
            secureTextEntry
            style={commonStyles.textWhiteBgStyle}
            textInputStyle={commonStyles.textWhiteBgTextStyle}
            placeholder={'Nouveau mot de passe'}
          />
          <TextInput
            onChangeText={confirmPass => setConfirmPass(confirmPass)}
            value={confirmPass}
            secureTextEntry
            style={commonStyles.textWhiteBgStyle}
            textInputStyle={commonStyles.textWhiteBgTextStyle}
            placeholder={'Confirmer le mot de passe'}
          />
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default ChangePasswordScreen;