CREATE TYPE userType AS ENUM ('patientContent', 'deliveryManContent', 'doctorContent', 'pharmacistContent');
CREATE TYPE medicamentCategorie AS ENUM ('MEDICAMENTS','HOMEO','SANTE','COMPLEMENTS_ALIMENTAIRES','PLANTES','VISAGE','CORPS','HYGIENE','CHEVEUX','BEBE','ORTHO','BIO','PROMO');

CREATE TABLE "user" (
    id uuid PRIMARY KEY NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL default CURRENT_DATE,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL default CURRENT_DATE,
    "user" varchar(55) NOT NULL,
    "password" varchar(55) NOT NULL,
    "type" userType NOT NULL,
    unique("user")
);

CREATE TABLE "patient" (
    id uuid PRIMARY KEY NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL default CURRENT_DATE,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL default CURRENT_DATE,
    "userId" uuid REFERENCES "user" ON DELETE CASCADE,
    "nom" varchar(31),
    "prenom" varchar(31),
    "dob" DATE,
    "adresse" varchar(254),
    "email" varchar(31),
    "tel" varchar(31),
    "nss" varchar(31)
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