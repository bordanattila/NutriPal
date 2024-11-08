import { gql } from "@apollo/client";

export const GET_USER = gql`
  query getUser {
    user {
      _id
      username
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