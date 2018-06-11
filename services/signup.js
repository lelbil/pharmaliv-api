'use strict'

const uuid = require('uuid/v4')

const db = require('../db')
const ERRORS = require('../common/errors')
const CONSTANTS = require('../common/constants')

const getAdditionnalInfoInAppropriateTable = (userInfo, typeTable) => {
    const infoToInsert = {}

    infoToInsert.email = userInfo.email
    infoToInsert.tel = userInfo.tel
    infoToInsert.adresse = userInfo.address

    if (typeTable === "patient") {
        infoToInsert.nss = userInfo.nss
        infoToInsert.dob = userInfo.dob
    }

    if (typeTable === "pharmacie") {
        infoToInsert.denomination = userInfo.pharmaName
        infoToInsert.siren = userInfo.siren
    } else {
        infoToInsert.nom = userInfo.fname
        infoToInsert.prenom = userInfo.lname
    }

    if (typeTable === "livreur") {
        infoToInsert.denomination = userInfo.deliveryCompany
    }

    return infoToInsert
}

exports.registerOrUpdateUser = async (userInfo, isUpdate, userId, userInfoId) => {
    //TODO: validate body + type must be one of possible types
    //TODO: encrypt
    const typeTable = CONSTANTS.contentToTypeMapping[userInfo.type]

    const additionalUserInfo = getAdditionnalInfoInAppropriateTable(userInfo, typeTable)

    const newUser = {
        user: userInfo.user,
        password: userInfo.password,
        type: userInfo.type,
    }

    if (isUpdate && userInfo.profilePic) newUser.profilePic = userInfo.profilePic

    let loginInfo
    let additionalInfo

    if (! isUpdate ) {
        const [duplicate] = await db.select().from('user').where({user: userInfo.user})
        if (duplicate) {
            throw {name: ERRORS.ALREADY_EXISTS_ERROR, message: `Can't sign up with already existent login`}
        }

        newUser.profilePic = userInfo.profilePic || "http://s3.amazonaws.com/37assets/svn/765-default-avatar.png"

        const newId = uuid()
        newUser.id = newId
        additionalUserInfo.id = uuid()
        additionalUserInfo.userId = newId

        loginInfo = await db('user').insert(newUser).returning('*')
        additionalInfo = await db(typeTable).insert(additionalUserInfo).returning('*')
    }
    else {
        loginInfo = await db('user').update(newUser).where({ id: userId }).returning('*')
        additionalInfo = await db(typeTable).update(additionalUserInfo).where({ id: userInfoId }).returning('*')
    }

    return { loginInfo: loginInfo[0], additionalInfo: additionalInfo[0] }
}