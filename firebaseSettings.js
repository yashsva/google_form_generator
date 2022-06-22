const {
  initializeApp,
  applicationDefault,
  cert,
} = require('firebase-admin/app');
const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require('firebase-admin/firestore');

const serviceAccount = require('./important.json');

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
console.log(db);

module.exports = db;
