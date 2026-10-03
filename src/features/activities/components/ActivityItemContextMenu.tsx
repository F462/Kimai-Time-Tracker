import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';

import {useAppDispatch} from 'src/features/data/context/store';
import {EntityItemContextMenu} from 'src/ui/EntityItemContextMenu';
import {removeActivity} from '../middleware/activitiesThunks';
import {Activity} from '../types';

type ActivityItemContextMenuProps = {
	activity: Activity;
	visible: boolean;
	onHideMenu: () => void;
};

export const ActivityItemContextMenu = ({
	activity,
	visible,
	onHideMenu,
}: ActivityItemContextMenuProps) => {
	const {t} = useTranslation();
	const dispatch = useAppDispatch();

	const onConfirmDelete = useCallback(() => {
		dispatch(removeActivity(activity.id)).catch(console.error);
	}, [activity.id, dispatch]);

	return (
		<EntityItemContextMenu
			visible={visible}
			onHideMenu={onHideMenu}
			deleteTitle={t('deleteActivity')}
			deleteWarning={t('deleteActivityWarning')}
			onConfirmDelete={onConfirmDelete}
		/>
	);
};
