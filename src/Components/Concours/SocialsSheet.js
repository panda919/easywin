import React from 'react'
import { View, StyleSheet } from 'react-native'
import Modal from "react-native-modal";
import { SCREEN_HEIGHT } from '../../Constants';
import { hp, PLATFORM_IOS, wp } from '../../Helper/ResponsiveScreen';
import { Colors } from '../../Styles/Colors';
import SocialFollowButton from '../SocialFollowButton';


const SocialsSheet = (props) => {
  let competitionParticipationsDetail =
    props?.userProfile?.competitionParticipationsDetails[
    props?.userProfile?.competitionParticipationsDetails?.findIndex(
      (competitionParticipation) =>
        competitionParticipation?.competition &&
        competitionParticipation?.competition['@id'] ==
        `/competitions/${props?.selectedConcour.id}`,
    )
    ];

  return (
    <Modal
      isVisible={props?.isSocialsSheetOpen}
      swipeDirection={'down'}
      useNativeDriverForBackdrop={true}
      statusBarTranslucent
      onSwipeComplete={props?.onClose}
      style={styles.modalView}>
      <View>
        <View style={styles.topborder} />
        <View style={styles.bottomSheetContainer}>
          <View style={{ paddingTop: hp(1.5) }}>
            {/* {props?.selectedConcour?.snFacebook && (
              <SocialFollowButton
                competitionParticipationsDetail={competitionParticipationsDetail}
                URL={props?.selectedConcour?.snFacebook}
                socialType={'Facebook'}
                title={'Partager sur Facebook'}
                onFollowPress={props?._onFollowPress}
                onSocialSheetClose={props?.onClose}
                onChancesSheetClose={props?.onChancesSheetClose}
              />
            )} */}
            {/* {props?.selectedConcour?.snInstagram && (
              <SocialFollowButton
                competitionParticipationsDetail={competitionParticipationsDetail}
                URL={props?.selectedConcour?.snInstagram}
                socialType={'Instagram'}
                title={'Suivez sur Instagram'}
                onFollowPress={props?._onFollowPress}
                onSocialSheetClose={props?.onClose}
                onChancesSheetClose={props?.onChancesSheetClose}
              />
            )} */}
            {props?.selectedConcour?.snSnapChat && (
              <SocialFollowButton
                competitionParticipationsDetail={competitionParticipationsDetail}
                URL={props?.selectedConcour?.snSnapChat}
                socialType={'Snapchat'}
                title={'Suivez sur SnapChat'}
                onFollowPress={props?._onFollowPress}
                onSocialSheetClose={props?.onClose}
                onChancesSheetClose={props?.onChancesSheetClose}
              />
            )}
            {/* {props?.selectedConcour?.snTwitter && (
              <SocialFollowButton
                competitionParticipationsDetail={competitionParticipationsDetail}
                URL={props?.selectedConcour?.snTwitter}
                socialType={'Twitter'}
                title={'Suivez sur Twitter'}
                onFollowPress={props?._onFollowPress}
                onSocialSheetClose={props?.onClose}
                onChancesSheetClose={props?.onChancesSheetClose}
              />
            )} */}
            {props?.selectedConcour?.snYoutube && (
              <SocialFollowButton
                competitionParticipationsDetail={competitionParticipationsDetail}
                URL={props?.selectedConcour?.snYoutube}
                socialType={'Youtube'}
                title={'Suivez sur Youtube'}
                onFollowPress={props?._onFollowPress}
                onSocialSheetClose={props?.onClose}
                onChancesSheetClose={props?.onChancesSheetClose}
              />
            )}
            {props?.selectedConcour?.snDiscord && (
              <SocialFollowButton
                competitionParticipationsDetail={competitionParticipationsDetail}
                URL={props?.selectedConcour?.snDiscord}
                socialType={'Discord'}
                title={'Suivez sur Discord'}
                onFollowPress={props?._onFollowPress}
                onSocialSheetClose={props?.onClose}
                onChancesSheetClose={props?.onChancesSheetClose}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default SocialsSheet

const styles = StyleSheet.create({
  modalView: {
    justifyContent: 'flex-end',
    margin: 0
  },
  topborder: {
    backgroundColor: Colors.Gray2,
    height: hp(1),
    alignSelf: "center",
    width: wp(15),
    borderRadius: wp(10),
    marginBottom: hp(1)
  },
  bottomSheetContainer: {
    height: PLATFORM_IOS ? SCREEN_HEIGHT - hp(14) : SCREEN_HEIGHT - hp(9),
    width: wp(100),
    alignSelf: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: Colors.White,
    overflow: 'hidden'
  }
})