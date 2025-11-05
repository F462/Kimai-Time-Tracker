import {AppState} from 'react-native';
import {useEffect} from 'react';

import {sessionLocked} from 'src/features/appState/context/appStateSlice';
import {useAppDispatch} from 'src/features/data/context/store';

export const SessionLocker = () => {
	const dispatch = useAppDispatch();

	useEffect(() => {
		const subscription = AppState.addEventListener('change', (nextAppState) => {
			if (nextAppState === 'background') {
				dispatch(sessionLocked());
			}
		});

		return () => {
			subscription.remove();
		};
	}, [dispatch]);

	return null;
};
