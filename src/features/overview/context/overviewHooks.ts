import {useEffect} from 'react';

import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {computeOverview} from '../middleware/overviewThunks';
import type {MonthlyOverviewData} from '../utils/overviewUtils';
import {selectMonthlyOverview} from './overviewSelectors';

/**
 * Returns the monthly overview as pre-computed by `computeOverview` (which is
 * triggered when the timesheets are fetched and when the standard working
 * hours per day change).
 *
 * The heavy overtime calculation is performed outside of the render cycle, so
 * this hook only has to display the result. Until the calculation has run for
 * the first time (e.g. right after start-up, before the first fetch) it
 * triggers the calculation in the background and returns `null`.
 */
export const useMonthlyOverview = (): MonthlyOverviewData | null => {
	const dispatch = useAppDispatch();
	const overview = useAppSelector(selectMonthlyOverview);

	useEffect(() => {
		if (overview === null) {
			dispatch(computeOverview()).catch(console.warn);
		}
	}, [overview, dispatch]);

	return overview;
};
