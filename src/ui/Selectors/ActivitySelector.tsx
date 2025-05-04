import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';

import {
	selectActivities,
	selectActivityList,
} from 'src/features/activities/context/activitiesSelectors';
import {Activity} from 'src/features/activities/types';
import {BaseSelector} from './BaseSelector';
import {parseSelectedId} from '../../features/timesheets/utils/functions';
import {useAppSelector} from 'src/features/data/context/store';

type ActivitySelectorProps = {
	selectedActivity: Activity | undefined;
	onSelectActivity: (activity: Activity | undefined) => void;
};
export const ActivitySelector = ({
	selectedActivity,
	onSelectActivity,
}: ActivitySelectorProps) => {
	const {t} = useTranslation();

	const activities = useAppSelector(selectActivities);
	const activitiesList = useAppSelector(selectActivityList);

	const convertSelectionToActivity = useCallback(
		(
			value: Parameters<
				React.ComponentProps<typeof BaseSelector>['onSelection']
			>[0],
		) => {
			const selectedActivityId = parseSelectedId(value.selectedList[0]);

			onSelectActivity(
				selectedActivityId !== undefined
					? activities[selectedActivityId]
					: undefined,
			);
		},
		[activities, onSelectActivity],
	);

	return (
		<BaseSelector
			elements={activitiesList}
			selectedElement={selectedActivity}
			label={t('selectActivity')}
			onSelection={convertSelectionToActivity}
		/>
	);
};
