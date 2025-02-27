import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const crimeCategories = [
  "THEFT",
  "BATTERY",
  "CRIMINAL DAMAGE",
  "ASSAULT",
  "NARCOTICS",
  "BURGLARY",
  "ROBBERY",
  "DECEPTIVE PRACTICE",
  "MOTOR VEHICLE THEFT",
  "WEAPONS VIOLATION",
  "CRIMINAL TRESPASS",
  "OTHER OFFENSE"
] as const

export type CrimeCategory = typeof crimeCategories[number]

export function CrimeFilter({ 
  selected, 
  onSelect 
}: { 
  selected: CrimeCategory | null
  onSelect: (category: CrimeCategory | null) => void 
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-start">
          {selected ?? "Filter by crime type"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search crime type..." />
          <CommandEmpty>No crime type found.</CommandEmpty>
          <CommandGroup>
            {crimeCategories.map((category) => (
              <CommandItem
                key={category}
                onSelect={() => onSelect(category)}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    selected === category ? "opacity-100" : "opacity-0"
                  }`}
                />
                {category}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}