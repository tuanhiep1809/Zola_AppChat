const admin = require("firebase-admin");
require('dotenv').config();

const serviceAccount = {
    "type": "service_account",
    "project_id": "zalo-78227",
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    "client_email": "firebase-adminsdk-mj3sl@zalo-78227.iam.gserviceaccount.com",
    "client_id": "111345811943505922237",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-mj3sl%40zalo-78227.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
}; 
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const authenToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const accessToken = authHeader ? authHeader.split(" ")[1] : null;
    if (!accessToken) 
        return res.status(401).send("UNAUTHORIZED REQUEST!");
    
    try {
        const decodedClaims = await admin
            .auth()
            .verifyIdToken(accessToken, true /** checkRevoked */);
        req.userCredential = decodedClaims;
        next();
    } catch (error) {
        res.status(401).send("UNAUTHORIZED REQUEST!");
    }
};

module.exports = {authenToken, admin};
