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

exports.registerNewUser = async userInfo => {
    //TODO: validate body + type must be one of possible types
    //TODO: encrypt
    const typeTable = CONSTANTS.contentToTypeMapping[userInfo.type]

    const additionalUserInfo = getAdditionnalInfoInAppropriateTable(userInfo, typeTable)

    const newUser = {
        user: userInfo.user,
        password: userInfo.password,
        type: userInfo.type
    }

    const [ duplicate ] =  await db.select().from('user').where({ user: newUser.user })
    if (duplicate) {
        throw {name: ERRORS.ALREADY_EXISTS_ERROR, message: `Can't sign up with already existent login`}
    }

    const newId = uuid()
    newUser.id = newId
    additionalUserInfo.id = uuid()
    additionalUserInfo.userId = newId

    const loginInfo = await db('user').insert(newUser).returning('*')
    const additionalInfo = await db(typeTable).insert(additionalUserInfo).returning('*')

    return { loginInfo: loginInfo[0], additionalInfo: additionalInfo[0] }
}