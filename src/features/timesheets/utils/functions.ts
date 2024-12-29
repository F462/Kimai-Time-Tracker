import {ListItem} from 'react-native-paper-select/lib/typescript/interface/paperSelect.interface';

export function isValidDate(date: any): date is Date {
	return (
		date &&
		Object.prototype.toString.call(date) === '[object Date]' &&
		!isNaN(date)
	);
}

export const parseSelectedId = (element: ListItem) => {
	if (element === undefined) {
		return undefined;
	}

	return parseInt(element._id, 10);
};
