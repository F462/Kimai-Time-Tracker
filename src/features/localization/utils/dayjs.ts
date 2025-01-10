import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import updateLocale from 'dayjs/plugin/updateLocale';

dayjs.extend(localizedFormat);
dayjs.extend(updateLocale);

require('dayjs/locale/en');
require('dayjs/locale/de');

dayjs.updateLocale('en', {
	formats: {
		LT: 'hh:mm A'
	}
});
