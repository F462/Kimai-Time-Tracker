/**
 * Runs the Android app via the React Native CLI.
 *
 * The **debug** build (the default) is installed with a `.debug` applicationId
 * suffix (see `android/app/build.gradle`) so that it can be installed in
 * parallel with a **release** build on the same device.
 *
 * The CLI, however, launches the app using the base manifest package by
 * default, which resolves to the release build. To make sure the build that
 * was just installed is the one that actually starts, we pass a matching
 * `--appIdSuffix` for the debug variant.
 *
 * Usage:
 *   yarn android                  # build + run the debug build
 *   yarn android --mode=Release   # build + run the release build
 *
 * All extra arguments are forwarded to `react-native run-android`.
 */
/// <reference types="node" />

const {spawnSync} = require('node:child_process');

function getMode(args: string[]): string {
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg.startsWith('--mode=')) {
			return arg.slice('--mode='.length).toLowerCase();
		}
		if (arg === '--mode' && i + 1 < args.length) {
			return args[i + 1].toLowerCase();
		}
	}
	return 'debug';
}

const args = process.argv.slice(2);
const mode = getMode(args);

const cliArgs = ['run-android'];
if (mode === 'debug') {
	cliArgs.push('--appIdSuffix', 'debug');
}

const result = spawnSync('react-native', [...cliArgs, ...args], {
	shell: true,
	stdio: 'inherit',
});

if (result.error) {
	console.error(result.error);
}

process.exit(result.status === null ? 1 : result.status);
