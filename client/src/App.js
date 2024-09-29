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

console.log('App component rendered'); 

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
    path: '/foodDetails/:foodId',
    element: <FoodDetails />,
  },
];

const App = () => {

  return (
    <Router>
      <Routes>
        {routes.map((route) => (
          <Route key={route.path} {...route} />
        ))}
      </Routes>
      <div>
        <Navbar />
      </div>
      <div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;