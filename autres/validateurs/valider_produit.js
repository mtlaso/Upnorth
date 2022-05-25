const validator = require("validator");
const {
  MAX_LENGTH_NOM_PRODUIT,
  MAX_LENGTH_DESCRIPTION_PRODUIT,
  VALEUR_MAX_PRIX_PRODUIT,
  VALEUR_MAX_QTY_PRODUITS,
} = require("../infos");

/* Valider un ajout de produit / modification produit */
exports.validerProduit = (produit, lst_categories, lst_sexes, lst_tailles) => {
  // Validation de l'image dans le controlleur
  // Aucune validation pour le champ est_discontinue

  const erreurs = {
    nom: null,
    description: null,
    prix: null,
    categorie: null,
    image: null,
    sexe: null,
    est_discontinue: null,
    qty_Petit: null,
    qty_Moyen: null,
    qty_Grand: null,
    qty_Unique: null,
  };

  let erreurTrouvee = false;

  const nom = produit.get("nom").trim();
  if (!nom || nom.length > MAX_LENGTH_NOM_PRODUIT) {
    erreurs.nom = {
      erreur: `Le nom du produit doit avoir moins de ${MAX_LENGTH_NOM_PRODUIT} charactères.`,
    };
    erreurTrouvee = true;
  }

  const description = produit.get("description").trim();
  if (!description || description.length > MAX_LENGTH_DESCRIPTION_PRODUIT) {
    erreurs.description = {
      erreur: `La description du produit doit avoir moins de ${MAX_LENGTH_DESCRIPTION_PRODUIT} charactères.`,
    };
    erreurTrouvee = true;
  }

  const prix = produit.get("prix");
  if (!prix || isNaN(Number(prix)) || prix > VALEUR_MAX_PRIX_PRODUIT) {
    erreurs.prix = {
      erreur: `Le prix doit être numérique et doit être plus petit que ${VALEUR_MAX_PRIX_PRODUIT}.`,
    };
    erreurTrouvee = true;
  }

  const categorie = produit.get("categorie");
  if (!categorie) {
    erreurs.categorie = {
      erreur: `Catégorie non valide.`,
    };
    erreurTrouvee = true;
  }

  let categorieTrouve = false;
  lst_categories.forEach((element) => {
    if (element.nom === categorie) {
      categorieTrouve = true;
    }
  });

  if (categorie === false) {
    erreurs.categorie = {
      erreur: `Catégorie non valide.`,
    };
    erreurTrouvee = true;
  }

  const sexe = produit.get("sexe");
  if (!sexe || lst_sexes.includes(sexe) === false) {
    erreurs.sexe = {
      erreur: `Sexe non valide.`,
    };
    erreurTrouvee = true;
  }

  const qty_Petit = produit.get("qty_Petit");
  if (
    !qty_Petit ||
    isNaN(Number(qty_Petit)) ||
    qty_Petit > VALEUR_MAX_QTY_PRODUITS
  ) {
    erreurs.qty_Petit = {
      erreur: `La quantité de la taille "Petit" doit être numérique et doit être plus petit que ${VALEUR_MAX_QTY_PRODUITS}.`,
    };
    erreurTrouvee = true;
  }

  const qty_Moyen = produit.get("qty_Moyen");
  if (
    !qty_Moyen ||
    isNaN(Number(qty_Moyen)) ||
    qty_Moyen > VALEUR_MAX_QTY_PRODUITS
  ) {
    erreurs.qty_Moyen = {
      erreur: `La quantité de la taille "Moyen" doit être numérique et doit être plus petit que ${VALEUR_MAX_QTY_PRODUITS}.`,
    };
    erreurTrouvee = true;
  }

  const qty_Grand = produit.get("qty_Grand");
  if (
    !qty_Grand ||
    isNaN(Number(qty_Grand)) ||
    qty_Grand > VALEUR_MAX_QTY_PRODUITS
  ) {
    erreurs.qty_Grand = {
      erreur: `La quantité de la taille "Grand" doit être numérique et doit être plus petit que ${VALEUR_MAX_QTY_PRODUITS}.`,
    };
    erreurTrouvee = true;
  }

  const qty_Unique = produit.get("qty_Unique");
  if (
    !qty_Unique ||
    isNaN(Number(qty_Unique)) ||
    qty_Unique > VALEUR_MAX_QTY_PRODUITS
  ) {
    erreurs.qty_Unique = {
      erreur: `La quantité de la taille "Unique" doit être numérique et doit être plus petit que ${VALEUR_MAX_QTY_PRODUITS}.`,
    };
    erreurTrouvee = true;
  }

  if (erreurTrouvee) {
    return erreurs;
  } else {
    return false;
  }
};

/* Valider l'image d'un produit */
exports.validerImage = (info) => {
  // Valider que c'est une image (https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types)
  const mimeTypesAcceptes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/svg+xml",
    "image/avif",
  ];

  const erreurs = {
    image: null,
  };

  let erreurTrouvee = false;

  if (!mimeTypesAcceptes.includes(info.mimeType)) {
    erreurs.image = {
      erreur: "L'image doit être de type png, jpeg, jpg, svg, gif ou avif.",
    };
    erreurTrouvee = true;
  }

  if (erreurTrouvee) {
    return erreurs;
  } else {
    return false;
  }
};
