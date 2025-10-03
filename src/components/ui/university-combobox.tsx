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
import { firestore } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

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

export function UniversityCombobox({ value = '', onChange }: UniversityComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [universities, setUniversities] = React.useState<University[]>([]);
  const [search, setSearch] = React.useState('');
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'universities'));
        
        if (querySnapshot.empty) {
          console.warn('No universities found in the database');
          return;
        }
        
        const fetchedUniversities = querySnapshot.docs.map(
          (doc) => {
            const data = doc.data();
            // Handle both field name variations
            return {
              id: doc.id,
              full_name: data.full_name || data.name, // Handle both full_name and name
              abbreviation: data.abbreviation,
              alt_text: data.alt_text || data.alt // Handle both alt_text and alt
            } as University;
          }
        );
        
        setUniversities(fetchedUniversities);
      } catch (error) {
        console.error('Error fetching universities:', error);
      }
    };
    
    fetchUniversities();
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
    
    const searchInText = (text?: string): boolean => {
      if (!text) return false;
      const lowerText = text.toLowerCase();
      return searchTerms.every(term => lowerText.includes(term));
    };

    return universities.filter(uni => {
      if (!uni) return false;
      
      return (
        searchInText(uni.full_name) ||
        searchInText(uni.abbreviation) ||
        searchInText(uni.alt_text) ||
        (uni.alt_text?.split(/\s*,\s*/).some(part => searchInText(part)) ?? false)
      );
    });
  }, [universities, search]);

  const selectedUniversity = React.useMemo(() => {
    return universities.find(
      (uni) => uni?.full_name?.toLowerCase() === value?.toLowerCase() ||
               uni?.abbreviation?.toLowerCase() === value?.toLowerCase()
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
