'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Babel plugin that embeds text files as string modules at build time,
 * e.g. `import license from 'src/assets/license.txt'` becomes
 * `const license = "<file content>"`.
 *
 * This works in both Debug and Release builds without a native module,
 * unlike fetching a resolved asset data-URI at runtime.
 */
module.exports = function ({types: t}) {
	const resolveTextFile = (source, state) => {
		if (typeof source !== 'string' || !source.endsWith('.txt')) {
			return null;
		}

		const root = state.cwd || process.cwd();
		const candidates = [];

		if (source.startsWith('./') || source.startsWith('../')) {
			candidates.push(path.resolve(path.dirname(state.filename), source));
		} else {
			// Bare specifiers such as `src/assets/license.txt` resolve
			// against the project root (workspace package or node_modules).
			candidates.push(path.resolve(root, source));
			candidates.push(path.resolve(root, 'node_modules', source));
		}

		for (const candidate of candidates) {
			try {
				if (fs.statSync(candidate).isFile()) {
					return candidate;
				}
			} catch {
				// not a file, try the next candidate
			}
		}

		return null;
	};

	return {
		visitor: {
			ImportDeclaration(importPath, state) {
				const filePath = resolveTextFile(importPath.node.source.value, state);
				if (!filePath) {
					return;
				}

				const [specifier] = importPath.node.specifiers;
				if (!t.isImportDefaultSpecifier(specifier)) {
					throw new Error(
						'babel-plugin-inline-text only supports default imports of .txt files',
					);
				}

				const content = fs.readFileSync(filePath, 'utf8');

				importPath.replaceWith(
					t.variableDeclaration('const', [
						t.variableDeclarator(
							t.identifier(specifier.local.name),
							t.stringLiteral(content),
						),
					]),
				);
			},
		},
	};
};
