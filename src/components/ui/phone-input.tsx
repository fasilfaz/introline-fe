import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { combinePhoneNumber, validatePhoneNumber, getCountriesByRegion } from '@/Utils/phoneUtils';

interface PhoneInputProps {
  label: string;
  phoneValue: string;
  countryCodeValue: string;
  onPhoneChange: (value: string) => void;
  onCountryCodeChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ 
  label, 
  phoneValue, 
  countryCodeValue, 
  onPhoneChange, 
  onCountryCodeChange, 
  placeholder = "Enter phone number", 
  error,
  icon: IconComponent,
  required = false,
  disabled = false,
  className = ""
}) => {
  const countriesByRegion = getCountriesByRegion();
  
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className={`${error ? 'text-red-500' : 'text-gray-700'} group-hover:text-blue-700 transition-colors duration-200 flex items-center gap-1 font-medium`}>
        {IconComponent && <IconComponent className="h-4 w-4" />}
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="flex gap-2">
        <Select 
          value={countryCodeValue} 
          onValueChange={onCountryCodeChange}
          disabled={disabled}
        >
          <SelectTrigger className={`w-32 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {/* Group by region for better UX */}
            <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50">India</div>
            {countriesByRegion.India?.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <span className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.code}</span>
                  <span className="text-xs text-gray-500">{country.country}</span>
                </span>
              </SelectItem>
            ))}
            
            <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50">GCC Countries</div>
            {countriesByRegion.GCC?.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <span className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.code}</span>
                  <span className="text-xs text-gray-500">{country.country}</span>
                </span>
              </SelectItem>
            ))}
            
            <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50">Other Countries</div>
            {Object.entries(countriesByRegion)
              .filter(([region]) => !['India', 'GCC'].includes(region))
              .flatMap(([, countries]) => countries)
              .map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <span className="flex items-center gap-2">
                    <span>{country.flag}</span>
                    <span>{country.code}</span>
                    <span className="text-xs text-gray-500">{country.country}</span>
                  </span>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Input
          type="tel"
          placeholder={placeholder}
          value={phoneValue}
          disabled={disabled}
          onChange={(e) => {
            // Only allow numbers and basic formatting
            const value = e.target.value.replace(/[^\d\s\-\(\)]/g, '');
            onPhoneChange(value);
          }}
          className={`flex-1 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'} transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      </div>
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
      {/* Show combined number preview and validation */}
      {phoneValue && countryCodeValue && (
        <div className="space-y-1">
          <p className="text-xs text-gray-500">
            Full number: {combinePhoneNumber(countryCodeValue, phoneValue)}
          </p>
          {!validatePhoneNumber(phoneValue) && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Phone number should be 6-15 digits
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PhoneInput;