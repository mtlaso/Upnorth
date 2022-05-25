"use strict";

const path = require("path");
const random_busboy = require("./random");

const nomImage = async (mimeType) => {
  return new Promise((resolve, reject) => {
    let cheminAbsolu;
    let nomImage;

    random_busboy.random().then((random) => {
      nomImage = `${random}.${extention(mimeType)}`;
      cheminAbsolu = path.join(
        `${__dirname}/../public/uploads/images_produits/`,
        `${nomImage}`
      );
      resolve([cheminAbsolu, nomImage]);
    });
  });
};

const extention = (mimeType) => {
  switch (mimeType) {
    case "image/jpeg":
      return "jpeg";
      break;
    case "image/gif":
      return "gif";
      break;
    case "image/svg+xml":
      return "svg";
      break;
    case "image/avif":
      return "avif";
      break;
    case "image/png":
      return "png";
    default:
      return "jpg";
      break;
  }
};

exports.nomImage = nomImage;
