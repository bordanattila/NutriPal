import React from 'react';
import { useNavigate } from "react-router-dom";
import Auth from '../utils/auth';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../utils/mutations';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, UserCircleIcon, XMarkIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import NutriPalLogo from '../images/NutripalLogo.png';

// const navigation = [
//     { name: 'Profile', href: '#', current: true },
//     { name: 'Account', href: '#', current: false },
//   ]
  
//   function classNames(...classes) {
//     return classes.filter(Boolean).join(' ')
//   }

const Header = () => {
  const navigate = useNavigate();

  const { loading, data, error } = useQuery(GET_USER, {
    context: {
      headers: {
        Authorization: `Bearer ${Auth.getToken()}`,
      },
    },
    onError: () => {
      navigate('/login');
    }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const { username } = data?.user || {};
  return (
    <Disclosure as="nav" className="bg-gradient-to-r from-green-400 to-teal-500 shadow-lg">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">

          <img src={NutriPalLogo} alt="NutriPal Logo" className="h-10 w-auto" />
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
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700">Your Profile</a>
                </MenuItem>
                <MenuItem>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700">Settings</a>
                </MenuItem>
                <MenuItem>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700">Sign out</a>
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
