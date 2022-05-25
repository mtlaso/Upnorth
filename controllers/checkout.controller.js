"use strict";

const Utilisateur = require("../schemas/utilisateur");
const Commande = require("../schemas/commande");
const Panier = require("../schemas/panier");
const Produits = require("../schemas/produits");

const dotenv = require("dotenv");

// Initialise stripe
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const jwt = require("jsonwebtoken");

exports.postCreateCheckoutSession = async (req, res, next) => {
  try {
    const decodedJwtToken = jwt.decode(req.session.jwtToken);
    const userEmail = decodedJwtToken.email;

    const user = await Utilisateur.findOne({ email: userEmail });
    const panier = await Panier.findOne({ id_utilisateur: user._id });

    let line_items = new Array();
    for (let i = 0; i < panier.produits.length; i++) {
      const produit = await Produits.findById(panier.produits[i].id_produit);
      const price_data = {
        currency: "CAD",
        product_data: {
          name: produit.nom,
        },
        unit_amount: produit.prix * 100,
      };

      line_items.push({
        price_data: price_data,
        quantity: panier.produits[i].qty,
      });
    }

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${process.env.URL}/success`,
      cancel_url: `${process.env.URL}/cancel`,
    });

    res.redirect(303, session.url);
  } catch (erreur) {
    if (!erreur.statusCode) {
      erreur.statusCode = 500;
    }

    throw erreur;
  }
};

exports.getSuccess = async (req, res, next) => {
  try {
    // TODO: Vider le panier actuel et ajouter les informations de la commande
    // dans la table d'historique de commande.
    const decodedJwtToken = jwt.decode(req.session.jwtToken);
    const userEmail = decodedJwtToken.email;

    // Obtention de l'utilisateur, son panier et son contenu.
    const user = await Utilisateur.findOne({ email: userEmail });
    const panier = await Panier.findOne({ id_utilisateur: user._id });
    const produitsPanier = panier.produits;

    // Création de l'array des produits pour la table des commandes.
    let produits = new Array();
    let total = 0;

    // Ajout des produits dans l'array.
    for (let i = 0; i < produitsPanier.length; i++) {
      const produit = await Produits.findById(produitsPanier[i].id_produit);
      const produitCommande = {
        id_produit: produit._id,
        nom: produit.nom,
        image: produit.image,
        taille: produitsPanier[i].taille,
        qty: produitsPanier[i].qty,
        prix: produit.prix,
      };
      total += produitCommande.prix * produitCommande.qty;
      produits.push(produitCommande);
    }

    // Création de la commande.
    const commande = new Commande({
      produits: produits,
      total: total,
      adresseLivraison: user.adresse,
    });
    commande.save();

    //Ajout de la commande à la liste des commandes de l'utilisateur.
    user.commandes.push(commande._id);
    user.save();

    // Vider le panier de l'utilisateur.
    panier.produits = [];
    panier.save();

    res.render("panier/succes", {
      titre_page: "UpNorth - Confirmation de commande",
    });
  } catch (erreur) {
    if (!erreur.statusCode) {
      erreur.statusCode = 500;
    }

    throw erreur;
  }
};

exports.getCancel = async (req, res, next) => {
  res.render("panier/annule", { titre_page: "UpNorth - Commande annulée" });
};
