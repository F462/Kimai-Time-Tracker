import {FileLogger} from 'react-native-file-logger';
import {useEffect} from 'react';
import {watchEvents} from '@d4l/react-native-wear-connectivity';

export const WearableResponder = () => {
	useEffect(() => {
		const unsubscribe = watchEvents.on('message', message => {
			FileLogger.debug(message.text);
		});

		return () => unsubscribe();
	}, []);
	return null;
};
