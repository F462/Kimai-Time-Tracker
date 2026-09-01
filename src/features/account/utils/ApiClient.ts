import {StatusCodes} from 'http-status-codes';

export interface ApiClientOptions extends Omit<RequestInit, 'body'> {
	headers?: Record<string, string>;
	body?: Record<string, unknown> | unknown[] | string;
}

export class ApiClient {
	private static instance: ApiClient;
	private baseUrl: string = '';
	private authToken: string | null = null;

	// Private constructor prevents direct instantiation with `new`
	private constructor() {}

	/**
	 * Access the shared ApiClient instance.
	 */
	public static getInstance(): ApiClient {
		if (!ApiClient.instance) {
			ApiClient.instance = new ApiClient();
		}
		return ApiClient.instance;
	}

	/**
	 * Configure or update the client configuration (e.g., after login).
	 */
	public configure(baseUrl: string, authToken: string | null = null): void {
		this.baseUrl = baseUrl.replace(/\/+$/, '');
		this.authToken = authToken;
	}

	/**
	 * Reset the configuration, e.g., after logout.
	 */
	public reset(): void {
		this.baseUrl = '';
		this.authToken = null;
	}

	/**
	 * Check if the client has been initialized with a base URL.
	 */
	public isConfigured(): boolean {
		return !!this.baseUrl;
	}

	/**
	 * To fetch the base URL to which the client is configured against.
	 *
	 * @returns The base URL of the API client
	 */
	public getBaseUrl(): string {
		return this.baseUrl;
	}

	/**
	 * Perform an HTTP request using the stored base URL and auth token.
	 */
	public async request<TResponse = unknown>(
		endpoint: string,
		options: ApiClientOptions = {},
	): Promise<TResponse> {
		if (!this.baseUrl) {
			throw new Error(
				'ApiClient is not configured. Call ApiClient.getInstance().configure(baseUrl) first.',
			);
		}

		const {body, headers, ...customConfig} = options;

		const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
		const fullUrl = `${this.baseUrl}${cleanEndpoint}`;

		const config: RequestInit = {
			...customConfig,
			headers: {
				'Content-Type': 'application/json',
				...(this.authToken ? {Authorization: `Bearer ${this.authToken}`} : {}),
				...headers,
			},
		};

		if (body !== undefined) {
			config.body = typeof body === 'string' ? body : JSON.stringify(body);
		}

		const response = await fetch(fullUrl, config);

		if (!response.ok) {
			let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
			try {
				const errorData = await response.json();
				if (errorData?.message) {
					errorMessage = errorData.message;
				}
			} catch {
				// Fallback to HTTP status if body isn't JSON
			}
			throw new Error(errorMessage);
		}

		if (response.status === StatusCodes.NO_CONTENT) {
			return {} as TResponse;
		}

		return response.json() as Promise<TResponse>;
	}

	// Helper HTTP methods for cleaner syntax
	public get<TResponse = unknown>(
		endpoint: string,
		options?: Omit<ApiClientOptions, 'method'>,
	) {
		return this.request<TResponse>(endpoint, {...options, method: 'GET'});
	}

	public post<TResponse = unknown>(
		endpoint: string,
		body?: ApiClientOptions['body'],
		options?: Omit<ApiClientOptions, 'method' | 'body'>,
	) {
		return this.request<TResponse>(endpoint, {
			...options,
			method: 'POST',
			body,
		});
	}

	public put<TResponse = unknown>(
		endpoint: string,
		body?: ApiClientOptions['body'],
		options?: Omit<ApiClientOptions, 'method' | 'body'>,
	) {
		return this.request<TResponse>(endpoint, {...options, method: 'PUT', body});
	}

	public patch<TResponse = unknown>(
		endpoint: string,
		body?: ApiClientOptions['body'],
		options?: Omit<ApiClientOptions, 'method' | 'body'>,
	) {
		return this.request<TResponse>(endpoint, {
			...options,
			method: 'PATCH',
			body,
		});
	}

	public delete<TResponse = unknown>(
		endpoint: string,
		options?: Omit<ApiClientOptions, 'method'>,
	) {
		return this.request<TResponse>(endpoint, {...options, method: 'DELETE'});
	}
}

// Export pre-instantiated singleton instance for convenience
export const api = ApiClient.getInstance();
