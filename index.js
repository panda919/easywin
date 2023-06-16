/**
 * @format
 */

import 'react-native-get-random-values';
import {AppRegistry, LogBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

LogBox.ignoreLogs([
    'new NativeEventEmitter',
    'Warning: Each child in a list should have a unique "key" prop.',
    'Warning: Internal React error: Attempted to capture a commit phase error inside a detached tree. This indicates a bug in React. Likely causes include deleting the same fiber more than once, committing an already-finished tree, or an inconsistent return pointer.',
    'Warning: Each child in a list should have a unique "key" prop.',
    'Warning: Failed prop type: Invalid prop `progress` of type `string` supplied to `ProgressBar`, expected `number`.'
])

AppRegistry.registerComponent(appName, () => App);
