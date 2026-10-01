import {useTranslation} from 'react-i18next';
import {Alert} from 'react-native';

import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {selectHasDevelopmentWarningBeenShown} from '../context/onboardingSelectors';
import {developmentWarningShown} from '../context/onboardingSlice';

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
