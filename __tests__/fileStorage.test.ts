import {createFileStorage} from 'src/features/data/context/fileStorage';

describe('filesystem persistence adapter', () => {
	const files: Record<string, string> = {};
	const sharedFiles: Record<string, Record<string, string>> = {};
	const fileSystem = {
		exists: jest.fn(async (path: string) => path in files),
		mkdir: jest.fn(async (_path: string) => {}),
		readFile: jest.fn(async (path: string) => files[path] ?? ''),
		writeFile: jest.fn(async (path: string, value: string) => {
			files[path] = value;
		}),
		unlink: jest.fn(async (path: string) => {
			delete files[path];
		}),
	};
	const legacyStorage = {
		getItem: jest.fn(async (_key: string): Promise<string | null> => null),
		setItem: jest.fn(async (_key: string, _value: string): Promise<void> => {}),
		removeItem: jest.fn(async (_key: string): Promise<void> => {}),
	};
	const sharedStorage = {
		exists: jest.fn(
			async (uri: string, name: string) => name in (sharedFiles[uri] ?? {}),
		),
		readFile: jest.fn(
			async (uri: string, name: string) => sharedFiles[uri][name],
		),
		writeFile: jest.fn(async (uri: string, name: string, value: string) => {
			sharedFiles[uri] ??= {};
			sharedFiles[uri][name] = value;
		}),
		deleteFile: jest.fn(async (uri: string, name: string) => {
			delete sharedFiles[uri]?.[name];
		}),
		releaseFolder: jest.fn(async (_uri: string) => {}),
	};
	let storage: ReturnType<typeof createFileStorage>;

	beforeEach(() => {
		Object.keys(files).forEach((path) => delete files[path]);
		Object.keys(sharedFiles).forEach((uri) => delete sharedFiles[uri]);
		jest.clearAllMocks();
		legacyStorage.getItem.mockResolvedValue(null);
		storage = createFileStorage({
			directory: '/documents',
			fileSystem,
			legacyStorage,
			sharedStorage,
		});
	});

	it('persists and reads values from the app files directory', async () => {
		await storage.setItem('root', '{"timesheets":{}}');

		expect(fileSystem.writeFile).toHaveBeenCalledWith(
			'/documents/redux-persist-root.json',
			'{"timesheets":{}}',
			'utf8',
		);
		await expect(storage.getItem('root')).resolves.toBe('{"timesheets":{}}');
		expect(legacyStorage.getItem).not.toHaveBeenCalledWith('root');
	});

	it('migrates the existing AsyncStorage snapshot into a file', async () => {
		legacyStorage.getItem.mockImplementation(async (key) =>
			key === 'root' ? '{"projects":{}}' : null,
		);

		await expect(storage.getItem('root')).resolves.toBe('{"projects":{}}');
		expect(fileSystem.writeFile).toHaveBeenCalledWith(
			'/documents/redux-persist-root.json',
			'{"projects":{}}',
			'utf8',
		);
		expect(legacyStorage.removeItem).toHaveBeenCalledWith('root');
	});

	it('removes both file and legacy values', async () => {
		await storage.setItem('root', '{}');

		await storage.removeItem('root');

		await expect(storage.getItem('root')).resolves.toBeNull();
		expect(fileSystem.unlink).toHaveBeenCalledWith(
			'/documents/redux-persist-root.json',
		);
		expect(legacyStorage.removeItem).toHaveBeenCalledWith('root');
	});

	it('moves the persisted file into the selected shared folder', async () => {
		await storage.setItem('root', '{"timesheets":{}}');

		await storage.setExternalDirectory('content://shared/tree', 'Kimai');

		expect(
			sharedFiles['content://shared/tree']['redux-persist-root.json'],
		).toBe('{"timesheets":{}}');
		expect(files['/documents/redux-persist-root.json']).toBe(
			'{"timesheets":{}}',
		);
		expect(legacyStorage.setItem).toHaveBeenCalledWith(
			'kimai.persistence.folder-uri',
			'content://shared/tree',
		);
		await storage.setItem('root', '{"timesheets":{"new":true}}');
		expect(
			sharedFiles['content://shared/tree']['redux-persist-root.json'],
		).toBe('{"timesheets":{"new":true}}');
	});

	it('adopts an existing snapshot from the selected shared folder', async () => {
		await storage.setItem('root', '{"local":"data"}');
		sharedFiles['content://shared/tree'] = {
			'redux-persist-root.json': '{"synced":"data"}',
		};

		await storage.setExternalDirectory('content://shared/tree', 'Shared');

		expect(files['/documents/redux-persist-root.json']).toBe(
			'{"synced":"data"}',
		);
		await expect(storage.getItem('root')).resolves.toBe('{"synced":"data"}');
	});

	it('moves data back to private storage and releases the old folder', async () => {
		await storage.setItem('root', '{"current":"data"}');
		await storage.setExternalDirectory('content://shared/tree', 'Shared');

		await storage.setExternalDirectory(null);

		expect(files['/documents/redux-persist-root.json']).toBe(
			'{"current":"data"}',
		);
		expect(
			sharedFiles['content://shared/tree']['redux-persist-root.json'],
		).toBe('{"current":"data"}');
		expect(sharedStorage.releaseFolder).toHaveBeenCalledWith(
			'content://shared/tree',
		);
	});
});
