import {useEffect, useState} from 'react';
import DeviceInfo from 'react-native-device-info';

export const useIsOnWearable = () => {
	const [isOnWearable, setIsOnWearable] = useState<boolean>();

	useEffect(() => {
		DeviceInfo.hasSystemFeature('android.hardware.type.watch')
			.then((hasFeature) => {
				setIsOnWearable(hasFeature);
			})
			.catch(console.error);
	}, []);

	return isOnWearable;
};
