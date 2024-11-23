const { gql } = require('apollo-server-express');

module.exports = gql`
    scalar Date
    scalar JSONObj
    type Query { 
        user(id: String!):User
        userPermissions(appId: String!):User
        getSheetData(sheetName: String!):JSONObj
    }

    type Mutation {
        addUserPermissions(email: String!, isAdmin: Boolean, scopes: JSONObj): Boolean
        updateUserPermissions(appId: String!, isAdmin: Boolean, scopes: JSONObj): Boolean
        removeUserPermissions(appId: String!): Boolean
    }

    type User {
        id: ID!
        email: String
        given_name: String
        family_name: String
        name: String
        picture: String
        verified_email: Boolean

        appId: String
        isAdmin: Boolean
        scopes: JSONObj
    }
`;