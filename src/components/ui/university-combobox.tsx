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
  onChange: (value: string, isCustom?: boolean) => void;
}

const defaultUniversities: University[] = [
   {
    id: 'aub',
    full_name: 'American University of Beirut',
    abbreviation: 'AUB',
    alt_text: 'American University of Beirut (AUB), AUB logo, American University of Beirut logo, AUB Beirut, American Univ Beirut, AUB Lebanon, American University Beirut'
  },
  {
    id: 'lau',
    full_name: 'Lebanese American University',
    abbreviation: 'LAU',
    alt_text: 'Lebanese American University (LAU), LAU logo, Lebanese American University logo, LAU Lebanon, Lebanese American Univ Beirut, Lebanese-American University, Lebanese American Uni, LAU Beirut Campus, LAU Byblos Campus, LAU Byblos, LAU Beirut'
  },
  {
    id: 'usj',
    full_name: 'Saint Joseph University of Beirut',
    abbreviation: 'USJ',
    alt_text: 'Saint Joseph University of Beirut (USJ), USJ logo, Saint Joseph University logo, Universite Saint-Joseph de Beyrouth, St Joseph University, Saint Joseph Univ Beirut, USJ Beirut'
  },
  {
    id: 'lu',
    full_name: 'Lebanese University',
    abbreviation: 'LU, LUFS1, ULFG1',
    alt_text: 'Lebanese University (LU), LU logo, Lebanese University logo, Universite Libanaise, UL logo, LUFS1, LUFG1, ULFG1, ULFS1, Lebanese National University, LU Lebanon, LU Hadat, LU Hadath, LU Nabatieh, LU Saida, LU Fanar, LU Tripoli'
  },
  {
    id: 'bau',
    full_name: 'Beirut Arab University',
    abbreviation: 'BAU',
    alt_text: 'Beirut Arab University (BAU), BAU logo, Beirut Arab University logo, BAU Lebanon, Beirut Arab Uni, BAU Beirut'
  },
  {
    id: 'uob',
    full_name: 'University of Balamand',
    abbreviation: 'UOB',
    alt_text: 'University of Balamand (UOB), UOB logo, University of Balamand logo, UOB Lebanon, Balamand University, Balamand Uni logo'
  },
  {
    id: 'ndu',
    full_name: 'Notre Dame University-Louaize',
    abbreviation: 'NDU',
    alt_text: 'Notre Dame University-Louaize (NDU), NDU logo, Notre Dame University Louaize logo, Notre Dame Louaize, NDU Lebanon, Notre Dame Univ Louaize'
  },
  {
    id: 'usek',
    full_name: 'Holy Spirit University of Kaslik',
    abbreviation: 'USEK',
    alt_text: 'Holy Spirit University of Kaslik (USEK), USEK logo, Holy Spirit University of Kaslik logo, USEK Lebanon, Holy Spirit Univ Kaslik, Universite Saint-Esprit de Kaslik'
  },
  {
    id: 'haigazian',
    full_name: 'Haigazian University',
    abbreviation: 'HU',
    alt_text: 'Haigazian University (HU), HU logo, Haigazian University logo, Haigazian University Beirut, Haigazian Uni Lebanon'
  },
  {
    id: 'upa',
    full_name: 'Antonine University',
    abbreviation: 'UPA',
    alt_text: 'Antonine University (UPA), UPA logo, Antonine University logo, Universite Antonine, Antonine Uni Lebanon'
  },
  {
    id: 'iul',
    full_name: 'Islamic University of Lebanon',
    abbreviation: 'IUL',
    alt_text: 'Islamic University of Lebanon (IUL), IUL logo, Islamic University of Lebanon logo, IUL Lebanon, Islamic Univ Lebanon, Universite Islamique du Liban'
  },
  {
    id: 'global',
    full_name: 'Global University',
    abbreviation: 'GU',
    alt_text: 'Global University (GU), GU logo, Global University logo, Global Univ Lebanon, Global Uni Beirut'
  },
  {
    id: 'jinan',
    full_name: 'Jinan University',
    abbreviation: 'JU',
    alt_text: 'Jinan University (JU), JU logo, Jinan University logo, Jinan Univ Lebanon, Universite Jinan, Jinan Uni Beirut'
  },
  {
    id: 'aul',
    full_name: 'Arts, Sciences and Technology University in Lebanon',
    abbreviation: 'AUL',
    alt_text: 'Arts, Sciences and Technology University in Lebanon (AUL), AUL logo, Arts, Sciences and Technology University in Lebanon logo, AUL Lebanon, AUL University, Arts and Sciences University'
  },
  {
    id: 'usal',
    full_name: 'USAL',
    abbreviation: 'USAL',
    alt_text: 'USAL - University Of Sciences And Arts In Lebanon, USAL logo, USAL Lebanon, University Of Sciences And Arts In Lebanon logo, USAL Univ Lebanon'
  },
  {
    id: 'liu',
    full_name: 'Lebanese International University',
    abbreviation: 'LIU',
    alt_text: 'Lebanese International University (LIU), LIU logo, Lebanese International University logo, LIU Lebanon, Lebanese Intl Univ, LIU Beirut'
  },
  {
    id: 'mut',
    full_name: 'Manar University of Tripoli',
    abbreviation: 'MUT',
    alt_text: 'Manar University of Tripoli (MUT), MUT logo, Manar University of Tripoli logo, MUT Lebanon, Manar Univ Lebanon'
  },
  {
    id: 'meu',
    full_name: 'Middle East University',
    abbreviation: 'MEU',
    alt_text: 'Middle East University (MEU), MEU logo, Middle East University logo, MEU Lebanon, Middle East Univ Beirut'
  },
  {
    id: 'sagesse',
    full_name: 'Sagesse University',
    abbreviation: 'ULS',
    alt_text: 'Sagesse University (ULS), ULS logo, Sagesse University logo, Universite La Sagesse, Sagesse Univ Lebanon, ULS Lebanon'
  },
  {
    id: 'aust',
    full_name: 'American University of Science and Technology',
    abbreviation: 'AUST',
    alt_text: 'American University of Science and Technology (AUST), AUST logo, American University of Science and Technology logo, AUST Lebanon, American Univ Science Technology, AUST Beirut'
  },
  {
    id: 'rhu',
    full_name: 'Rafik Hariri University',
    abbreviation: 'RHU',
    alt_text: 'Rafik Hariri University (RHU), RHU logo, Rafik Hariri University logo, RHU Lebanon, Rafic Hariri Univ, Rafik Hariri Uni Beirut'
  },
  {
    id: 'aut',
    full_name: 'American University of Technology',
    abbreviation: 'AUT',
    alt_text: 'American University of Technology (AUT), AUT logo, American University of Technology logo, AUT Lebanon, American Univ Tech, AUT Beirut'
  },
  {
    id: 'mubs',
    full_name: 'Modern University for Business and Science',
    abbreviation: 'MUBS',
    alt_text: 'Modern University for Business and Science (MUBS), MUBS logo, Modern University for Business and Science logo, MUBS Lebanon, Modern Univ Business Science, MUBS Beirut'
  },
  {
    id: 'aku',
    full_name: 'Al-Kafaàt University',
    abbreviation: 'AKU',
    alt_text: 'Al-Kafaat University (AKU), AKU logo, Al-Kafaat University logo, Al Kafaat University, AKU Lebanon, Al Kafaat Uni'
  },
  {
    id: 'self',
    full_name: 'Self taught',
    abbreviation: 'SELF',
    alt_text: 'Self-taught, Self-taught logo, Self-learning icon, Self-educated, Independent learning, Self taught path'
  },
  {
    id: 'mu',
    full_name: 'Al Maaref University',
    abbreviation: 'MU',
    alt_text: 'Al Maaref University, Almaaref, Al maaref, MU Uni, MU, Maaref'
  },
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
    const newValue = currentValue.toLowerCase() === value.toLowerCase() ? '' : currentValue;
    onChange(newValue, false);
    setOpen(false);
    setSearch('');
  };

  const handleCreate = () => {
    if (search.trim()) {
      onChange(search.trim(), true);
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
            placeholder="Search Or add Company or University by name, abbreviation, or alt text..."
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
                    onChange(uni.full_name, false);
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
