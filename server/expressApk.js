const express = require('express');
const cors = require('cors');
const {connection} = require('./bdd.js');

const app = express();
const PORT = 5010;

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
});

app.use(cors({
  origin: "http://77.37.51.45:8081"
}));

// Route d'accueil
app.get('/teste', (req, res) => {

const data = async ()=>{
const [result] = await connection.query(
'select * from teste;'
);
return result;
}

data().then((result)=>{
res.json(result)
})


});

