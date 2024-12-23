/**
 * @format
 */

import 'react-native';
import React from 'react';

import App from '../App';

// Note: import explicitly to use the types shipped with jest.
import {it} from '@jest/globals';

// Note: test renderer must be required after react-native.
import {render, waitFor} from '@testing-library/react-native';

it('renders correctly', async () => {
	await waitFor(() => render(<App />));
});
