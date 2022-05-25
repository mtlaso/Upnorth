"use strict";
const Utilisateur = require("../schemas/utilisateur");

/* Vérifie si un utilisateur est administrateur, doit toujours être appelé après is-auth.js car il
utilise req.user */
module.exports = async (req, res, next) => {
  try {
    const usr = await Utilisateur.find({ email: req.user.email });

    if (usr.length <= 0) {
      const err = new Error("Utilsateur introuvable.");
      throw err;
    }

    if (usr[0].est_admin === false) {
      const err = new Error("Accès not autorisé");
      err.statusCode = 403;
      throw err;
    }

    // Utilisateur est admin
    next();
  } catch (err) {
    if (err.statusCode) {
      res.status(err.statusCode).render(`erreurs/erreur${err.statusCode}`, {
        erreur: err,
        titre_page: `UpNorth - Erreur ${err.statusCode}`,
      });
    } else {
      res.status(500).render("erreurs/erreur500", {
        erreur: err,
        titre_page: "UpNorth - Erreur 500",
      });
    }
  }
};
