/**
 * Afficher/modifier roduits
 * Afficher/modifier produits discontinués
 */
"use strict";

const express = require("express");
const router = express.Router();

const produitsController = require("../controllers/produits.controller");

const isAdmin = require("../middleware/is-admin");
const isAuth = require("../middleware/is-auth");

router.get("/produits", produitsController.getProduits);

router.get("/produits/:produitId", produitsController.getProduit);
router.get("/produits/:produitId/:ajouter?", produitsController.getProduit);

router.post(
  "/modifierAvecImage",
  [isAuth, isAdmin],
  produitsController.modifierProduitAvecImage
);

// ajouter isauth, isadmin
router.post(
  "/modifierSansImage",
  [isAuth, isAdmin],
  produitsController.modifierProduitSansImage
);

router.post(
  "/discontinuer",
  [isAuth, isAdmin],
  produitsController.discontinuerProduit
);

router.get(
  "/discontinues",
  [isAuth, isAdmin],
  produitsController.getProduitsDiscontinues
);

router.get(
  "/discontinues/:produitId",
  [isAuth, isAdmin],
  produitsController.getProduitDiscontinue
);

router.post(
  "/discontinues/:produitId/RemettreEnStock",
  [isAuth, isAdmin],
  produitsController.remettreProduitEnStock
);

module.exports = router;
