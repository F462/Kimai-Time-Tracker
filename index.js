/**
 * @format
 */

import 'react-native-get-random-values';

import {AppRegistry} from 'react-native';

import App from './App';
import {name as appName} from './app.json';

import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);
dayjs.extend(customParseFormat);

import 'src/features/logging/utils/initialization';
import 'src/features/debugging/utils/whyDidYouRender';

AppRegistry.registerComponent(appName, () => App);
