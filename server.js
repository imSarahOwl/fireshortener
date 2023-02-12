const express = require('express')
const app = express()
var admin = require("firebase-admin");

app.use(express.urlencoded({extended:false}));

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fireshortener-4509c.firebaseio.com"
});

var db = admin.firestore();

function isValidHttpUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (err) {
      return false;
    }
  }

function generate(len) {
    var length = len,
        charset = 
 "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz",
        password = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
 }

app.get('/:id', (req, res) => {
    var query = db.collection('urls').where('code', '==', req.params.id);
    query.get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                console.log(doc.data().url)
                return res.status(301).redirect(doc.data().url)
            });
        })
        .catch(err => {
            return res.sendStatus(404)
        });
    
})

app.post('/', (req, res) => {
    var docRef = db.collection('urls').doc(generate(20));
    var lecode = generate(6)
    var leurl
    if (!isValidHttpUrl(req.query.url)) {
        var leurl = `https://${req.query.url}`
    } else {
        var leurl = req.params.url
    }

    docRef.set({
        code: lecode,
        url:  leurl,
    });

    res.send(lecode)
})

app.listen(process.env.PORT, () => {
    console.log(`FireShortener listening on port ${process.env.PORT}`)
})