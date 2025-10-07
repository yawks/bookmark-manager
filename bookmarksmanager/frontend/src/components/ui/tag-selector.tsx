import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import React, { useCallback, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { XIcon } from 'lucide-react';

export interface Tag {
  value: string;
  label: string;
}

interface TagSelectorProps {
  value: Tag[];
  onChange: (value: Tag[]) => void;
  options: Tag[];
  placeholder?: string;
  emptyIndicator?: string;
  creatable?: boolean;
  onCreateOption?: (label: string) => Promise<Tag>;
}

export function TagSelector({
  value,
  onChange,
  options,
  placeholder = 'Select tags...',
  emptyIndicator = 'No tags found.',
  creatable = false,
  onCreateOption,
}: TagSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSelect = useCallback((tag: Tag) => {
    if (!value.some(t => t.value === tag.value)) {
      onChange([...value, tag]);
    }
    setInputValue('');
    inputRef.current?.focus();
  }, [value, onChange]);

  const handleCreate = async () => {
    if (!creatable || !inputValue.trim() || !onCreateOption) return;
    const newTag = await onCreateOption(inputValue.trim());
    if (newTag) {
      handleSelect(newTag);
    }
  };

  const handleRemove = (tagToRemove: Tag) => {
    onChange(value.filter(tag => tag.value !== tagToRemove.value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        // Find the first highlighted item and select it
        const highlighted = document.querySelector('[aria-selected="true"]');
        const firstOption = options.find(opt => opt.label === highlighted?.textContent);
        if (firstOption) {
          handleSelect(firstOption);
        }
      } else {
        handleCreate();
      }
    } else if (e.key === 'Backspace' && inputValue === '') {
      e.preventDefault();
      handleRemove(value[value.length - 1]);
    }
  };

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.some(v => v.value === option.value)
  );

  return (
    <Command onKeyDown={handleKeyDown} className="overflow-visible bg-transparent">
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {value.map((tag) => (
            <Badge key={tag.value} variant="secondary" className="pl-2 pr-1">
              {tag.label}
              <button
                type="button"
                className="ml-1 rounded-full p-0.5 hover:bg-destructive/50"
                onClick={() => handleRemove(tag)}
              >
                <XIcon className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <CommandInput
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="ml-2 flex-1 bg-transparent p-0 outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && (filteredOptions.length > 0 || (creatable && inputValue)) ? (
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandList>
              <CommandEmpty>
                {creatable && inputValue.trim() ? (
                  <CommandItem
                    onSelect={handleCreate}
                    className="cursor-pointer"
                  >
                    Create "{inputValue}"
                  </CommandItem>
                ) : (
                  <span className="p-2 text-center text-sm">{emptyIndicator}</span>
                )}
              </CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option)}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </div>
        ) : null}
      </div>
    </Command>
  );
}