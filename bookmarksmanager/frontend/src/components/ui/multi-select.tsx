'use client';

import * as React from 'react';

import { ChevronDownIcon, X } from 'lucide-react';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Command as CommandPrimitive, useCommandState } from 'cmdk';
import { forwardRef, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface Option {
  value: string;
  label: string;
  disable?: boolean;
  /** fixed option that can't be removed. */
  fixed?: boolean;
  /** Group the options by providing key. */
  [key: string]: string | boolean | undefined;
}
interface GroupOption {
  [key: string]: Option[];
}

interface MultipleSelectorProps {
  value?: Option[];
  defaultOptions?: Option[];
  /** manually controlled options */
  options?: Option[];
  placeholder?: string;
  /** Loading component. */
  loadingIndicator?: React.ReactNode;
  /** Empty component. */
  emptyIndicator?: React.ReactNode;
  /** Debounce time for async search. Only work with `onSearch`. */
  delay?: number;
  /**
      onCreateOption,
      ...rest
   * For example, when user click on the input, it will trigger the search to get initial options.
   **/
  triggerSearchOnFocus?: boolean;
  /** async search */
  onSearch?: (value: string) => Promise<Option[]>;
  /**
   * sync search. This search will not showing loadingIndicator.
   * The rest props are the same as async search.
   * i.e.: creatable, groupBy, delay.
   **/
  onSearchSync?: (value: string) => Option[];
  onChange?: (options: Option[]) => void;
  /** Called when a new option is created (creatable mode). Should return a Promise<Option> for async creation. */
  onCreateOption?: (label: string) => Promise<Option>;
  /** Limit the maximum number of selected options. */
  maxSelected?: number;
  /** When the number of selected options exceeds the limit, the onMaxSelected will be called. */
  onMaxSelected?: (maxLimit: number) => void;
  /** Hide the placeholder when there are options selected. */
  hidePlaceholderWhenSelected?: boolean;
  disabled?: boolean;
  /** Group the options base on provided key. */
  groupBy?: string;
  className?: string;
  badgeClassName?: string;
  /**
   * First item selected is a default behavior by cmdk. That is why the default is true.
   * This is a workaround solution by add a dummy item.
   *
   * @reference: https://github.com/pacocoursey/cmdk/issues/171
   */
  selectFirstItem?: boolean;
  /** Allow user to create option when there is no option matched. */
  creatable?: boolean;
  /** Props of `Command` */
  commandProps?: React.ComponentPropsWithoutRef<typeof Command>;
  /** Props of `CommandInput` */
  inputProps?: Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
    'value' | 'placeholder' | 'disabled'
  >;
  /** hide the clear all button. */
  hideClearAllButton?: boolean;
}

export interface MultipleSelectorRef {
  selectedValue: Option[];
  input: HTMLInputElement;
  focus: () => void;
  reset: () => void;
}

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

function transToGroupOption(options: Option[], groupBy?: string): GroupOption {
  if (!options || options.length === 0) {
    return { Options: [] };
  }
  if (groupBy) {
    return options.reduce((acc: GroupOption, option: Option) => {
      const group = option[groupBy] as string || 'Options';
      if (!acc[group]) acc[group] = [];
      acc[group].push(option);
      return acc;
    }, {});
  }
  return { Options: options };
}
// Remove picked options from the available options
function removePickedOption(groupOption: GroupOption, selected: Option[]): GroupOption {
  const result: GroupOption = {};
  for (const [group, options] of Object.entries(groupOption)) {
    result[group] = options.filter(
      (option) => !selected.some((s) => s.value === option.value)
    );
  }
  return result;
}

function isOptionsExist(groupOption: GroupOption, targetOption: Option[]) {
  for (const [, value] of Object.entries(groupOption)) {
    if (value.some((option) => targetOption.find((p) => p.value === option.value))) {
      return true;
    }
  }
  return false;
}

const CommandEmpty = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof CommandPrimitive.Empty>
>(({ className, ...props }, forwardedRef) => {
  const render = useCommandState((state) => state.filtered.count === 0);

  if (!render) return null;

  return (
    <div
      ref={forwardedRef}
      className={cn('py-6 text-center text-sm', className)}
      cmdk-empty=""
      role="presentation"
      {...props}
    />
  );
});

CommandEmpty.displayName = 'CommandEmpty';

const MultipleSelector = React.forwardRef<MultipleSelectorRef, MultipleSelectorProps>(
  (props, ref) => {
    const {
      value,
      onChange,
      placeholder,
      defaultOptions: arrayDefaultOptions = [],
      options: arrayOptions,
      delay,
      onSearch,
      onSearchSync,
      loadingIndicator,
      emptyIndicator,
      maxSelected = Number.MAX_SAFE_INTEGER,
      onMaxSelected,
      hidePlaceholderWhenSelected,
      disabled,
      groupBy,
      className,
      badgeClassName,
      selectFirstItem = true,
      creatable = false,
      triggerSearchOnFocus = false,
      commandProps,
      inputProps,
      hideClearAllButton = false,
      onCreateOption,
      ...rest
    } = props;

    const inputRef = React.useRef<HTMLInputElement>(null);
    const mountedRef = React.useRef(false);
    const [open, setOpen] = React.useState(false);
    const [onScrollbar, setOnScrollbar] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      mountedRef.current = true;
      return () => {
        mountedRef.current = false;
      };
    }, []);

    const [selected, setSelected] = React.useState<Option[]>(value || []);
    const [groupedOptions, setGroupedOptions] = React.useState<GroupOption>(
      transToGroupOption(arrayDefaultOptions, groupBy),
    );
    const [inputValue, setInputValue] = React.useState('');
    const debouncedSearchTerm = useDebounce(inputValue, delay || 500);

    // Helper to update options
    const setOptions = (opts: GroupOption) => {
      setGroupedOptions(opts);
    };

    React.useImperativeHandle(ref, () => ({
      selectedValue: [...selected],
      input: inputRef.current as HTMLInputElement,
      focus: () => inputRef?.current?.focus(),
      reset: () => setSelected([]),
    }), [selected]);

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!mountedRef.current) {
        return;
      }
      const dropdown = dropdownRef.current;
      const input = inputRef.current;
      if (dropdown && !dropdown.contains(event.target as Node) && input && !input.contains(event.target as Node)) {
        setOpen(false);
        input.blur();
      }
    };

    const handleUnselect = React.useCallback(
      (option: Option) => {
        const newOptions = selected.filter((s) => s.value !== option.value);
        setSelected(newOptions);
        onChange?.(newOptions);
      },
      [onChange, selected],
    );

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current;
        if (input) {
          if (e.key === 'Delete' || e.key === 'Backspace') {
            if (input.value === '' && selected.length > 0) {
              const lastSelectOption = selected[selected.length - 1];
              if (lastSelectOption && !lastSelectOption.fixed) {
                handleUnselect(lastSelectOption);
              }
            }
          }
          if (e.key === 'Escape') {
            input.blur();
          }
        }
      },
      [handleUnselect, selected],
    );

    useEffect(() => {
      if (open) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchend', handleClickOutside);
      } else {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchend', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchend', handleClickOutside);
      };
    }, [open]);

    useEffect(() => {
      if (value) {
        setSelected(value);
      }
    }, [value]);

    useEffect(() => {
      if (!arrayOptions || onSearch) {
        return;
      }
      const newOption = transToGroupOption(arrayOptions || [], groupBy);
      if (JSON.stringify(newOption) !== JSON.stringify(groupedOptions)) {
        setGroupedOptions(newOption);
      }
    }, [arrayDefaultOptions, arrayOptions, groupBy, onSearch, groupedOptions]);

    useEffect(() => {
      const doSearchSync = () => {
        const res = onSearchSync?.(debouncedSearchTerm);
        setOptions(transToGroupOption(res || [], groupBy));
      };

      const exec = async () => {
        if (!onSearchSync || !open) return;

        if (triggerSearchOnFocus) {
          doSearchSync();
        }

        if (debouncedSearchTerm) {
          doSearchSync();
        }
      };

      void exec();
    }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus, onSearchSync]);

    useEffect(() => {
      const doSearch = async () => {
        setIsLoading(true);
        const res = await onSearch?.(debouncedSearchTerm);
        setOptions(transToGroupOption(res || [], groupBy));
        setIsLoading(false);
      };

      const exec = async () => {
        if (!onSearch || !open) return;

        if (triggerSearchOnFocus) {
          await doSearch();
        }

        if (debouncedSearchTerm) {
          await doSearch();
        }
      };

      void exec();
    }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus, onSearch]);

    const CreatableItem = () => {
      if (!creatable) return undefined;
      if (
        isOptionsExist(groupedOptions, [{ value: inputValue, label: inputValue }]) ||
        selected.find((s) => s.value === inputValue)
      ) {
        return undefined;
      }

      const handleCreate = async (label: string) => {
        if (selected.length >= maxSelected) {
          onMaxSelected?.(selected.length);
          return;
        }
        setInputValue('');
        if (typeof onCreateOption === 'function') {
          const created = await onCreateOption(label);
          if (created) {
            const newOptions = [...selected, created];
            setSelected(newOptions);
            onChange?.(newOptions);
          }
        } else {
          const newOptions = [...selected, { value: label, label }];
          setSelected(newOptions);
          onChange?.(newOptions);
        }
      };

      const Item = (
        <CommandItem
          value={inputValue}
          className="cursor-pointer"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onSelect={() => handleCreate(inputValue)}
        >
          {`Create "${inputValue}"`}
        </CommandItem>
      );

      if (!onSearch && inputValue.length > 0) {
        return Item;
      }

      if (onSearch && debouncedSearchTerm.length > 0 && !isLoading) {
        return Item;
      }

      return undefined;
    };

    const EmptyItem = React.useCallback(() => {
      if (!emptyIndicator) return undefined;

  if (onSearch && !creatable && Object.keys(arrayOptions || {}).length === 0) {
        return (
          <CommandItem value="-" disabled>
            {emptyIndicator}
          </CommandItem>
        );
      }

      return <CommandEmpty>{emptyIndicator}</CommandEmpty>;
  }, [creatable, emptyIndicator, onSearch, arrayOptions]);

    const selectables = React.useMemo<GroupOption>(
      () => removePickedOption(groupedOptions, selected),
      [groupedOptions, selected],
    );

    const commandFilter = React.useCallback(() => {
      if (commandProps?.filter) {
        return commandProps.filter;
      }

      if (creatable) {
        return (value: string, search: string) => {
          return value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1;
        };
      }
      return undefined;
    }, [creatable, commandProps?.filter]);

    return (
      <Command
        ref={dropdownRef}
        {...commandProps}
        onKeyDown={(e) => {
          handleKeyDown(e);
          commandProps?.onKeyDown?.(e);
        }}
        className={cn('h-auto overflow-visible bg-transparent', commandProps?.className)}
        shouldFilter={
          commandProps?.shouldFilter !== undefined ? commandProps.shouldFilter : !onSearch
        }
        filter={commandFilter()}
      >
        <div
          className={cn(
            'flex items-start justify-between rounded-md border border-input px-3 py-2 text-base ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 md:text-sm',
            {
              'cursor-text': !disabled && selected.length !== 0,
            },
            className,
          )}
          onClick={() => {
            if (disabled) return;
            inputRef?.current?.focus();
          }}
        >
          <div className="relative flex flex-wrap gap-1">
            {selected.map((option) => {
                return (
                  <Badge
                    key={option.value}
                    className={cn(
                      'tag-badge',
                      '!rounded !rounded-md px-2 py-0.5',
                      badgeClassName,
                    )}
                    data-fixed={option.fixed}
                    data-disabled={disabled || undefined}
                  >
                    {option.label}
                    <button
                      type="button"
                      className={cn(
                        'ml-0.5 rounded outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 p-0.5 h-4 w-4 flex items-center justify-center',
                        (disabled || option.fixed) && 'hidden',
                      )}
                      style={{ minWidth: 16, minHeight: 16 }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUnselect(option);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={() => handleUnselect(option)}
                    >
                      <X className="h-2.5 w-2.5 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                );
            })}
            <CommandPrimitive.Input
              {...inputProps}
              ref={inputRef}
              value={inputValue}
              disabled={disabled}
              onValueChange={(value) => {
                setInputValue(value);
                inputProps?.onValueChange?.(value);
              }}
              onBlur={(event) => {
                if (!onScrollbar) {
                  setOpen(false);
                }
                inputProps?.onBlur?.(event);
              }}
              onFocus={(event) => {
                setOpen(true);
                inputProps?.onFocus?.(event);
              }}
              placeholder={hidePlaceholderWhenSelected && selected.length !== 0 ? '' : placeholder}
              className={cn(
                'flex-1 self-baseline bg-transparent outline-none placeholder:text-muted-foreground',
                {
                  'w-full': hidePlaceholderWhenSelected,
                  'ml-1': selected.length !== 0,
                },
                inputProps?.className,
              )}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setSelected(selected.filter((s) => s.fixed));
              onChange?.(selected.filter((s) => s.fixed));
            }}
            className={cn(
              'size-5',
              (hideClearAllButton ||
                disabled ||
                selected.length < 1 ||
                selected.filter((s) => s.fixed).length === selected.length) &&
                'hidden',
            )}
          >
            <X />
          </button>
          <ChevronDownIcon
            className={cn(
              'size-5 text-muted-foreground/50',
              (hideClearAllButton ||
                disabled ||
                selected.length >= 1 ||
                selected.filter((s) => s.fixed).length !== selected.length) &&
                'hidden',
            )}
          />
        </div>
        <div className="relative">
          {open && (
            <CommandList
              className="absolute top-1 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in"
              onMouseLeave={() => {
                setOnScrollbar(false);
              }}
              onMouseEnter={() => {
                setOnScrollbar(true);
              }}
              onMouseUp={() => {
                inputRef?.current?.focus();
              }}
            >
              {isLoading ? (
                <>{loadingIndicator}</>
              ) : (
                <>
                  {EmptyItem()}
                  {CreatableItem()}
                  {!selectFirstItem && <CommandItem value="-" className="hidden" />}
                  {Object.entries(selectables).map(([key, dropdowns]) => (
                    <CommandGroup key={key} heading={key} className="h-full overflow-auto">
                      <>
                        {dropdowns.map((option) => {
                          return (
                            <CommandItem
                              key={option.value}
                              value={option.label}
                              disabled={option.disable}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onSelect={() => {
                                if (selected.length >= maxSelected) {
                                  onMaxSelected?.(selected.length);
                                  return;
                                }
                                setInputValue('');
                                const newOptions = [...selected, option];
                                setSelected(newOptions);
                                onChange?.(newOptions);
                              }}
                              className={cn(
                                'cursor-pointer',
                                option.disable && 'cursor-default text-muted-foreground',
                              )}
                            >
                              {option.label}
                            </CommandItem>
                          );
                        })}
                      </>
                    </CommandGroup>
                  ))}
                </>
              )}
            </CommandList>
          )}
        </div>
      </Command>
    );
  },
);

MultipleSelector.displayName = 'MultipleSelector';
export default MultipleSelector;