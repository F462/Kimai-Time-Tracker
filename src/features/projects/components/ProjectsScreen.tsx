import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';
import {FAB} from 'react-native-paper';

import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {BaseScreen} from 'src/ui/BaseScreen';
import {DividedList} from 'src/ui/DividedList';
import {EntityListItem} from 'src/ui/EntityListItem';
import {
	selectProjectList,
	selectSelectedProjectId,
} from '../context/projectsSelectors';
import {projectSelected} from '../context/projectsSlice';
import {fetchProjects} from '../middleware/projectsThunks';
import {Project} from '../types';
import {ProjectItemContextMenu} from './ProjectItemContextMenu';
import {ProjectModal} from './ProjectModal';

const styles = StyleSheet.create({
	fab: {
		position: 'absolute',
		right: 20,
		bottom: 20,
	},
});

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
			color={project.color}
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
	const dispatch = useAppDispatch();
	const projectList = useAppSelector(selectProjectList);
	const selectedProjectId = useAppSelector(selectSelectedProjectId);
	const onRefresh = useCallback(() => dispatch(fetchProjects()), [dispatch]);

	return (
		<DividedList
			data={projectList}
			onRefresh={onRefresh}
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
	const {t} = useTranslation();
	const [addModalVisible, setAddModalVisible] = useState(false);

	const onShowAddModal = useCallback(() => setAddModalVisible(true), []);
	const onHideAddModal = useCallback(() => setAddModalVisible(false), []);

	return (
		<BaseScreen>
			<ProjectList />
			<FAB
				icon="plus"
				label={t('addProject')}
				onPress={onShowAddModal}
				style={styles.fab}
			/>
			<ProjectModal visible={addModalVisible} onHideModal={onHideAddModal} />
		</BaseScreen>
	);
};
