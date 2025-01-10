import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedFormat);
require('dayjs/locale/en');
require('dayjs/locale/de');
