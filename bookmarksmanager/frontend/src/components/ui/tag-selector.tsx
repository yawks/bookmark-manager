import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import React, { useCallback, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { Badge } from '@/components/ui/badge';
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
    setOpen(false);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Prevent form submission
      e.preventDefault();

      if (inputValue.trim()) {
        // Check if it matches an existing option exactly
        const exactMatch = options.find(opt => opt.label.toLowerCase() === inputValue.trim().toLowerCase());
        if (exactMatch && !value.some(v => v.value === exactMatch.value)) {
          handleSelect(exactMatch);
        } else if (creatable) {
          handleCreate();
        }
      }
    } else if (e.key === 'Backspace' && inputValue === '') {
      e.preventDefault();
      if (value.length > 0) {
        handleRemove(value[value.length - 1]);
      }
    }
  };

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.some(v => v.value === option.value)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          onClick={() => inputRef.current?.focus()}
          className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 cursor-text flex flex-wrap gap-1 min-h-[40px]"
        >
          {value.map((tag) => (
            <Badge key={tag.value} variant="secondary" className="pl-2 pr-1 h-7">
              {tag.label}
              <button
                type="button"
                className="ml-1 rounded-full p-0.5 hover:bg-destructive/50 outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(tag);
                }}
              >
                <XIcon className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ''}
            className="ml-1 flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[120px]"
          />
        </div>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start" onOpenAutoFocus={(e: Event) => e.preventDefault()}>
        <Command>
          <CommandList className="max-h-[200px] overflow-y-auto">
            <CommandEmpty>
              {creatable && inputValue.trim() ? (
                <CommandItem value={inputValue} onSelect={handleCreate} className="cursor-pointer">
                  Create "{inputValue}"
                </CommandItem>
              ) : (
                <span className="p-2 text-center text-sm block text-muted-foreground">{emptyIndicator}</span>
              )}
            </CommandEmpty>

            {(filteredOptions.length > 0) && (
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option)}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}