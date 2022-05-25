const validator = require("validator");
const { MAX_LENGTH_PWD, MIN_LENGTH_PWD } = require("../infos");

exports.validerMdp = (mdp) => {
  const erreurs = {
    pwd: null,
  };

  let erreurTrouvee = false;

  const pwd = mdp;
  if (!pwd || pwd.length > MAX_LENGTH_PWD || pwd.length < MIN_LENGTH_PWD) {
    erreurs.pwd = {
      erreur: `Le nombre de charactères du mot de passe doit être entre ${MIN_LENGTH_PWD} et ${MAX_LENGTH_PWD}.`,
    };
    erreurTrouvee = true;
  }

  if (erreurTrouvee) {
    return erreurs;
  } else {
    return false;
  }
};
