import {createAction} from '@reduxjs/toolkit';

import type {BackupData} from '../types';

export const backupDataImported = createAction<BackupData>(
	'backup/dataImported',
);
