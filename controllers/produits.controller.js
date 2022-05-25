"use strict";

const Produit = require("../schemas/produits");
const Categorie = require("../schemas/categorie");
const Taille = require("../schemas/taille");
const Utilisateur = require("../schemas/utilisateur");

const decoderJwtToken = require("../autres/jwt/decoderJwtToken");

const valider_produit = require("../autres/validateurs/valider_produit");
const valider_id = require("../autres/validateurs/valider_id");
const infosImages = require("../autres/infosImage");

const trouverIdCategorie = require("../autres/trouverIdCategories");
const trouverIdTailles = require("../autres/trouverIdTailles");

const supprimerAncienneImage = require("../autres/supprimerAncienneImage");

const fs = require("fs");
const path = require("path");
const busboy = require("busboy");

exports.getProduits = async (req, res, next) => {
  Produit.find({ est_discontinue: false })
    .then((produits) => {
      res.render("produits", {
        titre_page: "UpNorth - Tout les produits",
        produits: produits,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getProduit = async (req, res, next) => {
  try {
    let ajouter = false;

    if (req.params.ajouter) {
      ajouter = true;
    }

    let estAdmin;
    let utilisateurConnecte;
    let tokenDecode;
    const jwtToken = req.session.jwtToken;

    let produit;
    let categorie;
    let categories;
    let sexes = ["h", "f", "u"];
    const tailles = await Taille.find({});
    const produitId = req.params.produitId;

    if (jwtToken) {
      tokenDecode = await decoderJwtToken.decodedJwtToken(jwtToken);
      utilisateurConnecte = await Utilisateur.findOne({
        email: tokenDecode.email,
      });

      if (utilisateurConnecte.est_admin) {
        estAdmin = true;
      } else {
        estAdmin = false;
      }
    }

    // Valider identifiant
    if (!valider_id.valider(produitId)) {
      const erreur = Error();
      erreur.message = `Identifiant "${produitId}" du produit invalide.`;
      erreur.status = 404;
      throw erreur;
    }

    // Ne pas afficher un produit qui est discontinué ici
    produit = await Produit.findOne({
      _id: produitId,
      est_discontinue: false,
    });

    // Validation si aucun produit n'est trouve avec cette id
    if (!produit) {
      const erreur = Error();
      erreur.message = "Produit non existant.";
      erreur.status = 404;
      throw erreur;
    }

    categorie = await Categorie.findById({ _id: produit.id_categorie });

    categories = await Categorie.find();

    res.render("details_produit", {
      titre_page: "Upnorth - Produit " + produit.nom,
      produit: produit,
      categorie: categorie,
      tailles: tailles,
      categories: categories,
      sexes: sexes,
      success: null,
      erreur: null,
      estAdmin: estAdmin,
      id_article: produit._id,
      url_discontinuer: "/discontinuer",
      url_modifier_sans_image: "/modifierSansImage",
      url_modifier_avec_image: "/modifierAvecImage",
      ajouter: ajouter,
    });
  } catch (erreur) {
    if (!erreur.statusCode) {
      erreur.statusCode = 500;
    }
    next(erreur);
  }
};

exports.modifierProduitAvecImage = async (req, res, next) => {
  try {
    let cheminAbsolu;
    let nomImage;

    let formulaire = new Map(); // Map c'est la meme chose qu'un objet, mais tu peux pas avoir de doublons

    const tailles = await Taille.find({});
    const categories = await Categorie.find({});
    const sexes = ["h", "f", "u"];

    let ancienProduit;
    let nouveauProduit;

    let idCategorie;
    let idTaillePetit;
    let idTailleMoyen;
    let idTailleGrand;
    let idTailleUnique;
    let est_discontinue;

    // Configurer busboy (fileupload, https://github.com/mscdex/busboy)
    const bb = busboy({
      headers: req.headers,
      limits: {
        fileSize: 1048576 * 1, // (5mb)
        files: 1,
      },
    });

    bb.on("file", async (name, file, info) => {
      /* (info.filename) - string - If supplied, this contains the file's filename.
         WARNING: You should almost never use this value as-is (especially if you are using preservePath: true in your config)
         as it could contain malicious input
      */
      // Valider image
      const err = valider_produit.validerImage(info);
      if (err) {
        res.status(400).json({ erreurs: err });
      } else {
        [cheminAbsolu, nomImage] = await infosImages.nomImage(info.mimeType);
        file.pipe(fs.createWriteStream(cheminAbsolu));
      }
    });

    bb.on("filesLimit", () => {
      // filesLimit() - Emitted when the configured limits.files limit has been reached. No more 'file' events will be emitted.
      res.status(400).json({
        erreurs: { image: "Seulement une image peut être téléchargée." },
      });
    });

    bb.on("field", (name, value, info) => {
      formulaire.set(name, value);
    });

    bb.on("error", (err) => {
      const erreur = Error();
      erreur.message = err.message;
      throw erreur;
    });

    bb.on("finish", async () => {
      // Valider autres infos du formulaire
      const err = valider_produit.validerProduit(
        formulaire,
        categories,
        sexes,
        tailles
      );

      if (err) {
        res.status(400).json({ erreurs: err });
        return;
      } else {
        // Trouver id de la categorie
        idCategorie = await trouverIdCategorie.trouverIdCategorie(
          formulaire.get("categorie")
        );

        // Trouver id des tailles
        [idTaillePetit, idTailleMoyen, idTailleGrand, idTailleUnique] =
          await trouverIdTailles.trouverIdTailles();

        // Determiner champ est_discontinue
        if (formulaire.get("est_discontinue") === "on") {
          est_discontinue = true;
        } else {
          est_discontinue = false;
        }

        console.log(formulaire);

        // Trouver ancien produit
        ancienProduit = await Produit.findOne({
          _id: formulaire.get("ancienIdProduit"),
        });

        // Supprmier ancinne image du produit
        await supprimerAncienneImage.supprimer(ancienProduit.image);

        // Supprmier ancien produit
        await Produit.deleteOne({
          _id: formulaire.get("ancienIdProduit"),
        });

        // Modifier produit (ajouter meme produit avec de nouvelles modifications)
        nouveauProduit = await new Produit({
          _id: formulaire.get("ancienIdProduit"), // Garder le meme id qu'avant
          id_categorie: idCategorie,
          nom: formulaire.get("nom"),
          desc: formulaire.get("description"),
          prix: formulaire.get("prix"),
          image: nomImage,
          sexe: formulaire.get("sexe"),
          est_discontinue: est_discontinue,
          tailles: [
            {
              id_taille: idTaillePetit._id,
              qty: formulaire.get("qty_Petit"),
            },
            {
              id_taille: idTailleMoyen._id,
              qty: formulaire.get("qty_Moyen"),
            },
            {
              id_taille: idTailleGrand._id,
              qty: formulaire.get("qty_Grand"),
            },
            {
              id_taille: idTailleUnique._id,
              qty: formulaire.get("qty_Unique"),
            },
          ],
        });

        // Sauvegarder les modifications (du nouveau produit)
        await nouveauProduit.save();

        res.json({ status: "ok" });
        return;
      }
    });

    req.pipe(bb);
  } catch (erreur) {
    if (!erreur.statusCode) {
      erreur.statusCode = 500;
    }
    next(erreur);
  }
};

exports.modifierProduitSansImage = async (req, res, next) => {
  try {
    const reqBody = req.body;
    let mapReqBody = new Map(); // Map c'est la meme chose qu'un objet, mais tu peux pas avoir de doublons

    const idProduit = req.body.ancienIdProduit;
    let ancienProduit;
    let nouveauProduit;

    let tailles;
    let categories;
    const sexes = ["h", "f", "u"];

    let idCategorie;
    let idTaillePetit;
    let idTailleMoyen;
    let idTailleGrand;
    let idTailleUnique;
    let est_discontinue;

    // Verifier id
    if (!valider_id.valider(idProduit)) {
      res.status(400).json({ erreurs: "Identifiant non valide." });
      return;
    }

    // Verifier que le produit existe
    ancienProduit = await Produit.findOne({ _id: idProduit });
    if (ancienProduit === null) {
      res.status(400).json({ erreurs: "Aucun produit avec cet identifiant." });
      return;
    }

    // Valider infos
    delete reqBody["image_produit"];
    mapReqBody = new Map(Object.entries(reqBody)); // transformation en Map() car 'validerProduit' doit avoir comme premier argument de type 'Map'

    categories = await Categorie.find({});
    tailles = await Taille.find({});

    const err = valider_produit.validerProduit(
      mapReqBody,
      categories,
      sexes,
      tailles
    );

    if (err) {
      res.status(400).json({ erreurs: err });
      return;
    }

    // Modifier produit
    // Trouver id de la categorie
    idCategorie = await trouverIdCategorie.trouverIdCategorie(
      mapReqBody.get("categorie")
    );

    // Trouver id des tailles
    [idTaillePetit, idTailleMoyen, idTailleGrand, idTailleUnique] =
      await trouverIdTailles.trouverIdTailles();

    // Determiner champ est_discontinue
    if (mapReqBody.get("est_discontinue") === "on") {
      est_discontinue = true;
    } else {
      est_discontinue = false;
    }

    // Supprmier ancien produit
    await Produit.deleteOne({
      _id: idProduit,
    });

    // Modifier produit (ajouter meme produit avec de nouvelles modifications)
    nouveauProduit = await new Produit({
      _id: idProduit, // Garder le meme id qu'avant
      id_categorie: idCategorie,
      nom: mapReqBody.get("nom"),
      desc: mapReqBody.get("description"),
      prix: mapReqBody.get("prix"),
      image: ancienProduit.image,
      sexe: mapReqBody.get("sexe"),
      est_discontinue: est_discontinue,
      tailles: [
        {
          id_taille: idTaillePetit._id,
          qty: mapReqBody.get("qty_Petit"),
        },
        {
          id_taille: idTailleMoyen._id,
          qty: mapReqBody.get("qty_Moyen"),
        },
        {
          id_taille: idTailleGrand._id,
          qty: mapReqBody.get("qty_Grand"),
        },
        {
          id_taille: idTailleUnique._id,
          qty: mapReqBody.get("qty_Unique"),
        },
      ],
    });

    // Sauvegarder les modifications (du nouveau produit)
    await nouveauProduit.save();

    res.json({ status: "ok" });
  } catch (erreur) {
    if (!erreur.statusCode) {
      erreur.statusCode = 500;
    }
    next(erreur);
  }
};

exports.discontinuerProduit = async (req, res, next) => {
  try {
    const idArticleADiscontinuer = req.body.id_article;
    let produit;

    // Faire la validation de l'identifiant
    if (!valider_id.valider(idArticleADiscontinuer)) {
      res
        .status(400)
        .json({ erreurs: "Identifiant du produit à discontinuer invalide." });
      return;
    }

    // Valider si un produit avec cette id existe
    produit = await Produit.findOne({ _id: idArticleADiscontinuer });
    if (produit === null) {
      res.status(400).json({
        erreurs: "Aucun produit avec cet identifiant à discontinuer.",
      });
      return;
    }

    // Discontinuer produit
    await Produit.findOneAndUpdate(
      { _id: idArticleADiscontinuer },
      {
        $set: { est_discontinue: true },
      }
    );

    res.json({ status: "ok" });
  } catch (erreur) {
    res.status(500).json({ erreurs: erreur });
  }
};

exports.getProduitsDiscontinues = async (req, res, next) => {
  Produit.find({ est_discontinue: true })
    .then((produits) => {
      res.render("discontinuer/produits_discontinues", {
        titre_page: "UpNorth - Tout les produits dicontinués",
        produits: produits,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getProduitDiscontinue = async (req, res, next) => {
  try {
    let produit;
    let categorie;
    const tailles = await Taille.find({});
    const produitId = req.params.produitId;

    // Faire la validation de l'id du produit
    if (!valider_id.valider(produitId)) {
      const erreur = Error();
      erreur.message = `Identifiant "${produitId}" du produit invalide.`;
      erreur.status = 404;
      throw erreur;
    }

    produit = await Produit.findOne({ _id: produitId, est_discontinue: true });

    // Validation si aucun produit n'est trouve avec cette id
    if (!produit) {
      const erreur = Error();
      erreur.message = "Produit non existant.";
      erreur.status = 404;
      throw erreur;
    }

    categorie = await Categorie.findById({ _id: produit.id_categorie });

    res.render("discontinuer/details_produit_discontinue", {
      titre_page: "Upnorth - Produit " + produit.nom,
      produit: produit,
      categorie: categorie,
      tailles: tailles,
      url_remettre_en_stock: `/discontinues/${produit._id}/RemettreEnStock`,
    });
  } catch (erreur) {
    if (!erreur.statusCode) {
      erreur.statusCode = 500;
    }
    next(erreur);
  }
};

exports.remettreProduitEnStock = async (req, res, next) => {
  try {
    const produitId = req.params.produitId;
    let produit;

    // Valider produitId
    if (!valider_id.valider(produitId)) {
      res
        .status(400)
        .json({ erreurs: "Identifiant du produit à discontinuer invalide." });
      return;
    }

    // Trouver produit
    produit = await Produit.findOne({ _id: produitId });

    // Valider si produit trouvé
    if (produit === null) {
      res.status(400).json({ erreurs: "Aucun produit avec cet identifiant." });
      return;
    }

    // Remettre en stock (est_discontinue=true)
    await Produit.findOneAndUpdate(
      {
        _id: produitId,
      },
      { $set: { est_discontinue: false } }
    );

    res.json({ status: "ok" });
  } catch (erreur) {
    res.status(500).json({ erreurs: erreur });
  }
};
