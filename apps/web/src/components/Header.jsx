/**
 * @file Header.jsx
 * @module Header
 * @description Renders the top navigation bar with the NutriPal logo, settings icon, and user profile menu.
 */

import React from 'react';
import Auth from '@nutripal/shared/src/utils/auth';
import { Disclosure, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { UserCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import NutriPalLogo from '../images/NutripalLogo.png';
import { Link } from 'react-router-dom';

/**
 * Header component for displaying the logo and user menu.
 *
 * @component
 * @returns {JSX.Element} Navigation header with user options and settings icon.
 */
const Header = () => {

  return (
    <Disclosure as="nav" className="bg-gradient-to-r from-green-400 to-teal-500 shadow-lg">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <Link to='/'>
            <img src={NutriPalLogo} alt="NutriPal Logo" className="h-10 w-auto" />
          </Link>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <button className="relative rounded-full bg-teal-500 p-1 text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2">
              <Cog6ToothIcon aria-hidden="true" className="h-6 w-6 text-black" />
            </button>
            <Menu as="div" className="relative ml-3">
              <MenuButton className="relative flex rounded-full bg-teal-500 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2">
                <UserCircleIcon className="h-6 w-6 text-black" />
              </MenuButton>
              <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                <MenuItem>
                  <a href="/profile" className="block px-4 py-2 text-sm text-gray-700">Your Profile</a>
                </MenuItem>
                <MenuItem>
                  <a href="/" className="block px-4 py-2 text-sm text-gray-700">Settings</a>
                </MenuItem>
                <MenuItem>
                  <a href="/" className="block px-4 py-2 text-sm text-gray-700" onClick={Auth.logout}>Log out</a>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>
    </Disclosure>
  );
};

export default Header;