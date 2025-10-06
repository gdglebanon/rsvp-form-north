'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface University {
  id: string;
  full_name: string;
  abbreviation: string;
  alt_text?: string;
}

interface UniversityComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

const defaultUniversities: University[] = [
  {
    id: 'aub',
    full_name: 'American University of Beirut',
    abbreviation: 'AUB',
    alt_text: 'AUB'
  },
  {
    id: 'lau',
    full_name: 'Lebanese American University',
    abbreviation: 'LAU',
    alt_text: 'LAU'
  },
  {
    id: 'usj',
    full_name: 'Saint Joseph University of Beirut',
    abbreviation: 'USJ'
  },
  {
    id: 'lu',
    full_name: 'Lebanese University',
    abbreviation: 'LU, LUFS1, ULFG1'
  },
  {
    id: 'bau',
    full_name: 'Beirut Arab University',
    abbreviation: 'BAU'
  },
  {
    id: 'uob',
    full_name: 'University of Balamand',
    abbreviation: 'UOB'
  },
  {
    id: 'ndu',
    full_name: 'Notre Dame University-Louaize',
    abbreviation: 'NDU'
  },
  {
    id: 'usek',
    full_name: 'Holy Spirit University of Kaslik',
    abbreviation: 'USEK'
  },
  {
    id: 'haigazian',
    full_name: 'Haigazian University',
    abbreviation: 'HU'
  },
  {
    id: 'upa',
    full_name: 'Antonine University',
    abbreviation: 'UPA'
  },
  {
    id: 'iul',
    full_name: 'Islamic University of Lebanon',
    abbreviation: 'IUL'
  },
  {
    id: 'global',
    full_name: 'Global University',
    abbreviation: 'GU'
  },
  {
    id: 'jinan',
    full_name: 'Jinan University',
    abbreviation: 'JU'
  },
  {
    id: 'aul',
    full_name: 'Arts, Sciences and Technology University in Lebanon',
    abbreviation: 'AUL'
  },
  {
    id: 'liu',
    full_name: 'Lebanese International University',
    abbreviation: 'LIU'
  },
  {
    id: 'mut',
    full_name: 'Manar University of Tripoli',
    abbreviation: 'MUT'
  },
  {
    id: 'meu',
    full_name: 'Middle East University',
    abbreviation: 'MEU'
  },
  {
    id: 'sagesse',
    full_name: 'Sagesse University',
    abbreviation: 'ULS'
  },
  {
    id: 'aust',
    full_name: 'American University of Science and Technology',
    abbreviation: 'AUST'
  },
  {
    id: 'rhu',
    full_name: 'Rafik Hariri University',
    abbreviation: 'RHU'
  },
  {
    id: 'aut',
    full_name: 'American University of Technology',
    abbreviation: 'AUT'
  },
  {
    id: 'mubs',
    full_name: 'Modern University for Business and Science',
    abbreviation: 'MUBS'
  },
  {
    id: 'aku',
    full_name: 'Al-Kafaàt University',
    abbreviation: 'AKU'
  },
  {
    id: 'self',
    full_name: 'Self taught',
    abbreviation: 'SELF'
  }
];

export function UniversityCombobox({ value = '', onChange }: UniversityComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const universities = React.useMemo(() => {
    // Sort universities with LAU first, then sort the rest alphabetically
    const sorted = [...defaultUniversities];
    sorted.sort((a, b) => {
      // Keep LAU first
      if (a.id === 'lau') return -1;
      if (b.id === 'lau') return 1;
      // Sort the rest alphabetically
      return a.full_name.localeCompare(b.full_name);
    });
    return sorted;
  }, []);

  const handleSelect = (currentValue: string) => {
    onChange(currentValue.toLowerCase() === value.toLowerCase() ? '' : currentValue);
    setOpen(false);
    setSearch('');
  };

  const handleCreate = () => {
    if (search.trim()) {
      onChange(search.trim());
      setOpen(false);
      setSearch('');
    }
  };

  const filteredUniversities = React.useMemo(() => {
    const searchTerm = search.trim();
    
    if (!searchTerm) {
      return universities; // Return all universities if search is empty
    }
    
    const searchTerms = searchTerm.toLowerCase().split(/\s+/);
    
    const searchInText = (text: string | undefined): boolean => {
      if (!text) return false;
      const lowerText = text.toLowerCase();
      return searchTerms.every(term => lowerText.includes(term));
    };

    return universities.filter((uni: University) => {
      if (!uni) return false;
      
      return (
        searchInText(uni.full_name) ||
        searchInText(uni.abbreviation) ||
        searchInText(uni.alt_text) ||
        (uni.alt_text?.split(/\s*,\s*/).some((part: string) => searchInText(part)) ?? false)
      );
    });
  }, [universities, search]);

  const selectedUniversity = React.useMemo(() => {
    return universities.find(
      (uni: University) => 
        (uni.full_name?.toLowerCase() === value?.toLowerCase()) ||
        (uni.abbreviation?.toLowerCase() === value?.toLowerCase())
    );
  }, [universities, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">
            {selectedUniversity?.full_name || value || 'Select company or university...'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[--radix-popover-trigger-width] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name, abbreviation, or alt text..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty className="py-2 text-center text-sm text-muted-foreground">
              No university found.
            </CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {filteredUniversities.map((uni) => (
                <CommandItem
                  key={uni.id}
                  value={uni.full_name}
                  onSelect={() => {
                    onChange(uni.full_name);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4 shrink-0',
                      value?.toLowerCase() === uni.full_name?.toLowerCase()
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  <span className="font-medium">{uni.full_name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            {search && (
              <div 
                className="flex cursor-pointer items-center p-2 text-sm text-muted-foreground hover:bg-accent"
                onClick={handleCreate}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create "{search}"
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
