import React, { PureComponent } from 'react'
import { StatusBar, View } from 'react-native'
import { fullScreenInterpolate, VideoSize } from './Utils'
import Orientation from 'react-native-orientation-locker';
import Animated, { EasingNode } from 'react-native-reanimated';
import styles from './styles';
import PlayerView from './YTWebView';
import PlayerControls from './Controls';
import { PLATFORM_ANDROID } from '../../Helper/ResponsiveScreen';
import { PlayerDefaultProps, PlayerProps, PlayerState } from './types';

export default class Player extends PureComponent<PlayerProps, PlayerState> {
  static defaultProps = PlayerDefaultProps;

  constructor(props: PlayerProps) {
    super(props);
    this.state = {
      ready: false,
      layoutReady: !PLATFORM_ANDROID,
      fullScreen: false,
      play: this.props.autoPlay,
      duration: 0,
      currentTime: 0,
      layout: {
        top: 0,
        left: 0,
      },
    };
  }
  player: any;

  _width = new Animated.Value(VideoSize.inline.width);
  _isUserUsingIconToFullScreen = false;

  componentDidMount() {
    this.toggleFS();
  }

  // listeners
  onDurationReady = (duration: number) => {
    this.setState({ duration });
    this.props.onDurationReady(duration);
    this.props.onStart();
  };

  onPlaying = (currentTime: number) => {
    this.setState({ currentTime });
    this.props.onPlaying(currentTime);
  };
  onReady = () => {
    this.setState({ ready: true });
    this.props.onReady();
  };
  onError = () => {
    this.props.onError();
  };
  onEnd = () => {
    const { onEnd, loop } = this.props;
    onEnd();
    if (loop) {
      this.seekTo(0);
      this.playVideo();
    }
  };

  onStateChange = (state: YTWebViewState) => {
    this.props.onStateChange(state);
  };
  onPlaybackRateChange = () => { };
  onPlaybackQualityChange = () => { };

  playVideo = () => {
    this.setState({ play: true });
    this.player._playVideo();
  };
  seekTo = async (s: number) => {
    this.setState({ currentTime: s });
    this.player._seekTo(s);
  };

  pauseVideo = () => {
    this.setState({ play: false });
    this.player._pauseVideo();
  };

  toggleFS = () => {
    this._isUserUsingIconToFullScreen = true;
    setTimeout(() => {
      this._isUserUsingIconToFullScreen = false;
    }, 2000);
    const rotateToFullScreen = true;
    this.setState({ fullScreen: !this.state.fullScreen }, () => {
      if (this.state.fullScreen) {
        this.goToFullScreen();
        if (rotateToFullScreen) {
          if (PLATFORM_ANDROID) Orientation.lockToLandscapeLeft();
          else Orientation.lockToLandscapeRight();
        }
      } else {
        this.goToInlineScreen();
        if (rotateToFullScreen) Orientation.lockToPortrait();
        setTimeout(() => {
          if (true) Orientation.unlockAllOrientations();
        }, 2000);
      }
    });
  };

  goToFullScreen = () => {
    this.props.onFullScreen(true);
    Animated.timing(this._width, {
      toValue: VideoSize.fullScreen.width + 2,
      duration: 200,
      easing: EasingNode.inOut(EasingNode.ease),
    }).start(() => StatusBar.setHidden(false));
  };
  goToInlineScreen = () => {
    this.props.onFullScreen(false);
    Animated.timing(this._width, {
      toValue: VideoSize.inline.width,
      duration: 200,
      easing: EasingNode.inOut(EasingNode.ease),
    }).start(() => StatusBar.setHidden(false));
  };
  onLayout = ({
    nativeEvent: {
      layout: { x, y },
    },
  }: any) => {
    this.setState({ layoutReady: true, layout: { top: y, left: x } });
  };

  render() {
    const { fullScreen } = this.state;
    const { height, top, left } = fullScreenInterpolate(
      this._width,
      this.state.layout,
    );

    const VideoStyle = fullScreen
      ? { ...styles.fullScreen }
      : {
        ...styles.inline,
      };

    const AbsoluteStyle = PLATFORM_ANDROID ? { ...this.state.layout } : {};

    const { playVideo, pauseVideo, seekTo, toggleFS } = this;
    const { videoId, autoPlay, topBar, showFullScreenButton } = this.props;
    const style: any = {
      ...VideoStyle,
      ...AbsoluteStyle,
      width: this._width,
      height,
      top,
      left,
    };
    return (
      <View style={styles.wrapper} onLayout={this.onLayout}>
        <Animated.View style={[style, styles.wraper]}>
          <PlayerView
            videoId={videoId}
            autoPlay={autoPlay}
            ref={(player: any) => (this.player = player)}
            onDurationReady={this.onDurationReady}
            onReady={this.onReady}
            onError={this.onError}
            onPlaying={this.onPlaying}
            onEnd={this.onEnd}
          />
          <PlayerControls
            {...{
              playVideo,
              seekTo,
              pauseVideo,
              toggleFS,
              topBar,
              showFullScreenButton,
              ...this.state,
            }}
          />
          {this.props.children}
        </Animated.View>
      </View>
    );
  }
}