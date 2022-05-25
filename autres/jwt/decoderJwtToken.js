"use strict";

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

/** Décode le token JWT */
const decoderJwtToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRET_JWT, function (err, decodedToken) {
      if (err) {
        reject(false);
      } else {
        resolve(decodedToken);
      }
    });
  });
};

exports.decodedJwtToken = decoderJwtToken;
