import {ApiClient} from 'src/features/account/utils/ApiClient';

describe('ApiClient validation errors', () => {
	const client = ApiClient.getInstance();

	afterEach(() => {
		client.reset();
		jest.restoreAllMocks();
	});

	it('includes root-level form errors in the thrown message', async () => {
		client.configure('https://kimai.example');
		jest.spyOn(global, 'fetch').mockResolvedValue({
			ok: false,
			status: 400,
			statusText: 'Bad Request',
			json: async () => ({
				message: 'Validation Failed',
				errors: {errors: ['This form should not contain extra fields.']},
			}),
		} as Response);

		await expect(client.patch('api/users/1', {})).rejects.toThrow(
			'Validation Failed: This form should not contain extra fields.',
		);
	});
});
