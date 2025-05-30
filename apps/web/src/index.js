/**
 * @file index.js
 * @description Entry point of the React application.
 * Wraps the App component with ApolloProvider and BrowserRouter.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter } from 'react-router-dom';
import client from './utils/apolloClient';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

/**
 * @desc Render the React app wrapped in ApolloProvider for GraphQL support
 * and BrowserRouter for client-side routing.
 */
root.render(
    <ApolloProvider client={client}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </ApolloProvider>);

