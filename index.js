/**
 * @format
 */

import 'react-native-get-random-values';

import {AppRegistry} from 'react-native';

import App from './App';
import {name as appName} from './app.json';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

import 'src/features/logging/utils/initialization';

AppRegistry.registerComponent(appName, () => App);
