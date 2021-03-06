CREATE TYPE userType AS ENUM ('patientContent', 'deliveryManContent', 'doctorContent', 'pharmacistContent');
CREATE TYPE medicamentCategorie AS ENUM ('MEDICAMENTS','HOMEO','SANTE','COMPLEMENTS_ALIMENTAIRES','PLANTES','VISAGE','CORPS','HYGIENE','CHEVEUX','BEBE','ORTHO','BIO','PROMO');
CREATE TYPE commandeType AS ENUM ('domicile', 'pharmacie');
CREATE TYPE commandeEtat AS ENUM ('ordered', 'prepared', 'accepted', 'pickedup', 'delivered', 'canceled', 'rejected', 'deliveryProblem');

CREATE TABLE "user" (
    id uuid PRIMARY KEY NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL default CURRENT_DATE,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL default CURRENT_DATE,
    "user" varchar(55) NOT NULL,
    "password" varchar(55) NOT NULL,
    "type" userType NOT NULL,
    "profilePic" varchar(254) NOT NULL,
    unique("user")
);

CREATE TABLE "medecin" (
    id uuid PRIMARY KEY NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL default CURRENT_DATE,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL default CURRENT_DATE,
    "userId" uuid REFERENCES "user" ON DELETE CASCADE,
    "nom" varchar(31),
    "prenom" varchar(31),
    "adresse" varchar(254),
    "email" varchar(31),
    "tel" varchar(31)
);

CREATE TABLE "patient" (
    id uuid PRIMARY KEY NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL default CURRENT_DATE,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL default CURRENT_DATE,
    "userId" uuid REFERENCES "user" ON DELETE CASCADE,
    "doctorInfoId" uuid REFERENCES "medecin",
    "nom" varchar(31),
    "prenom" varchar(31),
    "dob" DATE,
    "adresse" varchar(254),
    "email" varchar(31),
    "tel" varchar(31),
    "nss" varchar(31)
);

CREATE TABLE "pharmacie" (
    id uuid PRIMARY KEY NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL default CURRENT_DATE,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL default CURRENT_DATE,
    "userId" uuid REFERENCES "user" ON DELETE CASCADE,
    "denomination" varchar(31),
    "siren" varchar(31),
    "adresse" varchar(254),
    "email" varchar(31),
    "tel" varchar(31)
);

CREATE TABLE "livreur" (
    id uuid PRIMARY KEY NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL default CURRENT_DATE,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL default CURRENT_DATE,
    "userId" uuid REFERENCES "user" ON DELETE CASCADE,
    "denomination" varchar(31),
    "nom" varchar(31),
    "prenom" varchar(31),
    "adresse" varchar(254),
    "email" varchar(31),
    "tel" varchar(31)
);

CREATE TABLE "medicament" (
    id uuid PRIMARY KEY NOT NULL,
    "nom" varchar(31),
    "description" varchar(254),
    "imgLink" varchar(254),
    "categorie" medicamentCategorie NOT NULL,
    "prix" decimal,
    "ordonnance" boolean,
    "pharmacieId" uuid REFERENCES "pharmacie" ON DELETE CASCADE,
    "inventaire" INTEGER
);

CREATE TABLE "panier" (
    id uuid PRIMARY KEY NOT NULL,
    "medicamentId" uuid REFERENCES "medicament",
    "patientId" uuid REFERENCES "patient" ON DELETE CASCADE,
    "quantite" INTEGER NOT NULL,
    "ordered" boolean
);

CREATE TABLE "commande" (
    id uuid PRIMARY KEY NOT NULL,
    "orderedAt" TIMESTAMP WITH TIME ZONE NOT NULL default CURRENT_DATE,
    "type" commandeType NOT NULL,
    "livreurId" uuid REFERENCES "livreur",
    "pharmacieId" uuid REFERENCES "pharmacie",
    "medecinId" uuid REFERENCES "medecin",
    "etat" commandeEtat NOT NULL,
    "ordonnanceURL" varchar(254)
);

CREATE TABLE "panierCommande" (
    "panierId" uuid REFERENCES "panier",
    "commandeId" uuid REFERENCES "commande"
);