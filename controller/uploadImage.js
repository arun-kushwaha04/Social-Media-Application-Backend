// firebaseConfig = {
//     apiKey: process.env.API_KEY,
//     authDomain: process.env.AUTH_DOMAIN,
//     projectId: process.env.PROJECT_ID,
//     storageBucket: process.env.STORAGE_BUCKET,
//     messagingSenderId: process.env.MESSAGING_SENDER_ID,
//     appId: process.env.APP_ID,
//     measurementId: process.env.MESUREMENT_ID
// }

var firebaseConfig = {
    apiKey: "AIzaSyDcbVldme9vdPUh6TZjVJp0dX79HLDn9Qc",
    authDomain: "dubify-7f0f8.firebaseapp.com",
    projectId: "dubify-7f0f8",
    storageBucket: "dubify-7f0f8.appspot.com",
    messagingSenderId: "953597362393",
    appId: "1:953597362393:web:aa70c6afe1300a6123fec8",
    measurementId: "G-DXB9X7HJME"
};

exports.addFeed = (req, res) => {
    res.status(200).json({
        message: "Credentials reterived successfully",
        firebaseConfig: firebaseConfig,
    })
}