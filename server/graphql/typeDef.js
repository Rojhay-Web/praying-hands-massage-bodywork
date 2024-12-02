const { gql } = require('apollo-server-express');

module.exports = gql`
    scalar Date
    scalar JSONObj
    type Query { 
        users:[User]
        user(id: String!):User
        userPermissions(_id: String!):User
        
        sitePages:[SitePage]
        sitePage(key: String!):SitePage

        photos(page:Int, pageSize: Int):PagedPhotos
        photosets:[Photosets]
        photosetImages(id:String!, page:Int, pageSize: Int):PagedPhotos
    }

    type Mutation {
        addUserPermissions(email: String!, isAdmin: Boolean, scopes: JSONObj): String
        updateUserPermissions(_id: String!, email: String, isAdmin: Boolean, scopes: JSONObj): String
        removeUserPermissions(_id: String!): Boolean

        upsertSitePage(title: String!, pageKeys:[PageKeyInput], _id:String):String
        removeSitePage(_id: String!):Boolean

        upsertPageKey(_id: String!, key_id: String, title: String, type: String, meta:JSONObj, value:JSONObj): String
        removePageKey(_id: String!, key_id: String!):Boolean

        deletePhoto(id:String!):Boolean
        createPhotoset(title:String!, primaryPhotoId: String!, description:String):String
        editPhotoset(id:String!, title:String!, description:String):String
        deletePhotoset(id:String!):Boolean
        addPhotosetPhotos(id:String!, photoIds: [String]!):Boolean
        removePhotosetPhotos(id:String!, photoIds: [String]!):Boolean
    }

    input PageKeyInput {
        _id: String
        title: String
        type: String
        metaData: JSONObj
        value: JSONObj
    }

    type PageKey {
        _id: String
        title: String
        type: String
        metaData: JSONObj
        value: JSONObj
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

    type SitePage {
        _id: String!
        title: String
        key: String
        pageKeys: [PageKey]
    }

    type Photo {
        id: String
        url: String
    }
    
    type Photosets {
        id: String
        title: String
        description: String
        photos: Int
    }

    type PagedPhotos {
        pagesLeft: Boolean
        results:[Photo]
    }
`;