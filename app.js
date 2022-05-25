"use strict";

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

const port = process.env.PORT || 4000;

const dotenv = require("dotenv").config();

// https://docs.atlas.mongodb.com/troubleshoot-connection/#special-characters-in-connection-string-password
const DB_PWD = encodeURIComponent(process.env.DB_PWD);
// DB_NAME ne semble pas fonctionner?
// const DB_NAME = process.DB_NAME;
const CONN_URL = `mongodb+srv://appfweb:${DB_PWD}@cluster-apprfweb.iivqk.mongodb.net/upnorthDB?retryWrites=true&w=majority`;

// Initialiser exress
const app = express();

// express-session (neccessaire pour les jwt)
// https://www.npmjs.com/package/express-session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60, // En millisecondes, 1000 = 1 seconde. Total: 1h, comme les jwt
      httpOnly: true, // Cookie pas accessible depuis js
      sameSite: "lax", // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite#lax
      // secure: true // Envoyer cookie seulement en https (en production)
    },
    resave: true,
    saveUninitialized: false,
    name: "__s",
  })
);

// Bodyparser
app.use(
  express.urlencoded({
    extended: false,
  })
);

// Utilisé dans "header.ejs" pour savoir si un utilisateur est connecté ou pas
app.use((req, res, next) => {
  if (req.session.jwtToken) {
    res.locals.ejs_is_logged_in = true;
  } else {
    res.locals.ejs_is_logged_in = false;
  }
  next();
});

// Les headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Importe les routes
const compte = require("./routes/compte.route");
const liste = require("./routes/liste.route");
const accueil = require("./routes/accueil.route");
const produits = require("./routes/produits.route");
const recherche = require("./routes/recherche.route");
const checkout = require("./routes/checkout.route");

// Setup template
app.set("view engine", "ejs");
app.use(express.static("public"));

// Setup vues
app.set("views", "views");

app.use(accueil);
app.use(compte);
app.use(liste);
app.use(produits);
app.use(recherche);
app.use(checkout);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

mongoose
  .connect(CONN_URL)
  .then((result) => {
    console.log("Connecté à la base de données.");
  })
  .catch((err) => console.log(err, "Erreur de connexion vers la db."))
  .finally(() => {
    mongoose.connection.on("error", (err) => {
      console.log(
        "Erreur de connection vers la db, apres qu'une connection fut etablie"
      );
      console.log(err);
    });
  });

// Erreurs 404 (https://expressjs.com/en/starter/faq.html -> How do I handle 404 responses)
app.use((req, res, next) => {
  res.status(404).render("erreurs/erreur404", {
    titre_page: "UpNorth - Erreur 404!",
    erreur: null,
  });
});

// Autres erreurs (https://expressjs.com/en/starter/faq.html -> How do I setup an error handler?)
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message || "";
  const data = error.data;

  res.status(status).render(`erreurs/erreur${status}`, {
    titre_page: `UpNorth - Erreur ${status}!`,
    erreur: message,
  });
});
