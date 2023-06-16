import { hp, wp } from "../Helper/ResponsiveScreen";
import { Colors } from "./Colors";

export default (commonStyles = {
  textWhiteBgStyle: {
    borderColor: Colors.APP_TAB_GRAY_COLOR,
    width: wp(90),
    marginBottom: hp(1),
  },
  textWhiteBgTextStyle: { color: Colors.FONT_GRAY_COLOR },
  modalView: {
    justifyContent: 'flex-end',
    margin: 0
  },
  screenWrapperContent: { backgroundColor: Colors.White },
  topborder: {
    backgroundColor: Colors.Gray2,
    height: hp(1),
    alignSelf: "center",
    width: wp(15),
    borderRadius: wp(10),
    marginBottom: hp(1)
  },
  SHADOW: {
    shadowColor: Colors.APP_DARK_BLUE_COLOR,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 30,
    backgroundColor: Colors.White,
  },
  SMALL_SHADOW: {
    shadowColor: '#acb0b7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 2,
    backgroundColor: Colors.CARD_BACKGROUND_COLOR,
  }
});
