/**
 * Recherche de produit
 */

"use strict";

const express = require("express");
const router = express.Router();

const rechercheController = require("../controllers/recherche.controller");

router.post("/recherche/", rechercheController.postRecherche);

router.get("/recherche/:terme", rechercheController.getResultatRecherche);

router.get("/recherche/categories/:nomCategorie", rechercheController.getProduitsCategorie);

// router.get("/recherche/categories", rechercheController.postRecherche);

// Route pour ajout de produits random.
// router.get("/ajoutdeproduits", accueilController.getAjoutdeProduits);

module.exports = router;
