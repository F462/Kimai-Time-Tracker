import {Alert} from 'react-native';

import {useTranslation} from 'react-i18next';

import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {developmentWarningShown} from '../context/onboardingSlice';
import {selectHasDevelopmentWarningBeenShown} from '../context/onboardingSelectors';

export const Onboarding = () => {
	const dispatch = useAppDispatch();
	const {t} = useTranslation();

	const hasDevelopmentWarningBeenShown = useAppSelector(
		selectHasDevelopmentWarningBeenShown,
	);
	const isFirstLaunch = !hasDevelopmentWarningBeenShown;

	if (isFirstLaunch) {
		Alert.alert(t('warning'), t('onboarding.appStillInDevelopment'));
		dispatch(developmentWarningShown());
	}

	return null;
};
