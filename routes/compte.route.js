/**
 * Création compte
 * Confirmer email
 * Connexion
 * Retourver mot de passe perdu
 * Afficher/modifier profil
 * Afficher/modifier panier
 * Afficher/modifier profil admin
 * Ajouter produit admin
 * Deconnexion
 */

"use strict";

const express = require("express");
const router = express.Router({ mergeParams: true });

const compteController = require("../controllers/compte.controller");

const isAuth = require("../middleware/is-auth");
const isAdmin = require("../middleware/is-admin");

// Connexion
router.get("/connexion", compteController.getConnexion);
router.post("/connexion", compteController.postConnexion);

// Inscription
router.get("/inscription", compteController.getInscription);
router.post("/inscription", compteController.postInscription);

// Confirmation et mot de passe oublié
router.get("/confirmer/:userId", compteController.confirmerEmail);

router.get("/recover", compteController.getMdpOublie);
router.post("/recover", compteController.postMdpOublie);
router.get("/recover/:token", compteController.getValiderMdpOublie);
router.post("/changer-mdp", compteController.postChangerMdp);

// Profil
router.get("/profil", isAuth, compteController.getProfil);
router.post("/profil", isAuth, compteController.postProfil);

router.get("/profil/admin", [isAuth, isAdmin], compteController.getProfilAdmin);
router.post(
  "/profil/admin/ajouter",
  [isAuth, isAdmin],
  compteController.postAjouterProduitAdmin
);

// Panier
router.get("/profil/panier", isAuth, compteController.getPanier);
router.post("/profil/panier/:articleId", isAuth, compteController.postPanier);
router.put(
  "/profil/panier/changer-qty",
  isAuth,
  compteController.postChangerQtyPanier
);
router.get(
  "/profil/panier/supprimer/:articleId",
  isAuth,
  compteController.deletePanier
);

// Historique de commandes
router.get("/profil/commandes", isAuth, compteController.getCommandes);
router.get("/profil/commandes/:commandeId", isAuth, compteController.getCommande);

router.all("/deconnexion", compteController.getDeconnexion);

module.exports = router;
