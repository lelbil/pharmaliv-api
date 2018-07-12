const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'pharmaliv75@gmail.com',
        pass: 'lg5evI09v'
    }
})

module.exports = (newUserEmail, newUsername, newUserPassword) => {
    const mailOptions = {
        from: 'Pharmaliv ✔ <pharmaliv75@gmail.com', // sender address
        to: newUserEmail, // list of receivers
        subject: 'Bienvenu sur pharmaliv ✔', // Subject line
        text: `Vous étiez inscrit. Vous pouvez désormais vous connecter en utilisant les identifiants suivants:\n\tnom d'utilisateur: ${newUsername}\n\tmotDePasse: ${newUserPassword}\nVous pouvez bien-entendu modifier vos informations personnelles ainsi que vos identifiants d'accès à tout moment sur le site pharmaliv`,
        html: '<h5>Bienvenu sur Pharmaliv ✔</h5><p>Vous êtes maintenant inscrit. Vous pouvez désormais vous connecter en utilisant les identifiants suivants:<br/>nom d\'utilisateur: &nbsp; <b>' + newUsername + '</b> <br/> motDePasse: &nbsp; <b>' + newUserPassword + '</b> <br/> Vous pouvez bien-entendu modifier vos informations personnelles ainsi que vos identifiants d\'accès à tout moment sur le site pharmaliv</p>'
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('EMAIL NOT SENT TO PATIENT!')
        }
        else console.log('Email sent to user', info.response)
    })
}