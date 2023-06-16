import React, { useEffect } from 'react'
import { View, StyleSheet, ScrollView, Share, Linking } from 'react-native'
import Modal from "react-native-modal";
import { Colors } from '../../Styles/Colors';
import { hp, PLATFORM_IOS, wp } from '../../Helper/ResponsiveScreen';
import Text from '../Text';
import Loader from '../Loader';
import ChanceOption from './ChanceOption';
import { errorMessage } from '../../Actions';
import { apiGet, updateStatistics } from '../../Utils/functions';
import { LMSText } from '../../Languages/LMSText';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../Constants';
import Lang from '../../Languages/LanguageStr';

const ChancesSheet = (props) => {
    let totalSocialsToFollow = 0;
    let followedSocials = 0;
    let competitionParticipationsDetail =
        props?.userProfile?.competitionParticipationsDetails[
        props?.userProfile?.competitionParticipationsDetails?.findIndex(
            (competitionParticipation) =>
                competitionParticipation?.competition &&
                competitionParticipation?.competition['@id'] ==
                `/competitions/${props?.selectedConcour?.id}`,
        )
        ];
    if (
        competitionParticipationsDetail == undefined ||
        competitionParticipationsDetail == null
    ) {
        competitionParticipationsDetail = { numberOfParticipations: 0 };
    } else {
        if (props?.selectedConcour?.snDiscord) {
            totalSocialsToFollow++;
            if (competitionParticipationsDetail?.followDiscord) {
                followedSocials++;
            }
        }
        if (props?.selectedConcour?.snFacebook) {
            totalSocialsToFollow++;
            if (competitionParticipationsDetail?.followFacebook) {
                followedSocials++;
            }
        }
        if (props?.selectedConcour?.snInstagram) {
            totalSocialsToFollow++;
            if (competitionParticipationsDetail?.followInstagram) {
                followedSocials++;
            }
        }
        if (props?.selectedConcour?.snTwitter) {
            totalSocialsToFollow++;
            if (competitionParticipationsDetail?.followTwitter) {
                followedSocials++;
            }
        }
        if (props?.selectedConcour?.snYoutube) {
            totalSocialsToFollow++;
            if (competitionParticipationsDetail?.followYoutube) {
                followedSocials++;
            }
        }
        if (props?.selectedConcour?.snSnapChat) {
            totalSocialsToFollow++;
            if (competitionParticipationsDetail?.followSnapchat) {
                followedSocials++;
            }
        }
    }

    return (
        <Modal
            isVisible={props?.isChancesSheetOpen}
            swipeDirection={'down'}
            useNativeDriverForBackdrop={true}
            statusBarTranslucent
            onSwipeComplete={props?.onClose}
            style={styles.modalView}>
            <View>
                <View style={styles.topborder} />
                <View style={styles.bottomSheetContainer}>
                    <View
                        style={styles.chanceContainer}>
                        <Text style={{
                            color: Colors.Black,
                            fontSize: 40,
                            fontWeight: '700'
                        }}>
                            AUGMENTEZ
                        </Text>
                        <Text style={{
                            color: Colors.Black,
                            fontSize: 40,
                            fontWeight: '700'
                        }}>
                            VOS CHANCES
                        </Text>
                    </View>
                    <Text
                        style={{
                            color: Colors.Black,
                            marginHorizontal: wp(5),
                            marginTop: hp(1),
                        }}>
                        VALIDEZ DES ACTIONS POUR AUGMENTEZ VOS CHANCES DE REMPORTER LE CONCOURS
                    </Text>
                    <View style={styles.chancesOptionContent}>
                        <View style={{ flex: 2 }} />
                        <View style={styles.chanceTitleContent}>
                            <Text
                                style={{
                                    color: Colors.DARK_BLUE,
                                    fontSize: 38,
                                    fontWeight: '700'
                                }}>
                                {competitionParticipationsDetail?.numberOfParticipations}
                            </Text>
                            <View style={{ marginLeft: 5 }}>
                                <Text
                                    style={{
                                        color: Colors.DARK_BLUE,
                                        fontWeight: '700', fontSize: 21
                                    }}>
                                    {`${competitionParticipationsDetail?.numberOfParticipations < 2
                                        ? 'chance'
                                        : 'chances'
                                        }`}
                                    {`${props?.userProfile?.level > 1 ? (props?.userProfile?.level > 4 ? 'x3' : 'x2') : ''}`}
                                </Text>
                                {/* <Text
                                    style={{
                                        fontSize: 38,
                                        fontWeight: '700', color: Colors.APP_GRAY_COLOR, fontSize: 12
                                    }}>
                                    de gagner à ce concours
                                </Text> */}
                            </View>
                        </View>

                        {props?.loadingChancesDetails || props?.chancesDetails == false ? (
                            <View style={{ flex: 1 }}>
                                <Loader />
                            </View>
                        ) : (
                            <ScrollView>
                                <ChanceOption
                                    availed={props?.chancesDetails?.ticketUsed}
                                    alwaysEnabled
                                    title={'UTILISEZ VOS BILLETS'}
                                    onPress={props?.onUtiliserPress}
                                />
                                <ChanceOption
                                    availed={props?.chancesDetails?.share}
                                    onPress={async () => {
                                        try {
                                            if (props?.selectedConcour?.sharingDescription) {
                                                const result = await Share.share({
                                                    message: props?.selectedConcour?.sharingDescription,
                                                });
                                                if (result?.action === Share?.sharedAction) {
                                                    props?._updatecompetitionParticipationsDetail({
                                                        share: true,
                                                    });
                                                    const { statistic } = props?.selectedConcour;
                                                    if (statistic && statistic?.id) {
                                                        updateStatistics(statistic?.id, {
                                                            toIncrementShared: 1,
                                                        });
                                                    }
                                                } else if (result?.action === Share?.dismissedAction) {
                                                    // dismissed
                                                }
                                            }
                                        } catch (error) {
                                            // alert(error.message);
                                        }
                                    }}
                                    title={'PARTAGEZ LE CONCOURS'}
                                />
                                {props?.selectedConcour?.survey && (
                                    <ChanceOption
                                        availed={props?.chancesDetails?.survey}
                                        title={'RÉPONDEZ AU SONDAGE'}
                                        onPress={async () => {
                                            // survey sheet open
                                            props?.setSurvey(null)
                                            props?.onOpenSurveySheet()
                                            let survey = null;
                                            let res = await apiGet(props?.selectedConcour?.survey);
                                            if (res && res?.data) {
                                                survey = { ...res?.data, answers: {} };
                                                props?.setLoadingSurvey(false)
                                                props?.setSurvey(survey)
                                            } else {
                                                // survey sheet open
                                                props?.onCloseSurveySheet()
                                            }
                                        }}
                                    />
                                )}
                                {props?.selectedConcour?.goWebsite && (
                                    <ChanceOption
                                        availed={props?.chancesDetails?.goWebsite}
                                        title={'VISITEZ LE SITE INTERNET'}
                                        alwaysEnabled
                                        onPress={async () => {
                                            const openGoWebsiteLink = await Linking.openURL(
                                                props?.selectedConcour?.goWebsite,
                                            );
                                            if (openGoWebsiteLink) {
                                                props?._updatecompetitionParticipationsDetail({
                                                    goWebsite: true,
                                                });
                                            }
                                        }}
                                    />
                                )}
                                {props?.selectedConcour?.videoLimit != 0 && (
                                    <ChanceOption
                                        video
                                        availed={
                                            props?.chancesDetails?.video != null &&
                                                props?.selectedConcour?.videoLimit != undefined
                                                ? props?.chancesDetails?.video == props?.selectedConcour?.videoLimit
                                                : false
                                        }
                                        title={`VISIONNEZ DES PUBLICITÉS (${props?.chancesDetails?.video == null ? '0' : props?.chancesDetails?.video
                                            }${props?.selectedConcour?.videoLimit != undefined
                                                ? '/' + props?.selectedConcour?.videoLimit
                                                : ''
                                            })`}
                                        onPress={() => {
                                            let competitionParticipationsDetail =
                                                props?.userProfile?.competitionParticipationsDetails[
                                                props?.userProfile?.competitionParticipationsDetails?.findIndex(
                                                    (competitionParticipation) =>
                                                        competitionParticipation?.competition &&
                                                        competitionParticipation?.competition['@id'] ==
                                                        `/competitions/${props?.selectedConcour?.id}`,
                                                )
                                                ];

                                            if (
                                                props?.chancesDetails?.video <=
                                                competitionParticipationsDetail?.challengeCreditsLimitPerDay
                                            ) {
                                                if (props?.userProfile?.wallet?.challengeCredit > 0) {
                                                    props?._playVideo(props?.selectedConcour);
                                                } else {
                                                    errorMessage(
                                                        LMSText(Lang.user.insufficientChallangeCredits)
                                                    );
                                                }
                                            } else {
                                                errorMessage(
                                                    "Vous avez atteint la limite de visionnage pour aujourd'hui. Revenez demain !",
                                                );
                                            }
                                        }}
                                    />
                                )}
                                {/* {(props?.selectedConcour?.snDiscord ||
                                    props?.selectedConcour?.snFacebook ||
                                    props?.selectedConcour?.snInstagram ||
                                    props?.selectedConcour?.snTwitter ||
                                    props?.selectedConcour?.snYoutube ||
                                    props?.selectedConcour?.snSnapChat) && (
                                        <ChanceOption
                                            alwaysEnabled
                                            availed={props?.chancesDetails?.clickOnLink}
                                            title={`Suivre un compte (${followedSocials}/${totalSocialsToFollow})`}
                                            onPress={() => {
                                                // social sheet open 
                                                props?.onOpenSocialsSheet()
                                            }}
                                        />
                                    )} */}
                                {props?.selectedConcour?.rtTweet && (
                                    <ChanceOption
                                        alwaysEnabled
                                        availed={props?.chancesDetails?.reTweet}
                                        title={'RT un Tweet'}
                                        onPress={() =>
                                            props?._onReTweetPress(props?.selectedConcour?.rtTweet)
                                        }
                                    />
                                )}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default ChancesSheet

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
        overflow: 'hidden',
    },
    chanceContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        height: hp(28),
        borderBottomLeftRadius: SCREEN_WIDTH / 2,
        borderBottomRightRadius: SCREEN_WIDTH / 2,
        backgroundColor: Colors.YELLOW,
    },
    chancesOptionContent: {
        padding: wp(5),
        flex: 1,
        justifyContent: 'flex-end'
    },
    chanceTitleContent: {
        flexDirection: 'row',
        alignItems: 'center'
    }
})