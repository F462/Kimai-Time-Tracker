import dayjs from 'dayjs';
import {useEffect, useState} from 'react';

export const useTime = (updateInterval: number = 1000) => {
	const [time, setTime] = useState(dayjs());

	useEffect(() => {
		const interval = setInterval(() => setTime(dayjs()), updateInterval);
		return () => {
			clearInterval(interval);
		};
	}, [updateInterval]);

	return time;
};
