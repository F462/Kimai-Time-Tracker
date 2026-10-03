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
import {Project} from '../types';
import {AddProjectModal} from './AddProjectModal';
import {ProjectItemContextMenu} from './ProjectItemContextMenu';

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
			<AddProjectModal visible={addModalVisible} onHideModal={onHideAddModal} />
		</BaseScreen>
	);
};
