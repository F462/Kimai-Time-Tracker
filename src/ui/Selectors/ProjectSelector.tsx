import React from 'react';
import {useTranslation} from 'react-i18next';

import {BaseSelector} from './BaseSelector';
import {Project} from 'src/features/projects/types';
import {selectProjectList} from 'src/features/projects/context/projectsSelectors';
import {useAppSelector} from 'src/features/data/context/store';

type ProjectSelectorProps = {
	selectedProject: Project | undefined;
	onSelectProject: React.ComponentProps<typeof BaseSelector>['onSelection'];
};
export const ProjectSelector = ({
	selectedProject,
	onSelectProject,
}: ProjectSelectorProps) => {
	const {t} = useTranslation();

	const projects = useAppSelector(selectProjectList);

	return (
		<BaseSelector
			elements={projects}
			selectedElement={selectedProject}
			label={t('selectProject')}
			onSelection={onSelectProject}
		/>
	);
};
