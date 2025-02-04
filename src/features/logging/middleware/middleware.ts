import {FileLogger} from 'react-native-file-logger';
import {Middleware} from 'redux';

export const createLoggingMiddleware = (): Middleware => () => {
	return (next: (action: unknown) => void): ((action: unknown) => void) => {
		return action => {
			FileLogger.info(`Event dispatched: ${JSON.stringify(action)}`);

			return next(action);
		};
	};
};
