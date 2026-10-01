export interface QrCredentials {
	serverUrl: string;
	apiToken: string;
}

const SUPPORTED_TYPE = 'kimai';
const SUPPORTED_VERSIONS = [1];

/**
 * Parse and validate the raw value of a scanned Kimai QR code.
 *
 * A valid Kimai QR code decodes to a JSON object of the shape:
 * ```json
 * {
 *   "type": "kimai",
 *   "version": 1,
 *   "url": <string containing server URL>,
 *   "token": <string containing API token>
 * }
 * ```
 *
 * @param rawValue The raw string scanned from the QR code.
 * @returns The extracted server URL and API token.
 * @throws {Error} If the content cannot be parsed or fails validation.
 */
export function parseQrCredentials(rawValue: string): QrCredentials {
	let parsed: unknown;

	try {
		parsed = JSON.parse(rawValue);
	} catch {
		throw new Error('qr.invalidJson');
	}

	if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
		throw new Error('qr.invalidFormat');
	}

	const record = parsed as Record<string, unknown>;

	if (record.type !== SUPPORTED_TYPE) {
		throw new Error('qr.unsupportedType');
	}

	if (
		typeof record.version !== 'number' ||
		!SUPPORTED_VERSIONS.includes(record.version)
	) {
		throw new Error('qr.unsupportedVersion');
	}

	const serverUrl = record.url;
	const apiToken = record.token;

	if (typeof serverUrl !== 'string' || serverUrl.length === 0) {
		throw new Error('qr.missingUrl');
	}

	if (typeof apiToken !== 'string' || apiToken.length === 0) {
		throw new Error('qr.missingToken');
	}

	if (!/^(https?):\/\/[^\s/]+/i.test(serverUrl)) {
		throw new Error('qr.invalidUrl');
	}

	return {
		serverUrl: serverUrl.replace(/\/+$/, ''),
		apiToken,
	};
}
