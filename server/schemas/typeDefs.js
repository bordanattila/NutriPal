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

    type DailyLog {
        _id: ID!
        user_id: User!
        dateCreated: String!
        foods: [OneFood]
      }
      
      type OneFood {
        _id: ID!
        created: String!
        food_id: String!
        food_name: String!
        serving_id: String!
        serving_size: String!
        number_of_servings: Int!
        calories: Int!
        carbohydrate: Int!
        protein: Int!
        fat: Int!
        saturated_fat: Int!
        sodium: Int!
        fiber: Int!
        meal_type: String!
      }

    type Query {
        user: User
        getDailyLog(
            user_id: ID!, 
            date: String!
        ): DailyLog
        getOneFood(
            user_id: ID!,
            food_id: ID!,
            created: String!,
        ): OneFood
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

        createDailyLog(
            user_id: ID!, 
            foods: [ID!]!
        ): DailyLog
    }
`;

module.exports = typeDefs;