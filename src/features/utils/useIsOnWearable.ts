import {useEffect, useState} from 'react';
import DeviceInfo from 'react-native-device-info';
import {FileLogger} from 'react-native-file-logger';

export const useIsOnWearable = () => {
	const [isOnWearable, setIsOnWearable] = useState<boolean>();

	useEffect(() => {
		DeviceInfo.hasSystemFeature('android.hardware.type.watch')
			.then(hasFeature => {
				setIsOnWearable(hasFeature);
			})
			.catch(FileLogger.error);
	}, []);

	return isOnWearable;
};
