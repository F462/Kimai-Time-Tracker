import {render} from '@testing-library/react-native';
import React from 'react';

import {EntityListItem} from './EntityListItem';

test('renders the project color indicator and uses a radio selection control', () => {
	const {getByText, getByTestId, getByRole} = render(
		<EntityListItem name="Project Alpha" isSelected color="#ff6b6b" />,
	);

	expect(getByText('Project Alpha')).toBeTruthy();
	expect(getByTestId('entity-list-item-indicator')).toBeTruthy();
	expect(getByRole('radio')).toBeTruthy();
});
