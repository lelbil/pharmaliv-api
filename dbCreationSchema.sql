CREATE TYPE userType AS ENUM ('patientContent', 'deliveryManContent', 'doctorContent', 'pharmacistContent');

CREATE TABLE "user" (
    id uuid PRIMARY KEY NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL default CURRENT_DATE,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL default CURRENT_DATE,
    "user" varchar(55) NOT NULL,
    "password" varchar(55) NOT NULL,
    "type" userType NOT NULL,
    unique("user")
);