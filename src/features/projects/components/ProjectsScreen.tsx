import React, {useCallback, useState} from 'react';

import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {BaseScreen} from 'src/ui/BaseScreen';
import {DividedList} from 'src/ui/DividedList';
import {EntityListItem} from 'src/ui/EntityListItem';
import {
	selectProjectList,
	selectSelectedProjectId,
} from '../context/projectsSelectors';
import {projectSelected} from '../context/projectsSlice';
import {Project} from '../types';
import {ProjectItemContextMenu} from './ProjectItemContextMenu';

const ProjectItem = ({
	project,
	isSelected,
}: {
	project: Project;
	isSelected: boolean;
}) => {
	const dispatch = useAppDispatch();
	const [contextMenuVisible, setContextMenuVisible] = useState(false);

	const onProjectItemPress = useCallback(() => {
		dispatch(projectSelected(project.id));
	}, [dispatch, project.id]);
	const onOpenContextMenu = useCallback(() => setContextMenuVisible(true), []);
	const onHideContextMenu = useCallback(() => setContextMenuVisible(false), []);

	return (
		<EntityListItem
			name={project.name}
			isSelected={isSelected}
			onPress={onProjectItemPress}
			onLongPress={onOpenContextMenu}
			contextMenu={
				<ProjectItemContextMenu
					project={project}
					visible={contextMenuVisible}
					onHideMenu={onHideContextMenu}
				/>
			}
		/>
	);
};

const ProjectList = () => {
	const projectList = useAppSelector(selectProjectList);
	const selectedProjectId = useAppSelector(selectSelectedProjectId);

	return (
		<DividedList
			data={projectList}
			renderItem={({item}) => (
				<ProjectItem
					project={item}
					isSelected={item.id === selectedProjectId}
				/>
			)}
		/>
	);
};

export const ProjectsScreen = () => {
	return (
		<BaseScreen>
			<ProjectList />
		</BaseScreen>
	);
};
