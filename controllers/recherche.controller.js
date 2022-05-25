"use strict";

const Produits = require("../schemas/produits");
const Categorie = require("../schemas/categorie");
const dotenv = require("dotenv");
dotenv.config();

exports.postRecherche = (req, res, next) => {
  const recherche = req.body.recherche;
  if (recherche === "") {
    res.redirect("/produits");
  } else {
    const redirect = "/recherche/" + recherche;
    res.redirect(redirect);
  }
};

exports.getResultatRecherche = (req, res, next) => {
  const terme = req.params.terme;
  Produits.find({
    nom: { $regex: terme, $options: "i" },
    est_discontinue: false,
  })
    .then((produits) => {
      res.render("recherche", {
        titre_page: "UpNorth - Tout les produits",
        produits: produits,
        terme: terme,
        categorie: null,
        sexe: null,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getProduitsCategorie = async (req, res, next) => {
  let nomCategorie = req.params.nomCategorie;
  switch (nomCategorie) {
    case "hommes":
    case "femmes":
    case "unisexe":
      let sexe = "h";
      if (nomCategorie === "femmes") {
        sexe = "f";
      } else if (nomCategorie === "unisexe") {
        sexe = "u";
      }
      Produits.find({ sexe: sexe, est_discontinue: false })
        .then((produits) => {
          res.render("recherche", {
            titre_page: "UpNorth - Recherche par sexe",
            produits: produits,
            terme: null,
            categorie: null,
            sexe: nomCategorie,
          });
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
      break;
    case "accessoire":
    case "chandail":
    case "chemise":
    case "pantalon":
      nomCategorie = nomCategorie[0].toUpperCase() + nomCategorie.slice(1);
      Categorie.findOne({ nom: nomCategorie })
        .then((categorie) => {
          Produits.find({ id_categorie: categorie._id, est_discontinue: false })
            .then((produits) => {
              res.render("recherche", {
                titre_page:
                  "UpNorth - Produits de la catégorie " + nomCategorie,
                produits: produits,
                terme: null,
                categorie: categorie.nom.toLowerCase(),
                sexe: null,
              });
            })
            .catch((err) => {
              if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err);
            });
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
      break;
    default:
      next();
      break;
  }
};
