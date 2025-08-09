import React from 'react';
import {useTranslation} from 'react-i18next';

import {Activity} from 'src/features/activities/types';
import {BaseSelector} from './BaseSelector';
import {selectActivityList} from 'src/features/activities/context/activitiesSelectors';
import {useAppSelector} from 'src/features/data/context/store';

type ActivitySelectorProps = {
	selectedActivity: Activity | undefined;
	onSelectActivity: React.ComponentProps<typeof BaseSelector>['onSelection'];
};
export const ActivitySelector = ({
	selectedActivity,
	onSelectActivity,
}: ActivitySelectorProps) => {
	const {t} = useTranslation();

	const activities = useAppSelector(selectActivityList);

	return (
		<BaseSelector
			elements={activities}
			selectedElement={selectedActivity}
			label={t('selectActivity')}
			onSelection={onSelectActivity}
		/>
	);
};
