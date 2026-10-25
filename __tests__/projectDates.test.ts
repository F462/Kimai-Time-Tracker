import {formatDateDisplay} from 'src/features/projects/utils/dates';

describe('formatDateDisplay', () => {
	it('formats dates as DD.MM.YYYY regardless of locale', () => {
		expect(formatDateDisplay('2026-10-18')).toBe('18.10.2026');
	});

	it('returns an empty string for an unset date', () => {
		expect(formatDateDisplay(null)).toBe('');
	});
});
