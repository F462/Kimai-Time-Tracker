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

AppRegistry.registerComponent(appName, () => App);
