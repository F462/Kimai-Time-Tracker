import React, {useCallback} from 'react';

import {
	selectProjectList,
	selectSelectedProjectId
} from '../context/projectsSelectors';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {BaseScreen} from 'src/ui/BaseScreen';
import {DividedList} from 'src/ui/DividedList';
import {ListItem} from 'src/ui/ListItem';
import {ListItemText} from 'src/ui/ListItemText';
import {Project} from '../types';
import {projectSelected} from '../context/projectsSlice';

const ProjectItem = ({
	project,
	isSelected
}: {
	project: Project;
	isSelected: boolean;
}) => {
	const dispatch = useAppDispatch();
	const onProjectItemPress = useCallback(() => {
		dispatch(projectSelected(project.id));
	}, [dispatch, project.id]);

	return (
		<ListItem isSelected={isSelected} onPress={onProjectItemPress}>
			<ListItemText>{project.name}</ListItemText>
		</ListItem>
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
