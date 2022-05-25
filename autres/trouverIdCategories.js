const Categorie = require("../schemas/categorie");

// Trouver les identifiants de la categorie
const trouverIdCategorie = async (nomCategorie) => {
  try {
    let idCategorie;

    // Trouver id de la categorie
    idCategorie = await Categorie.findOne({
      nom: nomCategorie,
    });

    return idCategorie;
  } catch (error) {
    throw error;
  }
};

exports.trouverIdCategorie = trouverIdCategorie;
