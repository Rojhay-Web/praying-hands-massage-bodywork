const { gql } = require('apollo-server-express');

module.exports = gql`
    scalar Date
    scalar JSONObj
    type Query { 
        user(id: String!):User
        userPermissions(_id: String!):User
    }

    type Mutation {
        addUserPermissions(email: String!, isAdmin: Boolean, scopes: JSONObj): String
        updateUserPermissions(_id: String!, email: String, isAdmin: Boolean, scopes: JSONObj): String
        removeUserPermissions(_id: String!): Boolean
    }

    type User {
        id: ID!
        email: String
        given_name: String
        family_name: String
        name: String
        picture: String
        verified_email: Boolean

        _id: String
        isAdmin: Boolean
        scopes: JSONObj
    }
`;