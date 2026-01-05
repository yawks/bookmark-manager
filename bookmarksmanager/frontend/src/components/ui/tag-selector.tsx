import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import React, { startTransition, useCallback, useRef, useState } from 'react';

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
  const [isCreating, setIsCreating] = useState(false);

  const handleSelect = useCallback((tag: Tag) => {
    if (!value.some(t => t.value === tag.value)) {
      startTransition(() => {
        onChange([...value, tag]);
      });
    }
    setInputValue('');
    setOpen(false);
    // Use setTimeout to avoid state update conflicts
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [value, onChange]);

  const handleCreate = useCallback(async () => {
    if (!creatable || !inputValue.trim() || !onCreateOption || isCreating) {
      return;
    }
    
    const trimmedValue = inputValue.trim();
    setIsCreating(true);
    
    // Clear input immediately to prevent conflicts
    setInputValue('');
    
    try {
      const newTag = await onCreateOption(trimmedValue);
      
      if (newTag && !value.some(t => t.value === newTag.value)) {
        // Use startTransition to avoid state update conflicts
        startTransition(() => {
          onChange([...value, newTag]);
        });
        setOpen(false);
        setTimeout(() => {
          inputRef.current?.focus();
          setIsCreating(false);
        }, 0);
      } else {
        setIsCreating(false);
      }
    } catch {
      // Restore input value on error
      setInputValue(trimmedValue);
      setIsCreating(false);
    }
  }, [creatable, inputValue, onCreateOption, value, onChange, isCreating]);

  const handleRemove = (tagToRemove: Tag) => {
    onChange(value.filter(tag => tag.value !== tagToRemove.value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Prevent form submission
      e.preventDefault();

      if (inputValue.trim() && !isCreating) {
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
              {creatable && inputValue.trim() && !isCreating ? (
                <button
                  type="button"
                  className="w-full relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer text-left"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCreate();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCreate();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCreate();
                    }
                  }}
                >
                  Create "{inputValue}"
                </button>
              ) : (
                <span className="p-2 text-center text-sm block text-muted-foreground">
                  {isCreating ? 'Creating...' : emptyIndicator}
                </span>
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