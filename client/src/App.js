import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
    path: '/foodById/:foodId',
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
];

const App = () => {

  return (
    <Router>
      <div>
        {/* Check if the current route is the home page */}
        {window.location.pathname !== '/' && <Header />}
      </div>
      <Routes>
        {routes.map((route) => (
          <Route key={route.path} {...route} />
        ))}
      </Routes>
      <div>
        {/* Check if the current route is the home page */}
        {window.location.pathname !== '/' && <Navbar />}
      </div>
      <div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;