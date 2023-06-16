import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  inline: {
    //flex: 0,
    zIndex: 99,
    elevation: 1,
    backgroundColor: '#000',
    ...StyleSheet.absoluteFillObject,
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    marginTop: 0,
    flex: 1,
    // zIndex: 999,
    // elevation: 999,
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  button: {
    borderColor: '#000',
    borderWidth: 1,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    borderRadius: 15,
  },
  wrapper: {
    height: '100%',
    width: '100%',
    // zIndex: 100,
    //paddingTop: 30,
    backgroundColor: '#000',
    overflow: 'visible',
    // borderWidth: 3, borderColor:'green',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wraper: {
    // height: VideoSize.inline.height,
    // width: VideoSize.inline.width,
    height: '100%',
    width: '100%',
    // zIndex: 100,
    flex: 1,
    paddingTop: 30,
    backgroundColor: '#000',
    // borderWidth: 3, borderColor:'red',
    // overflow: "visible"
  },
});

export default styles;