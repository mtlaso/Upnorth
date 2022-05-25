"use strict";

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

/** Vérifie si la requête a un token JWT valide */

module.exports = (req, res, next) => {
  const token = req.session.jwtToken;
  if (!token) {
    res.status(401).render("erreurs/erreur401", {
      erreur: "Vous devez être authentifié pour accéder à cette page.",
      titre_page: "UpNorth - Erreur 401",
    });
    return;
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.SECRET_JWT);
  } catch (err) {
    err.statusCode = 401;
    throw err;
  }

  if (!decodedToken) {
    const error = new Error("Non authentifié.");
    error.statusCode = 401;
    throw error;
  }

  // Passe le token décodé dans la requête pour pouvoir l'utiliser ailleurs dans le code
  req.user = decodedToken;
  console.log("decodedToken", decodedToken);
  next();
};
