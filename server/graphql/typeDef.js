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
        cachedSitePage(key: String!):SitePage

        photos(page:Int, pageSize: Int):PagedPhotos
        photosets:[Photosets]
        photosetImages(id:String!, page:Int, pageSize: Int):PagedPhotos
        siteGallery(page:Int, pageSize: Int):PagedPhotos

        services(type: String, page:Int, pageSize: Int):[Service]

        events(startDt: String!, endDt:String!):[Event]
        event(id: String!):Event
        eventAvailability(startDt: String!, endDt: String!, time:Int):[EventDate]

        reviews: [Review]
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

        upsertService(title:String!, type:String, _id:String, time:Int, price:Int, bookingSite:String, image:String, description:String): String
        removeService(_id:String!): Boolean

        createEvent(service: String!, name: String!, email:String!, phone:String!, startTime: String, endTime: String):String
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

    type Service {
        _id: String 
        title: String
        type: String
        time: Int 
        price: Int 
        bookingSite: String 
        image: String
        description: String
    }

    type EventDate {
        date: Date
        dateTime: Date
        timeZone: String
    }

    type Event {
        id: String
        summary: String
        description: String
        status: String
        htmlLink: String
        created: Date
        location: String
        start: EventDate
        end: EventDate
    }

    type Reviewer {
        profilePhotoUrl: String
        displayName: String
        isAnonymous: Boolean
    }

    type Review {
        name: String
        reviewId: String
        reviewer: Reviewer
        starRating: String
        comment: String
        createTime: Date
    }
`;