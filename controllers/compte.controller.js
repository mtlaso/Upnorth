"use strict";

const Utilisateur = require("../schemas/utilisateur");
const Produit = require("../schemas/produits");
const Taille = require("../schemas/taille");
const Categorie = require("../schemas/categorie");
const Panier = require("../schemas/panier");
const Commande = require("../schemas/commande");

const trouverIdCategorie = require("../autres/trouverIdCategories");
const trouverIdTailles = require("../autres/trouverIdTailles");

const valider_email_mdpOublie = require("../autres/validateurs/valider_email_mdpOublie");
const valider_utilisateur = require("../autres/validateurs/valider_utilisateur");
const valider_produit = require("../autres/validateurs/valider_produit");
const valider_mdp = require("../autres/validateurs/valider_mdp");
const valider_id = require("../autres/validateurs/valider_id");
const valider_panier = require("../autres/validateurs/valider_panier");
const infosImages = require("../autres/infosImage");

const envoyerEmail = require("../autres/amazon-ses/envoyerEmail");
const random = require("../autres/random");

const busboy = require("busboy");
const bcrypt = require("bcryptjs");
const url = require("url");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { decodedJwtToken } = require("../autres/jwt/decoderJwtToken");

dotenv.config();

exports.getConnexion = (req, res, next) => {
  if (req.session.jwtToken) {
    res.redirect("/profil");
    return;
  }

  const compteCree = req.query.compte_cree; ///connexion?compte_cree=true, redirection de /inscription

  res.render("connexion", {
    erreur: null,
    titre_page: "UpNorth - Connexion",
    compteCree: compteCree,
  });
};

