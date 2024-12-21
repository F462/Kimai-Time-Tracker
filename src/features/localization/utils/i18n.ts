import i18n, {InitOptions} from 'i18next';
import {initReactI18next} from 'react-i18next';

import en from '../resources/en.json';

const resources = {
	en: {translation: en},
};
const fallbackLanguageTag: keyof typeof resources = 'en';

const i18nextOptions: InitOptions = {
	resources: resources,
	lng: fallbackLanguageTag,
	fallbackLng: fallbackLanguageTag,
	interpolation: {
		escapeValue: false,
		skipOnVariables: false,
	},
	compatibilityJSON: 'v4',
};

i18n.use(initReactI18next).init(i18nextOptions).catch(console.error);

export default i18n;
