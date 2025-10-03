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
  full_name: string;
  abbreviation: string;
  alt_text?: string;
}

interface UniversityComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function UniversityCombobox({ value, onChange }: UniversityComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [universities, setUniversities] = React.useState<University[]>([]);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    const fetchUniversities = async () => {
      const querySnapshot = await getDocs(collection(firestore, 'universities'));
      const fetchedUniversities = querySnapshot.docs.map(
        (doc) => doc.data() as University
      );
      setUniversities(fetchedUniversities);
    };
    fetchUniversities();
  }, []);

  const handleSelect = (currentValue: string) => {
    onChange(currentValue.toLowerCase() === value.toLowerCase() ? '' : currentValue);
    setOpen(false);
    setSearch('');
  };

  const handleCreate = () => {
    onChange(search);
    setOpen(false);
    setSearch('');
  };

  const filteredUniversities = universities.filter((uni) => {
    const searchTerm = search.toLowerCase();
    const nameMatch = uni.full_name?.toLowerCase().includes(searchTerm) ?? false;
    const abbreviationMatch = uni.abbreviation?.toLowerCase().includes(searchTerm) ?? false;
    const altTextMatch = uni.alt_text?.toLowerCase().includes(searchTerm) ?? false;
    return nameMatch || abbreviationMatch || altTextMatch;
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? universities.find(
                (uni) => uni.full_name?.toLowerCase() === value.toLowerCase()
              )?.full_name || value
            : 'Select university...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder="Search university..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty onSelect={handleCreate} className='cursor-pointer'>
            <div onClick={handleCreate} className="flex items-center justify-center p-2">
                <PlusCircle className="h-4 w-4 mr-2" />
                <span>Create "{search}"</span>
            </div>
          </CommandEmpty>
          <CommandGroup>
            {filteredUniversities.map((uni) => (
              <CommandItem
                key={uni.abbreviation}
                value={uni.full_name}
                onSelect={handleSelect}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value?.toLowerCase() === uni.full_name?.toLowerCase()
                      ? 'opacity-100'
                      : 'opacity-0'
                  )}
                />
                {uni.full_name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
