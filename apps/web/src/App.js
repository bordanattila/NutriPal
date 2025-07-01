/**
 * @file App.js
 * @description Main application component. Handles routing and shared UI layout (Header, Navbar, Footer).
 */

import React from 'react';
import { Route, Routes, useLocation, useMatch } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import FoodDetails from './components/FoodDetails';
import Footer from './components/Footer';
import Navbar from './components/Navigation';
import Search from './pages/Search'
import NotFound from './components/NotFound';
import Header from './components/Header';
import DailyLogs from './pages/DailyLogs';
import Profile from './pages/Profile';
import Recipe from './pages/Recipe';
import LogOptions from './components/LogOptions';
import Meals from './pages/Meals';
import SavedRecipes from './components/SavedRecipes';
import LogRecipe from './components/LogRecipe';
import AiAssist from './pages/AiAssist';

/**
 * @constant routes
 * @description Array of route configurations for react-router-dom.
 */
const routes = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/search',
    element: <Search />,
  },
  {
    path: '/dailyLogs',
    element: <DailyLogs />,
  },
  {
    path: '/:source/foodById/:foodId',
    element: <FoodDetails />,
  },
  {
    path: '/profile',
    element: <Profile />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
  {
    path: '/recipe',
    element: <Recipe />,
  },
  {
    path: '/saved-recipes',
    element: <SavedRecipes />,
  },
  {
    path: '/log-recipe/:recipeName/:recipeID',
    element: <LogRecipe />,
  },
  {
    path: '/meals',
    element: <Meals />,
  },
  {
    path: '/logOptions',
    element: <LogOptions />,
  },
  {
    path: '/ai-assistant',
    element: <AiAssist />,
  }
];

/**
 * @function App
 * @description Main component rendered by ReactDOM. Handles routing and layout.
 * @returns {JSX.Element}
 */
const App = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isFoodDetails = useMatch('/:source/foodById/:foodId');

  return (
    
      <>
        {/* Check if the current route is the home page */}
        {!isHome && !isFoodDetails && <Header />}
      <Routes>
        {routes.map((route) => (
          <Route key={route.path} {...route} />
        ))}
      </Routes>
        {/* Check if the current route is the home page */}
        {!isHome && <Navbar />}
        <Footer />
      </>    
  );
};

export default App;