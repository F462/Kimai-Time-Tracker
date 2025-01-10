import React from 'react';

import {selectProjectList, selectSelectedProjectId} from '../context/projectsSelectors';
import {BaseScreen} from 'src/ui/BaseScreen';
import {DividedList} from 'src/ui/DividedList';
import {ListItem} from 'src/ui/ListItem';
import {ListItemText} from 'src/ui/ListItemText';
import {Project} from '../types';
import {useAppSelector} from 'src/features/data/context/store';

const ProjectItem = ({project, isSelected}: {project: Project; isSelected: boolean;}) => {
	return (
		<ListItem isSelected={isSelected}>
			<ListItemText>{project.name}</ListItemText>
		</ListItem>);
};

const ProjectList = () => {
	const projectList = useAppSelector(selectProjectList);
	const selectedProjectId = useAppSelector(selectSelectedProjectId);

	return <DividedList data={projectList} renderItem={({item}) => <ProjectItem project={item} isSelected={item.id === selectedProjectId} />} />;
};

export const ProjectsScreen = () => {
	return <BaseScreen><ProjectList /></BaseScreen>;
};
