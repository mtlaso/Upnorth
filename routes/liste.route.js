/**
 * La Wishlist
 */

"use strict";

const express = require("express");
const router = express.Router();

const listeController = require("../controllers/liste.controller");

const isAuth = require("../middleware/is-auth");

router.get("/profil/liste", isAuth, listeController.getListe); // Affiche le contenu de la liste
router.post("/profil/liste", isAuth, listeController.postListe); // Ajoute un element dans la liste
router.delete("/profil/liste", isAuth, listeController.deleteListe); // Retire un element de la liste

module.exports = router;
