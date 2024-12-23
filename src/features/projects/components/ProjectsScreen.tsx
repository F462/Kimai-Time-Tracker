import React from 'react';

import {FlatList, View} from 'react-native';
import {Text} from 'react-native-paper';

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

	return <FlatList data={projectList} renderItem={({item}) => <ProjectItem project={item} />} />;
};

export const ProjectsScreen = () => {
	return <View><ProjectList /></View>;
};
