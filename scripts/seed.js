'use strict'
const uuid = require('uuid/v4')

const db = require('../db')

console.log('Seeding Database..')

const patientId = uuid()
const pharmacienId = uuid()
const medecinId = uuid()
const livreurId = uuid()

const pharmacieInfoId = uuid()

const users = [
    {
        id: patientId,
        user: "patient",
        password: "patient",
        type: "patientContent",
    },
    {
        id: pharmacienId,
        user: "pharmacien",
        password: "pharmacien",
        type: "pharmacistContent",
    },
    {
        id: medecinId,
        user: "medecin",
        password: "medecin",
        type: "doctorContent",
    },
    {
        id: livreurId,
        user: "livreur",
        password: "livreur",
        type: "deliveryManContent",
    },
]

const patientInfo = {
    id: uuid(),
    userId: patientId,
    nom: "Messi",
    prenom: "Lionel",
    dob: new Date('1987-06-24'),
    adresse: 'Carrer d\'Arístides Maillol, s/n. 08028 Barcelona',
    email: 'lionel.messi@barcelona.es',
    tel: '06 99 87 65 43',
    nss: '1 87 12 75 115 107 92',
}

const pharmacieInfo = {
    id: pharmacieInfoId,
    userId: pharmacienId,
    denomination: 'Pharmacie Monge',
    siren: '803 285 162',
    adresse: '29 rue eugene jumin 75019 paris',
    email: 'pharmacie@paris.fr',
    tel: '01 44 84 70 98',
}

const livreurInfo = {
    id: uuid(),
    userId: pharmacienId,
    denomination: 'Stuart',
    nom: 'ATTOUCHI',
    prenom: 'Billel',
    adresse: '173 Boulevard Macdonald 75019 Paris',
    email: 'billel.attouchi@stuart.fr',
    tel: '06 47 06 07 94',
}

const docteurInfo = {
    id: uuid(),
    userId: medecinId,
    nom: 'Bigaré',
    prenom: 'Marc',
    adresse: '36 Avenue de la Porte d\'Ivry, 75013 Paris',
    email: 'marc.bigare@docteur.fr',
    tel: '09 70 75 54 22',
}

const medicaments = [
    {
        id: uuid(),
        nom: 'Doliprane 1000mg',
        description: 'Paracetamol, also known as acetaminophen or APAP, is a medicine used to treat pain and fever. It is typically used for mild to moderate pain relief. Evidence for its use to relieve fever in children is mixed',
        imgLink: 'https://www.pharmarket.com/media/fr_FR3573577/f1200xf1200/doliprane-tabs-1000mg-8-comprimes-f1200-f1200.png',
        categorie: 'MEDICAMENTS',
        prix: 2.18,
        ordonnance: false,
        pharmacieId: pharmacieInfoId,
        inventaire: 74,
    },
    {
        id: uuid(),
        nom: 'CALCIBRONAT 2 g',
        description: 'comprimé effervescent',
        imgLink: 'https://www.pharmanco.com/media/8055__083238700_1751_15072013.jpg',
        categorie: 'SANTE',
        prix: 15.9,
        ordonnance: true,
        pharmacieId: pharmacieInfoId,
        inventaire: 12,
    },
    {
        id: uuid(),
        nom: 'FORTRANS',
        description: 'poudre pour solution buvable en sachet',
        imgLink: 'https://static.shop-pharmacie.fr/images/F10002274-p1.jpg',
        categorie: 'MEDICAMENTS',
        prix: 10.21,
        ordonnance: false,
        pharmacieId: pharmacieInfoId,
        inventaire: 8,
    },
    {
        id: uuid(),
        nom: 'ACARBOSE BIOGARAN',
        description: '50 mg, comprimé',
        imgLink: 'https://www.illicopharma.com/30891/acarbose-mylan-50mg-90cpr.jpg',
        categorie: 'SANTE',
        prix: 12.2,
        ordonnance: false,
        pharmacieId: pharmacieInfoId,
        inventaire: 74,
    },
]

const populateDatabase = async () => {

    await db('user').insert(users)
    console.log('Basic user credentials created successfully.')

    await Promise.all([
            db('patient').insert(patientInfo),
            db('pharmacie').insert(pharmacieInfo),
            db('livreur').insert(livreurInfo),
            db('medecin').insert(docteurInfo),
        ])
    console.log('Individual user info created successfully.')

    await db('medicament').insert(medicaments)
    console.log('Drugs created successfully.')

}

populateDatabase()
    .then(() => {console.log('Database seeding succeeded! :)'); process.exit(0)})
    .catch(error => { console.log('Database seeding failed with error :(', error); process.exit(1)})