import { PLATFORM_ANDROID, wp } from "../../Helper/ResponsiveScreen";
import Animated from 'react-native-reanimated';
import { Dimensions } from "react-native";
const { interpolateNode, Extrapolate } = Animated;

const { width, height } = Dimensions.get('screen');
const innerHeight = width < height ? height : width;
// const innerWidth = width < height ? width : height;

export const VideoSize = {
    inline: {
        width: wp(100),
        height: (wp(100) * 9) / 16,
    },
    fullScreen: {
        height: wp(100),
        width: PLATFORM_ANDROID ? innerHeight : innerHeight,
    },
};

export const fullScreenInterpolate = (width, layout) => {
    const inputRange = [VideoSize.inline.width, VideoSize.fullScreen.width];

    // const topRange = [IsAndroid ? layout.top : 0, IsAndroid ? 0 : -layout.top];
    // const leftRange = [IsAndroid ? 0 : 0, IsAndroid ? -layout.left-50  : -layout.left];

    const topRange = [0, -layout.top];
    const leftRange = [0, -layout.left];

    const top = interpolateNode(width, {
        inputRange,
        outputRange: topRange,
        extrapolate: Extrapolate.CLAMP,
    });
    const left = interpolateNode(width, {
        inputRange,
        outputRange: leftRange,
        extrapolate: Extrapolate.CLAMP,
    });

    const height = interpolateNode(width, {
        inputRange,
        outputRange: [VideoSize.inline.height, VideoSize.fullScreen.height + 2],
        extrapolate: Extrapolate.CLAMP,
    });

    return { top, height, left };
};

export const YTWebViewState = {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5,
}