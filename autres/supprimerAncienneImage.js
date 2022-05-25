const fs = require("fs");
const path = require("path");

const supprimerAncienneImage = async (nomImage) => {
  return new Promise((resolve, reject) => {
    const chemin = path.join(
      `${__dirname}/../public/uploads/images_produits/`,
      `${nomImage}`
    );
    fs.unlink(chemin, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

exports.supprimer = supprimerAncienneImage;
