import i18n, {InitOptions} from 'i18next';
import dayjs from 'dayjs';
import {findBestLanguageTag} from 'react-native-localize';
import {initReactI18next} from 'react-i18next';

import './react-native-paper-dates';

import de from '../resources/de.json';
import en from '../resources/en.json';

const resources = {
	de: {translation: de},
	en: {translation: en}
};

const fallbackLanguageTag: keyof typeof resources = 'en';

const appLanguage = (() => {
	const languages = Object.keys(resources);
	return findBestLanguageTag(languages)?.languageTag ?? fallbackLanguageTag;
})();

const i18nextOptions: InitOptions = {
	resources: resources,
	lng: appLanguage,
	fallbackLng: fallbackLanguageTag,
	interpolation: {
		escapeValue: false,
		skipOnVariables: false
	},
	compatibilityJSON: 'v4'
};

i18n.use(initReactI18next).init(i18nextOptions).catch(console.error);

require('./dayjs');
dayjs.locale(appLanguage);

export default i18n;
