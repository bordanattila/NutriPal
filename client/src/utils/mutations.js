/**
 * @file mutations.js
 * @description GraphQL queries and mutations used in Apollo Client.
 */
import { gql } from "@apollo/client";

/**
 * @constant GET_USER
 * @description GraphQL query to fetch the currently authenticated user's basic info.
 */
export const GET_USER = gql`
  query getUser {
    user {
      _id
      username
      calorieGoal
      macros {
        protein
        fat
        carbs
      }
    }
  }
  `;

/**
 * @constant GET_ONE_FOOD
 * @description (Unused) Example query placeholder for fetching a single food item.
 * @note This query does not currently include dynamic variables.
 */
export const GET_ONE_FOOD = gql`
  query getOneFood {
    getOneFood {
      _id
      user_ID
      food_name
      food_id
      calories
      carbohydrate
      protein
      fat
    }
  }
`;

/**
 * @constant UPDATE_USER_PROFILE
 * @description GraphQL mutation for updating a user's profile, including optional password, calorie goal, and profile picture.
 */
export const UPDATE_USER_PROFILE = gql`
mutation updateUserProfile(
  $userId: ID!
  $calorieGoal: Int
  $password: String
  $profilePic: String
  $macros: MacrosInput
) {
  updateUserProfile(
    userId: $userId
    calorieGoal: $calorieGoal
    password: $password
    profilePic: $profilePic
    macros: $macros
  ) {
    _id
    username
    email
    calorieGoal
    macros {
      protein
      fat
      carbs
    }
    profilePic
  }
}
`;