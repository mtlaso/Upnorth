const Taille = require("../schemas/taille");

// Trouver les identifiants des tailels
const trouverIdTailles = async () => {
  try {
    // Trouver id des tailles
    return await Taille.find({});
  } catch (error) {
    throw error;
  }
};

exports.trouverIdTailles = trouverIdTailles;
