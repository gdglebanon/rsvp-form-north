"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Check, X, ChevronsUpDown, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

const multiSelectVariants = cva(
  "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
  {
    variants: {
      variant: {
        default:
          "border-foreground/10 text-foreground bg-card hover:bg-card/80",
        secondary:
          "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        inverted: "inverted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  onValueChange: (value: string[]) => void;
  defaultValue: string[];
  placeholder?: string;
  animation?: number;
  maxCount?: number;
  asChild?: boolean;
  className?: string;
}

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      placeholder = "Select options",
      animation,
      maxCount,
      asChild = false,
      className,
      ...props
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] =
      React.useState<string[]>(defaultValue);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [commandInput, setCommandInput] = React.useState('');
    const [dynamicOptions, setDynamicOptions] = React.useState(options);

    React.useEffect(() => {
      if (JSON.stringify(selectedValues) !== JSON.stringify(defaultValue)) {
        setSelectedValues(defaultValue);
      }
    }, [defaultValue, selectedValues]);

    const handleInputKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>
      ) => {
        if (event.key === "Enter") {
          setIsPopoverOpen(true);
        } else if (event.key === "Backspace" && !event.currentTarget.value) {
          const newSelectedValues = [...selectedValues];
          newSelectedValues.pop();
          setSelectedValues(newSelectedValues);
          onValueChange(newSelectedValues);
        }
      };
  
      const toggleOption = (value: string) => {
        const newSelectedValues = selectedValues.includes(value)
          ? selectedValues.filter((v) => v !== value)
          : [...selectedValues, value];
        setSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
        setCommandInput('');
      };

    const handleCreateOption = (value: string) => {
        const newOption = { label: value, value: value.toLowerCase().replace(/\s/g, '_') };
        if (!dynamicOptions.some(option => option.value === newOption.value)) {
            setDynamicOptions([...dynamicOptions, newOption]);
        }
        toggleOption(newOption.value);
    };


    const handleClear = () => {
        setSelectedValues([]);
        onValueChange([]);
    }

    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            className="flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-card"
          >
            {selectedValues.length > 0 ? (
              <div className="flex justify-between items-center w-full">
                <div className="flex flex-wrap items-center">
                  {selectedValues.slice(0, maxCount).map((value) => {
                    const option = dynamicOptions.find((o) => o.value === value);
                    const Icon = option?.icon;
                    return (
                      <Badge
                        key={value}
                        className={cn(multiSelectVariants({ variant, className }))}
                        style={{ animationDuration: `${animation}s` }}
                      >
                        {Icon && <Icon className="h-4 w-4 mr-2" />}
                        {option?.label}
                        <X
                          className="h-4 w-4 ml-2 cursor-pointer"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleOption(value);
                          }}
                        />
                      </Badge>
                    );
                  })}
                  {selectedValues.length > maxCount && (
                    <Badge
                      className={cn(
                        "bg-transparent text-foreground border-foreground/10",
                        multiSelectVariants({ variant, className })
                      )}
                      style={{ animationDuration: `${animation}s` }}
                    >
                      {`+ ${selectedValues.length - maxCount} more`}
                      <X
                        className="h-4 w-4 ml-2 cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleClear();
                        }}
                      />
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                    <X
                        className="h-4 w-4 cursor-pointer"
                        onClick={(event) => {
                            event.stopPropagation();
                            handleClear();
                        }}
                    />
                  <ChevronsUpDown className="h-4 w-4 ml-2 cursor-pointer" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full mx-auto">
                <span className="text-sm text-muted-foreground mx-3">
                  {placeholder}
                </span>
                <ChevronsUpDown className="h-4 w-4 mx-2 cursor-pointer" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              placeholder="Search..."
              onKeyDown={handleInputKeyDown}
              value={commandInput}
              onValueChange={setCommandInput}
            />
            <CommandEmpty>
                <div onClick={() => handleCreateOption(commandInput)} className="flex items-center justify-center p-2 cursor-pointer">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    <span>Create "{commandInput}"</span>
                </div>
            </CommandEmpty>
            <CommandGroup>
              {dynamicOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => toggleOption(option.value)}
                  style={{ pointerEvents: "auto", opacity: 1 }}
                  className="cursor-pointer"
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selectedValues.includes(option.value)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </div>
                  {option.icon && <option.icon className="h-4 w-4 mr-2" />}                  <span>{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

MultiSelect.displayName = "MultiSelect";

export { MultiSelect };