import {ListItem} from 'react-native-paper-select/lib/typescript/interface/paperSelect.interface';

export const parseSelectedId = (element: ListItem) => {
	if (element === undefined) {
		return undefined;
	}

	return parseInt(element._id, 10);
};
