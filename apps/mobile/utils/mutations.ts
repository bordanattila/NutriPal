import { gql } from '@apollo/client';

export const GET_USER = gql`
  query getUser {
    user {
      _id
      username
      email
      calorieGoal
      waterGoal
      waterGoalOz
      waterUnit
      macros {
        protein
        fat
        carbs
      }
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
  $username: String
  $email: String
  $calorieGoal: Int
  $waterGoal: Int
  $waterGoalOz: Int
  $waterUnit: String
  $password: String
  $profilePic: String
  $macros: MacrosInput
) {
  updateUserProfile(
    userId: $userId
    username: $username
    email: $email
    calorieGoal: $calorieGoal
    waterGoal: $waterGoal
    waterGoalOz: $waterGoalOz
    waterUnit: $waterUnit
    password: $password
    profilePic: $profilePic
    macros: $macros
  ) {
    _id
    username
    email
    calorieGoal
    waterGoal
    waterGoalOz
    waterUnit
    macros {
      protein
      fat
      carbs
    }
    profilePic
  }
}
`;