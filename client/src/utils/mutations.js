import { gql } from "@apollo/client";

export const GET_USER = gql`
  query getUser {
    user {
      _id
      username
      calorieGoal
    }
  }
  `;

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

export const UPDATE_USER_PROFILE = gql`
mutation updateUserProfile(
  $userId: ID!
  $calorieGoal: Int
  $password: String
  $profilePic: String
) {
  updateUserProfile(
    userId: $userId
    calorieGoal: $calorieGoal
    password: $password
    profilePic: $profilePic
  ) {
    _id
    username
    email
    calorieGoal
    profilePic
  }
}
`;