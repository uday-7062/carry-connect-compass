
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cities } from '@/data/cities';
import { ChevronDown, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CitySelectorProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const CitySelector = ({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder = "Search for a city...",
  required = false 
}: CitySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const filtered = cities.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10); // Show max 10 results
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleCitySelect = (city: string) => {
    onChange(city);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredCities.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredCities[highlightedIndex]) {
          handleCitySelect(filteredCities[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleFocus = () => {
    if (value && filteredCities.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          <MapPin className="h-4 w-4 text-gray-400" />
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
        
        {isOpen && filteredCities.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredCities.map((city, index) => (
              <div
                key={city}
                className={cn(
                  "px-4 py-2 cursor-pointer text-sm",
                  index === highlightedIndex 
                    ? "bg-blue-50 text-blue-900" 
                    : "hover:bg-gray-50"
                )}
                onClick={() => handleCitySelect(city)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="flex items-center space-x-2">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span>{city}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {isOpen && value && filteredCities.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
            <div className="px-4 py-2 text-sm text-gray-500">
              No cities found. You can still type your custom location.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
