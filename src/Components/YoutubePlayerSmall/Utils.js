import Animated from 'react-native-reanimated';
import { Dimensions } from 'react-native';
import { PLATFORM_ANDROID } from '../../Helper/ResponsiveScreen';
const { interpolateNode, Extrapolate } = Animated;

const { width, height } = Dimensions.get('window');
const innerHeight = width < height ? height : width;
const innerWidth = width < height ? width : height;

export const VideoSize = {
  inline: {
    width: innerWidth - 67,
    height: (innerWidth * 9) / 17,
  },
  fullScreen: {
    height: innerWidth,
    width: innerHeight - 67,
  },
};

export const fullScreenInterpolate = (width, layout) => {
  const inputRange = [VideoSize.inline.width, VideoSize.fullScreen.width];

  const topRange = [PLATFORM_ANDROID ? layout.top : 0, PLATFORM_ANDROID ? 0 : -layout.top];
  const leftRange = [PLATFORM_ANDROID ? layout.left : 0, PLATFORM_ANDROID ? 0 : -layout.left];

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

export const sec2time = (time) => {
  var pad = function (num, size) {
    return ('000' + num).slice(size * -1);
  },
    hours = Math.floor(time / 60 / 60),
    minutes = Math.floor(time / 60) % 60,
    seconds = Math.floor(time - minutes * 60);

  return `${hours > 0 ? pad(hours, 2) + ':' : ''} ${pad(minutes, 2)} :${pad(
    seconds,
    2,
  )}`;
};
