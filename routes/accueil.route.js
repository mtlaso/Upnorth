/**
 * Afficher les produits à l'accueil
 */

"use strict";

const express = require("express");
const router = express.Router();

const accueilController = require("../controllers/accueil.controller");
const isAuth = require("../middleware/is-auth");

router.get("/", accueilController.getAccueil);
router.post("/", isAuth, accueilController.postAccueil);

// Route pour ajout de produits random.
// router.get("/ajoutdeproduits", accueilController.getAjoutdeProduits);

module.exports = router;
