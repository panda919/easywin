import Reactotron, {
  trackGlobalErrors,
  openInEditor,
  overlay,
  asyncStorage,
  networking,
} from 'reactotron-react-native';
import { Platform, NativeModules } from 'react-native';
import { reactotronRedux } from 'reactotron-redux';

const { scriptURL } = NativeModules.SourceCode;
const scriptHostname =
  Platform.OS === 'android'
    ? 'localhost'
    : scriptURL.split('://')[1].split(':')[0];
const config = __DEV__
  ? {
      name: 'easywin',
      host: scriptHostname,
    }
  : {
      name: 'easywin',
    };

const reactotron = Reactotron.configure(config)
  .use(trackGlobalErrors())
  .use(openInEditor())
  .use(overlay())
  .use(asyncStorage())
  .use(networking())
  .use(reactotronRedux())
  .connect();

export default reactotron;