exports.postConnexion = async (req, res, next) => {
  try {
    const email = req.body.courriel;
    const mdp = req.body.mdp;
    let utilisateur;

    // Trouver utlisateur
    utilisateur = await Utilisateur.findOne({ email: email });
    if (!utilisateur) {
      res.status(400).render("connexion", {
        erreur: "Erreur avec le courriel et/ou mot de passe.",
        url_inscription: "/inscription",
        titre_page: "UpNorth - Inscription",
        succes: false,
        compteCree: false,
      });
      return;
    }

    // Comparer mdp fourni vs mdp dans la base de donnée
    const comparaison = await bcrypt.compare(mdp, utilisateur.pwd);
    if (!comparaison) {
      res.status(400).render("connexion", {
        erreur: "Erreur avec le courriel et/ou mot de passe.",
        url_inscription: "/inscription",
        titre_page: "UpNorth - Inscription",
        succes: false,
        compteCree: false,
      });
      return;
    }

    jwt.sign(
      {
        email: utilisateur.email,
      },
      process.env.SECRET_JWT,
      { expiresIn: "1h" },
      async (err, jwt) => {
        if (err) {
          const error = new Error("Erreur avec jwt: " + err);
          throw error;
        }

        res.header("Authorization", `Bearer ${jwt}`);

        /* Il est nécessaire de sauvagarder le jwt dans un cookie pour qu'il soit
        envoyé à chaque requête depuis le navigateur.
        */
        req.session.jwtToken = jwt;
        res.redirect("/profil");
      }
    );
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

exports.getInscription = (req, res, next) => {
  res.render("inscription", {
    url_inscription: "/inscription",
    erreur: null,
    titre_page: "UpNorth - Inscription",
    succes: false,
  });
};

exports.postInscription = async (req, res, next) => {
  try {
    // Verifier qu'aucun utilisateur existe avec cette ce courriel
    let usr = await Utilisateur.find({ email: req.body.courriel });
    if (usr.length > 0) {
      res.status(400).render("inscription", {
        url_inscription: "/inscription",
        erreur: {
          util_existant: "Un utilisateur avec ce courriel existe déja.",
        },
        titre_page: "UpNorth - Inscription",
        succes: false,
      });
      return;
    }
    // Creer le compte
    usr = new Utilisateur({
      email: req.body.courriel.trim(),
      nom: req.body.nom.trim(),
      pwd: req.body.mdp.trim(),
      adresse: req.body.adresse.trim(),
      tel: req.body.tel.trim(),
      age: req.body.age.trim(),
      est_admin: false,
      email_confirmer: false,
      commandes: [],
    });

    // Créer le panier
    const panier = await new Panier({
      id_utilisateur: usr._id,
    });
    panier.save();

    // Verifier informations
    const err = valider_utilisateur.validerInscription(usr);
    if (err) {
      res.status(400).render("inscription", {
        url_inscription: "/inscription",
        erreur: err,
        titre_page: "UpNorth - Inscription",
        succes: false,
      });
      return;
    }

    // Hasher mot de passe (le salt est directement enregistré dans le mot de passe)
    const salt = await bcrypt.genSalt(10);
    const pwd = await bcrypt.hash(usr.pwd, salt);
    usr.pwd = pwd;

    // Envoyer email de confirmation
    const params = envoyerEmail.initEmailConfirmation(usr.email, usr._id);
    await envoyerEmail.envoyerEmailConfirmation(params);

    // Aucune erreur, creer utlisateur dans la db
    usr = await Utilisateur.insertMany([usr]);

    res.redirect("/connexion?compte_cree=true");
    // res.render("inscription", {
    //   url_inscription: "/inscription",
    //   erreur: null,
    //   titre_page: "UpNorth - Inscription",
    //   succes: true,
    // });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    console.log("iciciic", err);
    next(err);
  }
};

exports.getMdpOublie = (req, res, next) => {
  res.render("mdp_oublie", {
    titre_page: "UpNorth - Mot de passe oublié",
    succes: null,
    erreurs: null,
  });
};

exports.postMdpOublie = async (req, res, next) => {
  try {
    const email = req.body.email;
    const tel = req.body.tel;

    let token;
    let utilisateur;

    // Verifier email
    const err = valider_email_mdpOublie.validerEmailMdpOublie(email, tel);
    if (err) {
      res.status(400).render("mdp_oublie", {
        titre_page: "UpNorth - Mot de passe oublié",
        succes: null,
        erreurs: err,
      });
      return;
    }

    // Verifier que email existe dans systeme
    utilisateur = await Utilisateur.findOne({ email: email });

    if (utilisateur === null) {
      // NE PAS METTRE STATUS 400 ou 40X
      res.render("mdp_oublie", {
        titre_page: "UpNorth - Mot de passe oublié",
        succes: null,
        erreurs: { utilisateur_introuvable: true },
      });
      return;
    }

    // Verifier que l'utilisateur a le bon tel
    if (tel !== utilisateur.tel) {
      // NE PAS METTRE STATUS 400 ou 40X
      res.render("mdp_oublie", {
        titre_page: "UpNorth - Mot de passe oublié",
        succes: null,
        erreurs: { utilisateur_introuvable: true },
      });
      return;
    }

    // Générer token récupération (token utilisé pour vérifier validité)
    token = await random.random();

    // Générer token jwt
    const a = jwt.sign(
      {
        email: utilisateur.email,
        token: token,
      },
      process.env.SECRET_JWT,
      {
        expiresIn: "900000", // 1000ms * 60 = 1 minutes * 15 (15 minutes)
      },
      async (err, jwt) => {
        if (err) {
          const error = new Error("Erreur avec jwt: " + err);
          throw error;
        }

        // Enregistrer token recuperation dans la bd
        await Utilisateur.findOneAndUpdate(
          { _id: utilisateur._id },
          {
            $set: { code_recuperation: jwt },
          }
        );

        // Envoyer email de recuperation de mot de passe
        const params = envoyerEmail.initEmailRecuperation(
          utilisateur.email,
          jwt
        );

        await envoyerEmail.envoyerEmailRecuperation(params);

        res.render("mdp_oublie", {
          titre_page: "UpNorth - Mot de passe oublié",
          succes: true,
          erreurs: null,
        });
        return;
      }
    );
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

exports.getValiderMdpOublie = async (req, res, next) => {
  try {
    let utilisateur;
    let token = req.params.token;
    let userToken;

    // Déchiffrer token jwt
    token = await decodedJwtToken(token);

    utilisateur = await Utilisateur.findOne({ email: token.email });

    if (utilisateur === null) {
      throw new Error();
    }

    // Dechifrer token jwt de l'utilisateur
    userToken = await decodedJwtToken(utilisateur.code_recuperation);

    // Verifier code de recuperation
    if (token.token !== userToken.token || token.email !== utilisateur.email) {
      const err = new Error();
      err.message = "Utilisateur introuvable";
      throw err;
    }

    res.render("changer_mdp", {
      titre_page: "UpNorth - Changer mot de passe",
      token: req.params.token,
      erreurs: null,
      succes: null,
    });
  } catch (err) {
    // car await decodedJwtToken() retourne "false" en cas d'erreur
    if (err === false) {
      err = new Error();
      err.message = "Code JWT invalide.";
    }

    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

exports.postChangerMdp = async (req, res, next) => {
  try {
    const mdp = req.body.mdp;
    let token = req.body.token;

    let utilisateur;
    let userToken;

    let nvMdpHash;

    if (!token) {
      res.redirect("/login");
    }

    // Valider token jwt
    token = await decodedJwtToken(token);

    // Valider nouveau mot de passe
    const err = valider_mdp.validerMdp(mdp);

    if (err) {
      res.status(400).json({ erreurs: err });
      return;
    }

    // Trouver utilisateur dans bd
    utilisateur = await Utilisateur.findOne({ email: token.email });

    if (utilisateur === null) {
      // Utilisateur introuvable
      res.status(400).json({ erreurs: "Une erreur s'est produite." });
      return;
    }

    // Dechifrer token jwt de l'utilisateur
    userToken = await decodedJwtToken(utilisateur.code_recuperation);

    // Verifier code de recuperation
    if (token.token !== userToken.token || token.email !== utilisateur.email) {
      // token recuperation et/ou email ne correspondent pas
      res.status(400).json({ erreurs: "Une erreur s'est produite." });
      return;
    }

    // Hasher mot de passe (le salt est directement enregistré dans le mot de passe)
    const salt = await bcrypt.genSalt(10);
    nvMdpHash = await bcrypt.hash(mdp, salt);

    // Changer mot de passe
    await Utilisateur.findOneAndUpdate(
      { _id: utilisateur._id },
      {
        $set: { pwd: nvMdpHash },
      }
    );

    res.json({ status: "ok" });
  } catch (err) {
    // car await decodedJwtToken() retourne "false" en cas d'erreur
    if (err === false) {
      err = new Error();
      err.message = "Code JWT invalide.";
    }

    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

exports.getProfil = async (req, res, next) => {
  try {
    // Retrouver utilisateur
    const usr = await Utilisateur.find({ email: req.user.email });

    if (usr.length <= 0) {
      const err = new Error("Utilisateur introuvable.");
      throw err;
    }

    const url_modifier = url.format({
      protocol: req.protocol,
      host: req.hostname,
      pathname: req.originalUrl,
    });

    res.render("profil", {
      titre_page: "UpNorth - Profil",
      utilisateur: usr[0],
      url_modifier: "/profil",
      erreur: null,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

exports.postProfil = async (req, res, next) => {
  try {
    // Trouver ancien utilisateur
    const ancienUtilisateur = await Utilisateur.find({
      email: req.user.email,
    });

    const nouveauxChangments = {
      email: req.body.courriel.trim(),
      nom: req.body.nom.trim(),
      pwd: null,
      adresse: req.body.adresse.trim(),
      tel: req.body.tel.trim(),
      age: req.body.age.trim(),
    };

    // Si nouvel utilisateur à choisi un nouveau mot de passe
    let err;
    if (req.body.mdp.length > 0) {
      nouveauxChangments.pwd = req.body.mdp;
      err = valider_utilisateur.validerChangements(nouveauxChangments, false);
    } else {
      nouveauxChangments.pwd = ancienUtilisateur[0].pwd;

      /* Il est important de ne pas valider de nouveau le mot de passe si l'utilisateur
      décide de garder le même mot de passe. */
      err = valider_utilisateur.validerChangements(nouveauxChangments, true);
    }

    if (err) {
      res.status(400).json({ erreurs: err });
      return;
    }

    // Hasher nouveau pwd si il y en a un (le salt est directement enregistré dans le mot de passe)
    if (req.body.mdp.length > 0) {
      const salt = await bcrypt.genSalt(10);
      const pwd = await bcrypt.hash(nouveauxChangments.pwd, salt);
      nouveauxChangments.pwd = pwd;
    }

    // Sauvegarder nouveaux changements
    await Utilisateur.updateOne(
      { email: ancienUtilisateur[0].email },
      {
        email: nouveauxChangments.email,
        nom: nouveauxChangments.nom,
        pwd: nouveauxChangments.pwd,
        adresse: nouveauxChangments.adresse,
        tel: nouveauxChangments.tel,
        age: nouveauxChangments.age,
      }
    );

    res.status(300).json({ status: "ok" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

exports.getProfilAdmin = async (req, res, next) => {
  try {
    const usr = await Utilisateur.findOne({ email: req.user.email });
    const tailles = await Taille.find({});
    const categories = await Categorie.find({});

    res.render("profil_admin", {
      utilisateur: usr,
      titre_page: "UpNorth - Profil administrateur",
      url_ajouter: "/profil/admin/ajouter",
      url_modifier: "/profil/admin/modifier",
      url_supprimeer: "/profil/admin/supprimer",
      tailles: tailles,
      categories: categories,
      erreur: null,
      success: null,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

exports.postAjouterProduitAdmin = async (req, res, next) => {
  try {
    const tailles = await Taille.find({});
    const categories = await Categorie.find({});
    const sexes = ["h", "f", "u"];

    let formulaire = new Map(); // Map c'est la meme chose qu'un objet, mais tu peux pas avoir de doublons
    let produit;

    let idCategorie;
    let idTaillePetit;
    let idTailleMoyen;
    let idTailleGrand;
    let idTailleUnique;

    let cheminAbsolu;
    let nomImage;

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
        res.json({ erreurs: err });
      } else {
        [cheminAbsolu, nomImage] = await infosImages.nomImage(info.mimeType);
        file.pipe(fs.createWriteStream(cheminAbsolu));
      }
    });

    bb.on("filesLimit", () => {
      // filesLimit() - Emitted when the configured limits.files limit has been reached. No more 'file' events will be emitted.
      res.json({
        erreurs: { image: "Seulement une image peut être téléchargée." },
      });
    });

    bb.on("field", (name, value, info) => {
      formulaire.set(name, value);
    });

    bb.on("error", (err) => {
      console.log("error", err);
      throw err;
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

        // Ajouter produit
        produit = await new Produit({
          id_categorie: idCategorie,
          nom: formulaire.get("nom").trim(),
          desc: formulaire.get("description").trim(),
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

        // Sauvegarder produit
        await produit.save();

        res.json({ status: "ok" });
        return;
      }
    });

    bb.on("close", () => {
      console.log("closed");
    });

    req.pipe(bb);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

exports.confirmerEmail = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    let utilisateur;

    // Valider id utilisateur
    if (!valider_id.valider(userId)) {
      const err = new Error("Identifiant invalide.");
      err.statusCode = 400;
      throw err;
    }

    // Verifier si utilisateur existe
    utilisateur = await Utilisateur.findOne({ _id: userId });
    if (utilisateur === null) {
      const err = new Error("Utilisateur introuvable.");
      err.statusCode = 404;
      throw err;
    }

    // Confirmer email
    await Utilisateur.findOneAndUpdate(
      { _id: userId },
      {
        $set: { email_confirmer: true },
      }
    );

    res.render("confirmations/email_confirmer", {
      titre_page: "UpNorth - Confirmer email",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPanier = async (req, res, next) => {
  try {
    let lst_produits = [];
    let total = 0;
    let nbArticle = 0;
    let user;

    // Obtention des informations
    const decodedJwtToken = jwt.decode(req.session.jwtToken);
    const userEmail = decodedJwtToken.email;

    // Trouver utilisateur
    user = await Utilisateur.findOne({
      email: userEmail,
    });

    // Verifier si email est confirmé
    if (!user.email_confirmer) {
      res.render("panier/panier", {
        panier: null,
        produits: null,
        adresse: null,
        total: null,
        titre_page: "UpNorth - Mon panier",
      });
      return;
    }

    // Trouver panier (email confirmé).
    let panier = await Panier.findOne({
      id_utilisateur: user._id,
    });

    // Creer panier si il n'existe pas
    if (panier === null) {
      panier = await new Panier({
        id_utilisateur: user._id,
      });
      panier.save();
    }

    if (panier.produits === null) {
      res.render("panier", {
        panier: lst_produits,
        produits: lst_produits,
        adresse: user.adresse,
        nbArticle: nbArticle,
        total: total,
        titre_page: "UpNorth - Mon panier",
      });
      return;
    }

    // Trouver tous les élments du panier
    for (let i = 0; i < panier.produits.length; i++) {
      const produit = await Produit.findOne({
        _id: panier.produits[i].id_produit,
      });

      lst_produits.push(produit);
      total += produit.prix * panier.produits[i].qty;
      nbArticle += panier.produits[i].qty;
    }

    res.render("panier/panier", {
      panier: panier.produits,
      produits: lst_produits,
      adresse: user.adresse,
      nbArticle: nbArticle,
      total: total,
      titre_page: "UpNorth - Mon panier",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postPanier = async (req, res, next) => {
  try {
    // Obtention des informations.
    const articleId = req.params.articleId; // produit à ajouter
    const tailleArticle = req.body.tailles;

    const decodedJwtToken = jwt.decode(req.session.jwtToken);
    const userEmail = decodedJwtToken.email;

    let user;
    let panier;
    let indiceTaille;

    let articleAjouter;
    let tailleId;

    articleAjouter = await Produit.findById({ _id: articleId });
    if (!articleAjouter) {
      throw new Error("Produit à ajouter introuvable.");
    }

    console.log("articleAjouter : ", articleAjouter);

    tailleId = await Taille.findOne({ nom: tailleArticle });
    if (!tailleId) {
      throw new Error("Taille introuvable.");
    }

    // Trouver indice de la taille
    for (let i = 0; i < articleAjouter.tailles.length; i++) {
      const taille = articleAjouter.tailles[i];
      if (taille.id_taille.equals(tailleId._id)) {
        indiceTaille = i;
        break;
      }
    }

    // Obtention de l'utilisateur.
    user = await Utilisateur.findOne({ email: userEmail });
    if (user.email_confirmer) {
      // Obtention du panier avec l'id de l'utilisateur.
      panier = await Panier.findOne({ id_utilisateur: user._id });

      if (!panier) {
        throw new Error("Panier introuvable");
      }

      console.log("Panier trouvé : ", panier);

      let produits = panier.produits;
      let produitDansPanier = false;

      // Vérifier si un produit avec la même taille est présent dans le panier
      // Si oui, incrémenter la quantité du produit dans le panier (limite de 10), et réduire la quantité en stock de 1 (vérifier quantité du produit en stock)
      // Si non, l'ajouter dans le panier (vérifier quantité du produit en stock), et réduire la quantité en stock de 1 (vérifier quantité du produit en stock)
      // produits.find(), plus lisible qu'une boucle : developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
      console.log("Début de la recherche...");

      produits.find((produit) => {
        if (
          produit.id_produit.equals(articleId) &&
          produit.taille === tailleArticle
        ) {
          if (
            produit.qty < 10 &&
            articleAjouter.tailles[indiceTaille].qty > 0
          ) {
            console.log("Produit est déja dans le panier...");
            // Incrémenter la quantité de ce produit dans le panier
            produit.qty++;
            panier.save();

            // Réduire la quantité en stock de 1
            articleAjouter.tailles[indiceTaille].qty--;
            articleAjouter.save();
          }
          produitDansPanier = true;
        }
      });

      console.log("Produit est dans le panier : ", produitDansPanier);

      if (
        produitDansPanier === false &&
        articleAjouter.tailles[indiceTaille].qty > 0
      ) {
        console.log("Le produit n'est pas dans le panier, ajout...");

        // Ajouter produit dans panier
        produits.push({
          id_produit: articleId,
          taille: tailleArticle,
          qty: 1,
        });
        panier.save();

        // Réduire la quantité en stock de 1
        articleAjouter.tailles[indiceTaille].qty--;
        articleAjouter.save();
      }

      res.redirect("/produits/" + articleId + "/ajouter=true");
    } else {
      res.render("panier/panier", {
        panier: null,
        produits: null,
        adresse: null,
        total: null,
        titre_page: "UpNorth - Mon panier",
      });
    }
  } catch (erreur) {
    if (!erreur.statusCode) {
      erreur.statusCode = 500;
    }
    next(erreur);
  }
};

exports.postChangerQtyPanier = async (req, res, next) => {
  try {
    const idProduitDansPanier = req.body.idProduit; // id produit dans le panier, ce n'est pas l'id du produit en soit
    const qtyProduit = req.body.qtyProduit;

    let decodedJwtToken;
    let utilisateur;
    let panier;
    let produitDansPanier = false;

    // Valider idProduit
    if (!valider_id.valider(idProduitDansPanier)) {
      res.status(400).json({ erreurs: "Id du produit invalide." });
      return;
    }

    // Valider qtyProduit (que c'est un nombre, entre 0 et 10 inclus)
    const err = valider_panier.validerQty(qtyProduit);
    if (err) {
      res.status(400).json({ erreurs: err });
      return;
    }

    // Decoder jwt token
    decodedJwtToken = jwt.decode(req.session.jwtToken);
    if (!decodedJwtToken) {
      res.status(400).json({ erreurs: "Jwt token invalide." });
      return;
    }

    // Trouver utilisateur
    utilisateur = await Utilisateur.findOne({ email: decodedJwtToken.email });
    if (!utilisateur) {
      res.status(400).json({ erreurs: "Utilisateur introuvable." });
      return;
    }

    // Trouver son panier
    panier = await Panier.findOne({ id_utilisateur: utilisateur._id });
    if (!panier) {
      res.status(400).json({ erreurs: "Panier introuvable." });
      return;
    }

    // Valider idProduit dans son panier
    for (let i = 0; i < panier.produits.length; i++) {
      const produit = panier.produits[i];

      if (produit._id.equals(idProduitDansPanier)) {
        produitDansPanier = produit;
      }
    }

    if (!produitDansPanier) {
      res.status(400).json({ erreurs: "Produit n'est pas dans le panier." });
      return;
    }

    // Changer qty (si qty === 0, retirer produit du panier)
    if (Number(qtyProduit) === 0) {
      await ChangerQtyEtChangerStock(
        panier,
        idProduitDansPanier,
        produitDansPanier
      );
    } else {
      const taille = await Taille.findOne({ nom: produitDansPanier.taille });

      // Permet de trouver la quantité de produit qu'il faut ajouter ou retirer pour arriver au nombres de produits voulus par l'utilisateur
      // qtyProduit : Nombres de produits que l'utilisateur veut dans son panier
      // produitDansPanier.qty : Nombres de produits que l'utilisateur a déja dans son panier, avant tous changement (au moins 1)
      if (qtyProduit > produitDansPanier.qty) {
        const nbProduitARetirer = qtyProduit - produitDansPanier.qty;
        console.log(
          "Retirer des produits du stock :",
          Number(-nbProduitARetirer)
        );

        // Retirer des produits du stock
        await Produit.findOneAndUpdate(
          {
            _id: produitDansPanier.id_produit,
            "tailles.id_taille": taille._id,
          },
          {
            $inc: { "tailles.$.qty": Number(-nbProduitARetirer) },
          }
        );
      } else if (qtyProduit < produitDansPanier.qty) {
        const nbProduitARetirer = produitDansPanier.qty - qtyProduit;
        console.log(
          "Ajouter des produits au stock :",
          Number(Math.abs(nbProduitARetirer))
        );

        // Ajouter des produits du stock
        await Produit.findOneAndUpdate(
          {
            _id: produitDansPanier.id_produit,
            "tailles.id_taille": taille._id,
          },
          {
            $inc: { "tailles.$.qty": Number(Math.abs(nbProduitARetirer)) },
          }
        );
      }

      // Changer quantité dans le panier
      await Panier.findOneAndUpdate(
        { _id: panier._id, "produits._id": idProduitDansPanier },
        {
          $set: { "produits.$.qty": qtyProduit },
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

exports.deletePanier = async (req, res, next) => {
  try {
    // Obtention des informations.
    const decodedJwtToken = jwt.decode(req.session.jwtToken);
    const userEmail = decodedJwtToken.email;
    const articleId = req.params.articleId;

    // Obtention de l'utilisateur par son courriel.
    const user = await Utilisateur.findOne({
      email: userEmail,
    });

    Panier.findOne({ id_utilisateur: user._id }).then(async (panier) => {
      let produits = panier.produits;

      for (let i = 0; i < produits.length; i++) {
        if (produits[i]._id.equals(articleId)) {
          // Changer la quantité en stock (ajouter qty du produit panier dans le stock)
          const taille = await Taille.findOne({ nom: produits[i].taille });
          await Produit.findOneAndUpdate(
            { _id: produits[i].id_produit, "tailles.id_taille": taille._id },
            {
              $inc: { "tailles.$.qty": Number(Math.abs(produits[i].qty)) },
            }
          );

          // Supprimer panier
          produits.splice(i, 1);
          panier.save();

          break;
        }
      }

      res.redirect("/profil/panier");
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getDeconnexion = (req, res, next) => {
  res.header("Authorization", `Bearer ${null}`);
  req.session.jwtToken = null;

  req.session.destroy();

  res.redirect("/connexion");
};

exports.getCommandes = async (req, res, next) => {
  try {
    // Obtention des informations.
    const decodedJwtToken = jwt.decode(req.session.jwtToken);
    const userEmail = decodedJwtToken.email;

    // Obtention de l'utilisateur par son courriel.
    const user = await Utilisateur.findOne({
    email: userEmail,
    });

    const commandes = await Commande.find().where('_id').in(user.commandes).exec();
    for (let i=0; i < commandes.length; i++) {
      let nbArticle = 0;
      for (let j=0; j < commandes[i].produits.length; j++) {
        nbArticle+=commandes[i].produits[j].qty;
      }
      commandes[i].nbArticle = nbArticle;

      let date = new Date(commandes[i].createdAt);
      date = date.toDateString();
      commandes[i].date = date;
    }

    res.render("commandes/historique_commandes", {
    titre_page: "UpNorth - Historique de commande",
    commandes: commandes
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    } next(err);
  }
};

exports.getCommande = async (req, res, next) => {
try {
  const commandeId = req.params.commandeId;

  const commande = await Commande.findById(commandeId);
  console.log(commande);

  let date = new Date(commande.createdAt);
  date = date.toDateString();

  res.render("commandes/details_commande", {
    titre_page: "UpNorth - Détails d'une commande",
    commande: commande,
    date: date
  });
} catch (err) {
  if (!err.statusCode) {
    err.statusCode = 500;
  } next(err);
}
  
};

/**
 * Appelé quand un utilisateur met 0 dans le champs 'qtyProduit'
 * @param {*} panier
 * @param {*} idProduitDansPanier
 * @param {*} produitDansPanier
 */
async function ChangerQtyEtChangerStock(
  panier,
  idProduitDansPanier,
  produitDansPanier
) {
  try {
    // Retirer produit du panier
    await Panier.findOneAndUpdate(
      { _id: panier._id },
      {
        $pull: { produits: { _id: idProduitDansPanier } },
      }
    );

    const taille = await Taille.findOne({ nom: produitDansPanier.taille });
    const ancienneQty = produitDansPanier.qty;

    // Incrémenter la quantité en stock (+1)
    await Produit.findOneAndUpdate(
      { _id: produitDansPanier.id_produit, "tailles.id_taille": taille._id },
      {
        $inc: { "tailles.$.qty": ancienneQty },
      }
    );
  } catch (erreur) {
    throw erreur;
  }
}