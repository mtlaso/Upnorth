const validator = require("validator");
const { MAX_LENGTH_EMAIL, MAX_LENGTH_TEL } = require("../infos");

exports.validerEmailMdpOublie = (email, tel) => {
  const erreurs = {
    email: null,
    tel: null,
  };

  let erreurTrouvee = false;

  if (!email || !validator.isEmail(email) || email.length > MAX_LENGTH_EMAIL) {
    erreurs.email = {
      erreur: `Le courriel être valide et doit avoir moins de ${MAX_LENGTH_EMAIL} charactères.`,
    };
    erreurTrouvee = true;
  }

  if (!tel || isNaN(Number(tel)) || tel.toString().length > MAX_LENGTH_TEL) {
    erreurs.tel = {
      erreur: `Le numéro de téléphone doit être numérique et doit avoir moins de ${MAX_LENGTH_TEL} charactères.`,
    };
    erreurTrouvee = true;
  }

  if (erreurTrouvee) {
    return erreurs;
  } else {
    return false;
  }
};
