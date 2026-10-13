export type SelectOption = {
	value: string;
	label: string;
};

/**
 * Languages offered when creating or editing a customer.
 * The stored value is the ISO 639-1 code expected by the Kimai API.
 */
export const LANGUAGES: Array<SelectOption> = [
	{value: 'en', label: 'English'},
	{value: 'de', label: 'German'},
	{value: 'fr', label: 'French'},
	{value: 'es', label: 'Spanish'},
	{value: 'it', label: 'Italian'},
	{value: 'nl', label: 'Dutch'},
	{value: 'pt', label: 'Portuguese'},
	{value: 'pl', label: 'Polish'},
	{value: 'cs', label: 'Czech'},
	{value: 'sk', label: 'Slovak'},
	{value: 'sl', label: 'Slovenian'},
	{value: 'hu', label: 'Hungarian'},
	{value: 'ro', label: 'Romanian'},
	{value: 'bg', label: 'Bulgarian'},
	{value: 'ru', label: 'Russian'},
	{value: 'uk', label: 'Ukrainian'},
	{value: 'el', label: 'Greek'},
	{value: 'he', label: 'Hebrew'},
	{value: 'ar', label: 'Arabic'},
	{value: 'tr', label: 'Turkish'},
	{value: 'fa', label: 'Persian'},
	{value: 'hi', label: 'Hindi'},
	{value: 'id', label: 'Indonesian'},
	{value: 'vi', label: 'Vietnamese'},
	{value: 'th', label: 'Thai'},
	{value: 'ja', label: 'Japanese'},
	{value: 'ko', label: 'Korean'},
	{value: 'zh-CN', label: 'Chinese (Simplified)'},
	{value: 'zh-TW', label: 'Chinese (Traditional)'},
];

/**
 * Currencies offered when creating or editing a customer.
 * The stored value is the ISO 4217 code expected by the Kimai API.
 */
export const CURRENCIES: Array<SelectOption> = [
	{value: 'EUR', label: 'Euro'},
	{value: 'USD', label: 'US Dollar'},
	{value: 'GBP', label: 'British Pound'},
	{value: 'CHF', label: 'Swiss Franc'},
	{value: 'JPY', label: 'Japanese Yen'},
	{value: 'CNY', label: 'Chinese Yuan'},
	{value: 'CAD', label: 'Canadian Dollar'},
	{value: 'AUD', label: 'Australian Dollar'},
	{value: 'NZD', label: 'New Zealand Dollar'},
	{value: 'SEK', label: 'Swedish Krona'},
	{value: 'NOK', label: 'Norwegian Krone'},
	{value: 'DKK', label: 'Danish Krone'},
	{value: 'PLN', label: 'Polish Zloty'},
	{value: 'CZK', label: 'Czech Koruna'},
	{value: 'HUF', label: 'Hungarian Forint'},
	{value: 'RON', label: 'Romanian Leu'},
	{value: 'RUB', label: 'Russian Ruble'},
	{value: 'UAH', label: 'Ukrainian Hryvnia'},
	{value: 'TRY', label: 'Turkish Lira'},
	{value: 'INR', label: 'Indian Rupee'},
	{value: 'KRW', label: 'South Korean Won'},
	{value: 'MXN', label: 'Mexican Peso'},
	{value: 'BRL', label: 'Brazilian Real'},
	{value: 'SGD', label: 'Singapore Dollar'},
	{value: 'THB', label: 'Thai Baht'},
	{value: 'IDR', label: 'Indonesian Rupiah'},
	{value: 'VND', label: 'Vietnamese Dong'},
	{value: 'HKD', label: 'Hong Kong Dollar'},
	{value: 'ILS', label: 'Israeli New Shekel'},
	{value: 'AED', label: 'UAE Dirham'},
	{value: 'ZAR', label: 'South African Rand'},
];

/**
 * Countries offered when creating or editing a customer.
 * The stored value is the ISO 3166-1 alpha-2 code expected by the Kimai API.
 * The Kimai server requires a non-empty, valid country code on every customer.
 */
export const COUNTRIES: Array<SelectOption> = [
	{value: 'AT', label: 'Austria'},
	{value: 'BE', label: 'Belgium'},
	{value: 'BG', label: 'Bulgaria'},
	{value: 'CA', label: 'Canada'},
	{value: 'CH', label: 'Switzerland'},
	{value: 'CN', label: 'China'},
	{value: 'CZ', label: 'Czechia'},
	{value: 'DE', label: 'Germany'},
	{value: 'DK', label: 'Denmark'},
	{value: 'EE', label: 'Estonia'},
	{value: 'ES', label: 'Spain'},
	{value: 'FI', label: 'Finland'},
	{value: 'FR', label: 'France'},
	{value: 'GB', label: 'United Kingdom'},
	{value: 'GR', label: 'Greece'},
	{value: 'HR', label: 'Croatia'},
	{value: 'HU', label: 'Hungary'},
	{value: 'IE', label: 'Ireland'},
	{value: 'IT', label: 'Italy'},
	{value: 'JP', label: 'Japan'},
	{value: 'LU', label: 'Luxembourg'},
	{value: 'LT', label: 'Lithuania'},
	{value: 'LV', label: 'Latvia'},
	{value: 'MT', label: 'Malta'},
	{value: 'NL', label: 'Netherlands'},
	{value: 'NO', label: 'Norway'},
	{value: 'PL', label: 'Poland'},
	{value: 'PT', label: 'Portugal'},
	{value: 'RO', label: 'Romania'},
	{value: 'RS', label: 'Serbia'},
	{value: 'SE', label: 'Sweden'},
	{value: 'SI', label: 'Slovenia'},
	{value: 'SK', label: 'Slovakia'},
	// eslint-disable-next-line @cspell/spellchecker
	{value: 'TR', label: 'Türkiye'},
	{value: 'UA', label: 'Ukraine'},
	{value: 'US', label: 'United States'},
];
