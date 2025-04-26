import {Middleware} from 'redux';

export const createLoggingMiddleware =
	({ignoredPayload}: {ignoredPayload: Array<string>}): Middleware =>
	() => {
		return (next: (action: unknown) => void): ((action: any) => void) => {
			return (action) => {
				console.info(
					`Event dispatched: ${JSON.stringify(ignoredPayload.includes(action.type) ? action.type : action)}`,
				);

				return next(action);
			};
		};
	};
