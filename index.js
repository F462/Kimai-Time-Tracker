/**
 * @format
 */

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import duration from 'dayjs/plugin/duration';
import {AppRegistry} from 'react-native';

import App from './App';
import {name as appName} from './app.json';

import 'react-native-get-random-values';
dayjs.extend(duration);
dayjs.extend(customParseFormat);

import 'src/features/logging/utils/initialization';
import 'src/features/debugging/utils/whyDidYouRender';

AppRegistry.registerComponent(appName, () => App);
