import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter } from 'react-router-dom';
import client from './utils/apolloClient';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(
    <ApolloProvider client={client}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </ApolloProvider>);

