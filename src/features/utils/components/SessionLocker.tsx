import {useEffect} from 'react';
import {AppState} from 'react-native';

import {
	appBecameActive,
	sessionLocked,
} from 'src/features/appState/context/appStateSlice';
import {useAppDispatch} from 'src/features/data/context/store';

export const SessionLocker = () => {
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (AppState.currentState === 'active') {
			dispatch(appBecameActive());
		}

		const subscription = AppState.addEventListener('change', (nextAppState) => {
			if (nextAppState === 'background') {
				dispatch(sessionLocked());
			} else if (nextAppState === 'active') {
				dispatch(appBecameActive());
			}
		});

		return () => {
			subscription.remove();
		};
	}, [dispatch]);

	return null;
};
