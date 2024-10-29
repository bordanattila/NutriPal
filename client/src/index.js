import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import App from './App';
import { ApolloProvider } from '@apollo/client';
import client from './utils/apolloClient';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>);

