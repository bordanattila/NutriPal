/**
 * @file typeDefs.js
 * @description GraphQL schema definitions for types, queries, and mutations.
 */
const { gql } = require('apollo-server-express');

const typeDefs = gql`
  """
  A registered user with profile and nutrition-related data
  """
    type User {
        _id: ID!
        username: String!
        email: String!
        password: String
        calorieGoal: Int
        profilePic: String
        daily_log: [DailyLog]
        saved_meal: [Meal]
        saved_recipe: [Recipe]
    }

  """
  Represents a meal saved by the user
  """
    type Meal {
        _id: ID!
        name: String!
        calorieCount: Int!
    }

  """
  JWT auth response containing user and signed token
  """
    type Auth {
        token: ID!
        user: User!
    }

  """
  Daily log that contains foods consumed on a given day
  """
    type DailyLog {
        _id: ID!
        user_id: User!
        dateCreated: String!
        foods: [OneFood]
      }
      
        """
  One food entry logged by the user
  """

      type OneFood {
        _id: ID!
        created: String!
        food_id: String!
        food_name: String!
        serving_id: String!
        serving_size: String!
        number_of_servings: Int!
        fraction_of_serving: String
        calories: Int
        carbohydrate: Int
        protein: Int
        fat: Int
        saturated_fat: Int
        sodium: Int
        fiber: Int
        meal_type: String!
        brand: String
      }

  """
  Nutritional breakdown used in recipes
  """
    type Nutrition {
    caloriesPerServing: Float!,
    carbohydratePerServing: Float!,
    proteinPerServing: Float!,
    fatPerServing: Float!
    }

  """
  Saved recipe composed of multiple OneFood entries
  """
    type Recipe {
        _id: ID!
        recipeName: String!
        user_id: User!
        ingredients: [OneFood]!
        nutrition: Nutrition!
    }

  """
  Input type for nutrition details (used in recipe creation)
  """
    input NutritionInput {
    caloriesPerServing: Float!,
    carbohydratePerServing: Float!,
    proteinPerServing: Float!,
    fatPerServing: Float!,
    saturatedFatPerServing: Float!
    sodiumPerServing: Float!,
    fiberPerServing: Float!
    }

    type Query {
        """
        Query for a single user
        """
        user: User

        """
        Query for a DailyLog
        """
        getDailyLog(
            user_id: ID!, 
            date: String!
            calorieGoal: Int
        ): DailyLog

        """
        Query for a OneFood
        """
        getOneFood(
            user_id: ID!
            food_id: ID!
            created: String!
        ): OneFood
    
        """
        Query for a Recipe
        """
        getRecipe(
            user_id: ID!
            recipeName: String!
            ingredients: [ID]!
            nutrition: NutritionInput
        ): Recipe
    }

    type Mutation {
        """
        Mutation to create a new user
        """
        signup(
            username: String!
            email: String!
            password: String!
        ): Auth
        """
        Mutation to log in a User
        """
        login(
            username: String!
            password: String!
        ): Auth

        """
        Mutation to create a new DailyLog
        """
        createDailyLog(
            user_id: ID!, 
            foods: [ID!]!
        ): DailyLog
        """
        Mutation to update User data
        """
        updateUserProfile(
            userId: ID!,
            calorieGoal: Int
            password: String,
            profilePic: String,
        ): User

         """
        Mutation to create a new Recipe
        """
        createRecipe(
            recipeName: String!,
            user_id: ID!,
            ingredients: [String!]!,
            servingSize: String,
            nutrition: NutritionInput!
        ): Recipe

        """
        Mutation to delete a OneFood
        """
        deleteOneFood(
            _id: ID!,
            food_id: ID!,
            ): User
    }
`;

module.exports = typeDefs;