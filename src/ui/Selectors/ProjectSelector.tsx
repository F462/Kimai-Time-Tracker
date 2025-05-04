import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';

import {
	selectProjectList,
	selectProjects,
} from 'src/features/projects/context/projectsSelectors';
import {BaseSelector} from './BaseSelector';
import {Project} from 'src/features/projects/types';
import {parseSelectedId} from 'src/features/timesheets/utils/functions';
import {useAppSelector} from 'src/features/data/context/store';

type ProjectSelectorProps = {
	selectedProject: Project | undefined;
	onSelectProject: (project: Project | undefined) => void;
};
export const ProjectSelector = ({
	selectedProject,
	onSelectProject,
}: ProjectSelectorProps) => {
	const {t} = useTranslation();

	const projects = useAppSelector(selectProjects);
	const projectList = useAppSelector(selectProjectList);

	const convertSelectionToProject = useCallback(
		(
			value: Parameters<
				React.ComponentProps<typeof BaseSelector>['onSelection']
			>[0],
		) => {
			const selectedProjectId = parseSelectedId(value.selectedList[0]);

			onSelectProject(
				selectedProjectId !== undefined
					? projects[selectedProjectId]
					: undefined,
			);
		},
		[projects, onSelectProject],
	);

	return (
		<BaseSelector
			elements={projectList}
			selectedElement={selectedProject}
			label={t('selectProject')}
			onSelection={convertSelectionToProject}
		/>
	);
};
