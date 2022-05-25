const validator = require("validator");
const { MAX_QTY_PANIER, MIN_QTY_PANIER } = require("../infos");

/* Valider qty / modification panier qty */
exports.validerQty = (qty) => {
  const erreurs = {
    qty: null,
  };

  let erreurTrouvee = false;

  if (
    !qty ||
    isNaN(Number(qty)) ||
    qty > MAX_QTY_PANIER ||
    qty < MIN_QTY_PANIER
  ) {
    erreurs.qty = {
      erreur: `La quantité doit être numérique, entre ${MIN_QTY_PANIER} et ${MAX_QTY_PANIER}.`,
    };

    erreurTrouvee = true;

    // Si la qty est à '0', '!qty' va retourner true, car '0' est équivalent à false
    if (qty === 0) {
      erreurs.qty = {
        erreur: null,
      };
      erreurTrouvee = false;
    }
  }

  if (erreurTrouvee) {
    return erreurs;
  } else {
    return false;
  }
};
