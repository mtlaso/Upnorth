"use strict";

const Utilisateur = require("../schemas/utilisateur");
const utilisateur = require("../schemas/utilisateur");
const Produits = require("../schemas/produits");
const Categorie = require("../schemas/categorie");
const Taille = require("../schemas/taille");

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

exports.getAccueil = async (req, res, next) => {
  try {
    let listProduits = [];
    const categories = await Categorie.find();

    for (let i = 0; i < categories.length; i++) {
      await Produits.find({
        id_categorie: categories[i]._id,
        est_discontinue: false,
      })
        .limit(4)
        .then((produits) => {
          listProduits[i] = produits;
        });
    }

    res.render("index", {
      titre_page: "UpNorth - Accueil",
      produits: listProduits,
      categories: categories,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

exports.postAccueil = (req, res, next) => {
  res.render("index", { token: token });
};

// Permet d'ajouter des produits random pour tester.
// exports.getAjoutdeProduits = async (req, res, next) => {
//     try {
//         await Produits.deleteMany({});
//         const listetailles = await Taille.find();
//         const categories = await Categorie.find();
//         for (let i=0; i<categories.length; i++) {
//             for (let j=0; j<50; j++){
//                 const produit = new Produits();
//                 produit.id_categorie = categories[i]._id;
//                 produit.nom = categories[i].nom + " " + (j+1);
//                 produit.desc = "Un produit de type " + categories[i].nom;
//                 produit.prix = Math.floor(Math.random()* 1000) + 1;
//                 produit.image = "image";
//                 if (j % 2 === 0){
//                     produit.sexe = "h";
//                 }else {
//                     produit.sexe = "f";
//                 }
//                 produit.est_discontinue = false;
//                 const tailles = [];
//                 for (let k=0; k<listetailles.length; k++) {
//                     const nouvelletaille = {};
//                     nouvelletaille.id_taille = listetailles[k]._id;
//                     nouvelletaille.qty = Math.floor(Math.random()* 1000) + 1;
//                     tailles[k] = nouvelletaille;
//                 }
//                 console.log(tailles);
//                 produit.tailles = tailles;
//                 produit.save();
//             }
//         }
//         res.send("COUCOU");
//     } catch (err) {
//         res.status(400).send("Une erreur s'est produite. " + err);
//       }
// };
