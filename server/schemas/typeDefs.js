const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type User {
        _id: ID!
        username: String!
        email: String!
        password: String!
        calorie_goal: Int
        saved_meal: [Meal]
        saved_recipe: [Recipe]
    }

    type Meal {
        _id: ID!
        name: String!
        calorieCount: Int!
    }

    type Recipe {
        _id: ID!
        name: String!
        calorieCount: Int!
    }

    type Auth {
        token: ID!
        user: User!
    }

    type Query {
        user: User
    }

    type Mutation {
        signup(
            username: String!
            email: String!
            password: String!
        ): Auth
        
        login(
            username: String!
            password: String!
        ): Auth
    }
`;

module.exports = typeDefs;