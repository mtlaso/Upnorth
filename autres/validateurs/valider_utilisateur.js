const validator = require("validator");
const {
  MAX_LENGTH_EMAIL,
  MAX_LENGTH_NOM,
  MAX_LENGTH_PWD,
  MIN_LENGTH_PWD,
  MAX_LENGTH_ADRESSE,
  MAX_LENGTH_TEL,
  MAX_AGE,
} = require("../infos");

// Valider un utilisateur lors de l'inscription
exports.validerInscription = (utilisateur) => {
  const erreurs = {
    email: null,
    nom: null,
    pwd: null,
    adresse: null,
    tel: null,
    age: null,
  };

  let erreurTrouvee = false;

  const email = utilisateur.email;
  if (!email || !validator.isEmail(email) || email.length > MAX_LENGTH_EMAIL) {
    erreurs.email = {
      erreur: `Le courriel être valide et doit avoir moins de ${MAX_LENGTH_EMAIL} charactères.`,
    };
    erreurTrouvee = true;
  }

  const nom = utilisateur.nom;
  if (!nom || nom.length > MAX_LENGTH_NOM) {
    erreurs.nom = {
      erreur: `Le nom doit avoir moins de ${MAX_LENGTH_NOM} charactères.`,
    };
    erreurTrouvee = true;
  }

  const pwd = utilisateur.pwd;
  if (!pwd || pwd.length > MAX_LENGTH_PWD || pwd.length < MIN_LENGTH_PWD) {
    erreurs.pwd = {
      erreur: `Le nombre de charactères du mot de passe doit être entre ${MIN_LENGTH_PWD} et ${MAX_LENGTH_PWD}.`,
    };
    erreurTrouvee = true;
  }

  const adresse = utilisateur.adresse;
  if (!adresse || adresse.length > MAX_LENGTH_ADRESSE) {
    erreurs.adresse = {
      erreur: `L'adresse doit avoir moins de ${MAX_LENGTH_ADRESSE} charactères.`,
    };
    erreurTrouvee = true;
  }

  const tel = utilisateur.tel;
  if (!tel || isNaN(Number(tel)) || tel.toString().length > MAX_LENGTH_TEL) {
    erreurs.tel = {
      erreur: `Le numéro de téléphone doit être numérique et doit avoir moins de ${MAX_LENGTH_TEL} charactères.`,
    };
    erreurTrouvee = true;
  }

  const age = utilisateur.age;
  if (!age || isNaN(Number(age)) || age > MAX_AGE) {
    erreurs.age = {
      erreur: `L'age doit être numérique et plus petit que ${MAX_AGE}.`,
    };
    erreurTrouvee = true;
  }

  if (erreurTrouvee) {
    return erreurs;
  } else {
    return false;
  }
};

// Valider un utilisateur lors de changments sur son compte
exports.validerChangements = (utilisateur, ignorerValidationPwd) => {
  const erreurs = {
    email: null,
    nom: null,
    pwd: null,
    adresse: null,
    tel: null,
    age: null,
  };

  let erreurTrouvee = false;

  const email = utilisateur.email;
  if (!email || !validator.isEmail(email) || email.length > MAX_LENGTH_EMAIL) {
    erreurs.email = {
      erreur: `Le courriel doit avoir moins de ${MAX_LENGTH_EMAIL} charactères.`,
    };
    erreurTrouvee = true;
  }

  const nom = utilisateur.nom;
  if (!nom || nom.length > MAX_LENGTH_NOM) {
    erreurs.nom = {
      erreur: `Le nom doit avoir moins de ${MAX_LENGTH_NOM} charactères.`,
    };
    erreurTrouvee = true;
  }

  if (!ignorerValidationPwd) {
    const pwd = utilisateur.pwd;
    if (!pwd || pwd.length > MAX_LENGTH_PWD || pwd.length < MIN_LENGTH_PWD) {
      erreurs.pwd = {
        erreur: `Le nombre de charactères du mot de passe doit être entre ${MIN_LENGTH_PWD} et ${MAX_LENGTH_PWD}.`,
      };
      erreurTrouvee = true;
    }
  }

  const adresse = utilisateur.adresse;
  if (!adresse || adresse.length > MAX_LENGTH_ADRESSE) {
    erreurs.adresse = {
      erreur: `L'adresse doit avoir moins de ${MAX_LENGTH_ADRESSE} charactères.`,
    };
    erreurTrouvee = true;
  }

  const tel = utilisateur.tel;
  if (!tel || tel.length > MAX_LENGTH_TEL || !validator.isNumeric(tel)) {
    erreurs.tel = {
      erreur: `Le numéro de téléphone doit être numérique et doit avoir moins de ${MAX_LENGTH_TEL} charactères.`,
    };
    erreurTrouvee = true;
  }

  const age = utilisateur.age;
  if (!age || age.length > MAX_LENGTH_AGE) {
    erreurs.age = {
      erreur: `L'age doit avoir moins de ${MAX_LENGTH_AGE} charactères.`,
    };
    erreurTrouvee = true;
  }

  if (erreurTrouvee) {
    return erreurs;
  } else {
    return false;
  }
};
