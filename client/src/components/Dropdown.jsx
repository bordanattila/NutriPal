import React from 'react';
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'

const DropdownMenu = ({ label, value, onChange, options, optionLabel, optionKey }) => {
    return (
        <div className="relative  mt-2">
            <Listbox value={value} onChange={onChange}>
                <Label className="block text-sm font-medium leading-6 text-gray-900">{label}</Label>
                <div>
                    <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
                        <span className="flex items-center">
                            <span className="ml-3 block truncate">{optionLabel(value)}</span>
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                        </span>
                    </ListboxButton>

                    <ListboxOptions className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {options.map((option) => (
                            <ListboxOption
                                key={optionKey(option)}
                                value={option}
                                className={({ active, selected }) =>
                                    `group relative cursor-default select-none py-2 pl-3 pr-9 ${active ? 'bg-indigo-600 text-white' : 'text-gray-900'} ${selected ? 'font-semibold' : 'font-normal'}`
                                }
                            >
                                <div className="flex items-center">
                                    <span className="ml-3 block truncate">{optionLabel(option)}</span>
                                </div>

                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </div>
            </Listbox>
        </div>
    );
};

export default DropdownMenu;

