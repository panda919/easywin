import React from 'react';
import {
    Image,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { SERVER_BASE } from '../Constants';
import InViewPort from './InViewPort';
import { useSelector } from 'react-redux'
import { hp, wp } from '../Helper/ResponsiveScreen';
import { apiPut } from '../Utils/functions';
import commonStyles from '../Styles/index';

const BannerAd = ({
    primaryIndex,
    scratch
}) => {
    const concourBannerAds = useSelector((state) => state?.concoursReducer?.concourBannerAds)
    const scratchBannerAds = useSelector((state) => state?.concoursReducer?.scratchBannerAds)

    let adsArray = concourBannerAds;
    if (scratch) {
        adsArray = scratchBannerAds;
    }

    if (adsArray?.length == 0) {
        return null;
    }

    let adIndex = 0;
    const convertedIndex = (primaryIndex / 3).toFixed(0);
    adIndex = (convertedIndex % adsArray?.length) - 1;
    if (adIndex < 0) {
        adIndex = adsArray?.length - 1;
    }
    if (adsArray[adIndex] == undefined) {
        adIndex = 0;
    }

    const { contentUrl, clickableLink, id } = adsArray[adIndex];

    return (
        <InViewPort
            onChange={async isVisible => {
                if (isVisible) {
                    await apiPut(`/media/${id}`, {
                        toIncrementImpressions: 1,
                    });
                }
            }}>
            <TouchableOpacity
                style={{
                    marginHorizontal: wp(5),
                    marginTop: hp(2),
                    height: hp(5.2),
                    borderRadius: 5,
                    ...commonStyles.SHADOW,
                }}
                onPress={async () => {
                    Linking.openURL(clickableLink);
                    await apiPut(`/media/${id}`, {
                        toIncrementClickCount: 1,
                    });
                }}>
                <Image
                    source={{ uri: `${SERVER_BASE}${contentUrl}` }}
                    style={{ width: wp(90), height: wp(11) }}
                    resizeMode={'stretch'}
                />
            </TouchableOpacity>
        </InViewPort>
    );
};

export default BannerAd;
