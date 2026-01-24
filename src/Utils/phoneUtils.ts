// Enhanced country codes with focus on India and GCC countries
export const countryCodes = [
  // India (Primary)
  { code: '+91', country: 'India', flag: '🇮🇳', region: 'India' },
  
  // GCC Countries
  { code: '+971', country: 'UAE', flag: '🇦🇪', region: 'GCC' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', region: 'GCC' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼', region: 'GCC' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', region: 'GCC' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭', region: 'GCC' },
  { code: '+968', country: 'Oman', flag: '🇴🇲', region: 'GCC' },
  
  // Other Popular Countries
  { code: '+1', country: 'US/Canada', flag: '🇺🇸', region: 'North America' },
  { code: '+44', country: 'UK', flag: '🇬🇧', region: 'Europe' },
  { code: '+86', country: 'China', flag: '🇨🇳', region: 'Asia' },
  { code: '+81', country: 'Japan', flag: '🇯🇵', region: 'Asia' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', region: 'Europe' },
  { code: '+33', country: 'France', flag: '🇫🇷', region: 'Europe' },
  { code: '+39', country: 'Italy', flag: '🇮🇹', region: 'Europe' },
  { code: '+34', country: 'Spain', flag: '🇪🇸', region: 'Europe' },
  { code: '+7', country: 'Russia', flag: '🇷🇺', region: 'Europe/Asia' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷', region: 'South America' },
  { code: '+61', country: 'Australia', flag: '🇦🇺', region: 'Oceania' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷', region: 'Asia' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', region: 'Asia' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾', region: 'Asia' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭', region: 'Asia' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳', region: 'Asia' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩', region: 'Asia' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰', region: 'Asia' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩', region: 'Asia' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', region: 'Asia' },
];

/**
 * Combines country code and phone number into a single string
 * @param countryCode - The country code (e.g., '+91')
 * @param phoneNumber - The phone number without country code
 * @returns Combined phone number string
 */
export const combinePhoneNumber = (countryCode: string, phoneNumber: string): string => {
  if (!phoneNumber || !countryCode) return '';
  
  // Clean the phone number - remove any existing country codes that match our list
  let cleanNumber = phoneNumber.trim();
  
  // Check if the phone number already starts with any known country code
  const sortedCountryCodes = [...countryCodes].sort((a, b) => b.code.length - a.code.length);
  for (const country of sortedCountryCodes) {
    if (cleanNumber.startsWith(country.code)) {
      cleanNumber = cleanNumber.substring(country.code.length).trim();
      break;
    }
  }
  
  // Remove any leading + or 0
  cleanNumber = cleanNumber.replace(/^[\+0]+/, '');
  
  // Keep only digits, spaces, hyphens, and parentheses
  cleanNumber = cleanNumber.replace(/[^\d\s\-\(\)]/g, '');
  
  // Remove any leading/trailing whitespace
  cleanNumber = cleanNumber.trim();
  
  return `${countryCode}${cleanNumber}`;
};

/**
 * Separates a full phone number into country code and phone number
 * @param fullPhoneNumber - The complete phone number with country code
 * @returns Object with separated country code and phone number
 */
export const separatePhoneNumber = (fullPhoneNumber: string): { countryCode: string; phoneNumber: string } => {
  if (!fullPhoneNumber) return { countryCode: '+91', phoneNumber: '' };
  
  // Sort country codes by length (longest first) to match correctly
  const sortedCountryCodes = [...countryCodes].sort((a, b) => b.code.length - a.code.length);
  
  // Find matching country code
  const matchedCountry = sortedCountryCodes.find(country => 
    fullPhoneNumber.startsWith(country.code)
  );
  
  if (matchedCountry) {
    return {
      countryCode: matchedCountry.code,
      phoneNumber: fullPhoneNumber.substring(matchedCountry.code.length).trim()
    };
  }
  
  // Default fallback - assume it's an Indian number if no country code found
  return { countryCode: '+91', phoneNumber: fullPhoneNumber };
};

/**
 * Validates a phone number format
 * @param phoneNumber - The phone number to validate
 * @returns Boolean indicating if the phone number is valid
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber) return false;
  
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // Check if it has a reasonable length (6-15 digits as per international standards)
  return digitsOnly.length >= 6 && digitsOnly.length <= 15;
};

/**
 * Formats a phone number for display
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number string
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  const { countryCode, phoneNumber: number } = separatePhoneNumber(phoneNumber);
  const country = countryCodes.find(c => c.code === countryCode);
  
  return `${countryCode} ${number}${country ? ` (${country.country})` : ''}`;
};

/**
 * Gets country information by country code
 * @param countryCode - The country code to look up
 * @returns Country information object or null
 */
export const getCountryByCode = (countryCode: string) => {
  return countryCodes.find(country => country.code === countryCode) || null;
};

/**
 * Groups country codes by region for better UX
 * @returns Object with countries grouped by region
 */
export const getCountriesByRegion = () => {
  const regions: Record<string, typeof countryCodes> = {};
  
  countryCodes.forEach(country => {
    if (!regions[country.region]) {
      regions[country.region] = [];
    }
    regions[country.region].push(country);
  });
  
  return regions;
};