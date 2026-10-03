import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';

import {useAppDispatch} from 'src/features/data/context/store';
import {EntityItemContextMenu} from 'src/ui/EntityItemContextMenu';
import {removeProject} from '../middleware/projectsThunks';
import {Project} from '../types';

type ProjectItemContextMenuProps = {
	project: Project;
	visible: boolean;
	onHideMenu: () => void;
};

export const ProjectItemContextMenu = ({
	project,
	visible,
	onHideMenu,
}: ProjectItemContextMenuProps) => {
	const {t} = useTranslation();
	const dispatch = useAppDispatch();

	const onConfirmDelete = useCallback(() => {
		dispatch(removeProject(project.id)).catch(console.error);
	}, [project.id, dispatch]);

	return (
		<EntityItemContextMenu
			visible={visible}
			onHideMenu={onHideMenu}
			deleteTitle={t('deleteProject')}
			deleteWarning={t('deleteProjectWarning')}
			onConfirmDelete={onConfirmDelete}
		/>
	);
};
