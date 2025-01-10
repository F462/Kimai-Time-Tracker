import React from 'react';

import {Text} from 'react-native-paper';
import {View} from 'react-native';

import {DividedList} from 'src/ui/DividedList';
import {Project} from '../types';
import {selectProjectList} from '../context/projectsSelectors';
import {useAppSelector} from 'src/features/data/context/store';

const ProjectItem = ({project}: {project: Project}) => {
	return <View>
		<Text>{project.name}</Text>
	</View>;
};

const ProjectList = () => {
	const projectList = useAppSelector(selectProjectList);

	return <DividedList data={projectList} renderItem={({item}) => <ProjectItem project={item} />} />;
};

export const ProjectsScreen = () => {
	return <View><ProjectList /></View>;
};
