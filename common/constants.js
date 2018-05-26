'use strict'

exports.contentToTypeMapping = {
    ["patientContent"]: "patient",
    ["doctorContent"]: "medecin",
    ["pharmacistContent"]: "pharmacie",
    ["deliveryManContent"]: "livreur"
}

exports.orderStates = ['ordered', 'prepared', 'pickedup', 'delivered', 'canceled', 'rejected', 'deliveryProblem']