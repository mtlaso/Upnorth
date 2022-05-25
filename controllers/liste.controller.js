"use strict";

const Utilisateur = require("../schemas/utilisateur");
const Liste = require("../schemas/liste");
const Produit = require("../schemas/produits");

const mongoose = require("mongoose");

const valider_id = require("../autres/validateurs/valider_id");

const dotenv = require("dotenv");
const produits = require("../schemas/produits");
dotenv.config();

exports.getListe = async (req, res, next) => {
  try {
    let utilisateur;
    let liste;
    let produits = [];

    // Trouver utilisateur
    utilisateur = await Utilisateur.findOne({ email: req.user.email });
    if (utilisateur === null) {
      const err = new Error("Utilisateur introuvable.");
      err.statusCode = 404;
      return;
    }

    // Trouver wishlist
    liste = await Liste.findOne({ id_utilisateur: utilisateur._id });
    if (!liste) {
      // Créer la wish list
      liste = new Liste({
        id_utilisateur: utilisateur._id,
        produits: [],
      });

      await Liste.insertMany([liste]);
      liste = await Liste.findOne({ id_utilisateur: utilisateur._id });
    }

    // Trouver les produits
    for (let index = 0; index < liste.produits.length; index++) {
      const id = liste.produits[index];
      const produit = await Produit.findOne({ _id: id });

      // Ne pas afficher les produits discontinues et le retirer de la liste de l'utilisateur
      if (produit.est_discontinue === true) {
        // Retirer produit de la liste de l'utilisateur
        await Liste.findOneAndUpdate(
          { id_utilisateur: utilisateur._id },
          {
            $pull: { produits: produit._id },
          }
        );
      } else {
        produits.push(produit);
      }
    }

    res.render("wish_list/wish-list", {
      titre_page: "UpNorth - Liste",
      utilisateur: utilisateur,
      produits: produits,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

exports.postListe = async (req, res, next) => {
  try {
    const idProduit = req.body.idProduit;
    let produit;
    let utilisateur;
    let liste;

    // Valider idProduit
    if (!valider_id.valider(idProduit)) {
      res.status(400).json({ erreurs: "IdProduit invalide." });
      return;
    }

    // Trouver utilisateur
    utilisateur = await Utilisateur.findOne({ email: req.user.email });
    if (utilisateur === null) {
      res.status(400).json({ erreurs: "Utilisateur introuvable." });
      return;
    }

    // Trouver liste
    liste = await Liste.findOne({ id_utilisateur: utilisateur._id });
    if (liste === null) {
      res.status(400).json({ erreurs: "Liste introuvable." });
      return;
    }

    // Vérifier si le produit existe
    produit = await Produit.findOne({ _id: idProduit });
    if (!produit) {
      res.status(400).json({ erreurs: "Produit introuvable." });
      return;
    }

    // Vérifier si le produit est discontinué
    if (produit.est_discontinue === true) {
      res
        .status(400)
        .json({
          erreurs: "Produit discontinué. Ne peux pas être ajouté dans la liste",
        });
      return;
    }

    // Verfier si le produit est deja dans la liste
    if (!liste.produits.includes(idProduit)) {
      // Ajouter produit dans la liste (wishlist)
      await Liste.findOneAndUpdate(
        { id_utilisateur: utilisateur._id },
        {
          $push: { produits: idProduit },
        }
      );
    }

    res.json({ status: "ok" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

exports.deleteListe = async (req, res, next) => {
  try {
    const idProduit = req.body.idProduit;
    let utilisateur;
    let liste;

    // Verifier idProduit
    if (!valider_id.valider(idProduit)) {
      res.status(400).json({ erreurs: "IdProduit invalide." });
      return;
    }

    // Trouver utilisateur
    utilisateur = await Utilisateur.findOne({ email: req.user.email });
    if (utilisateur === null) {
      res.status(400).json({ erreurs: "Utilisateur introuvable." });
      return;
    }

    // Verifier que utilisateur a une liste
    liste = await Liste.findOne({ id_utilisateur: utilisateur._id });
    if (liste === null) {
      res.status(400).json({ erreurs: "Liste introuvable." });
      return;
    }

    // Supprimer element de la liste
    await Liste.findOneAndUpdate(
      { id_utilisateur: utilisateur._id },
      {
        $pull: { produits: idProduit },
      }
    );

    res.json({ status: "ok" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};
