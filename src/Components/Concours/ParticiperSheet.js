import React from 'react'
import { StyleSheet, View } from 'react-native'
import Modal from "react-native-modal";
import { errorMessage } from '../../Actions';
import { SCREEN_HEIGHT } from '../../Constants';
import { hp, PLATFORM_IOS, wp } from '../../Helper/ResponsiveScreen';
import Lang from '../../Languages/LanguageStr';
import { LMSText } from '../../Languages/LMSText';
import { Colors } from '../../Styles/Colors';
import { apiGet, updateStatistics } from '../../Utils/functions';
import Participer from './Participer';

const ParticiperSheet = (props) => {
    const challengeCredit = props?.userProfile?.wallet?.challengeCredit

    const {
        statistic,
        type,
    } = props?.selectedConcour;
    const competitionParticipationsDetail =
        props?.userProfile?.competitionParticipationsDetails[
        props?.userProfile?.competitionParticipationsDetails?.findIndex(
            (competitionParticipation) =>
                competitionParticipation?.competition &&
                competitionParticipation?.competition['@id'] ==
                `/competitions/${props?.selectedConcour?.id}`,
        )
        ];

    return (
        <Modal
            isVisible={props?.isParticiperOpen}
            swipeDirection={'down'}
            useNativeDriverForBackdrop={true}
            statusBarTranslucent
            onSwipeComplete={props?.onClose}
            useNativeDriver={false}
            propagateSwipe={true}
            style={styles.modalView}>
            <View>
                <View style={styles.topborder} />
                <View style={styles.bottomSheetContainer}>
                    <Participer
                        selectedConcourLots={props?.selectedConcourLots}
                        loadingLots={props?.loadingLots}
                        loadingMakeParticipation={props?.loadingMakeParticipation}
                        selectedConcour={props?.selectedConcour}
                        userProfile={props?.userProfile}
                        sliderLink={props?.sliderLink}
                        onRulesPress={(rulesLink) => {
                            props?.setRulesLink(rulesLink)
                            // rules bottom sheet open
                            props?.onOpenRulesSheet()
                        }}
                        onPlayGame={async () => {
                            if (competitionParticipationsDetail) {
                                props?.setLoadingChancesDetails(true)
                                // participer bottomsheet close
                                props?.onClose()
                                // chances bottomsheet open
                                props?.onOpenChancesSheet()
                                let chancesDetailsRes = await apiGet(
                                    `/user_competition_records/${props?.selectedConcour?.id}`,
                                );
                                if (chancesDetailsRes && chancesDetailsRes?.data) {
                                    props?.setChancesDetails(chancesDetailsRes?.data)
                                    props?.setLoadingChancesDetails(false)
                                } else {
                                    // chances bottomsheet close
                                    props?.onCloseChancesSheet()
                                    props?.setLoadingChancesDetails(false)
                                    props?.setChancesDetails(false)
                                }
                            } else {
                                if (challengeCredit > 0 || type == 'sponsored') {
                                    props?._playVideo(props?.selectedConcour);
                                } else {
                                    errorMessage(LMSText(Lang.user.insufficientChallangeCredits));
                                }
                            }
                        }}
                        onSeeAllLots={() => {
                            if (props?.loadingLots == false && props?.selectedConcourLots?.length > 0) {
                                // lots bottomsheet open
                                props?.onOpenLotsSheet()
                                if (statistic && statistic?.id) {
                                    updateStatistics(statistic?.id, {
                                        toIncrementSeeAllLots: 1,
                                    });
                                }
                            }
                        }}
                    />
                </View>
            </View>
        </Modal>
    )
}

export default ParticiperSheet

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
        overflow: 'hidden',
    }
})