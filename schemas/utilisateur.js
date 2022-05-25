const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const utilisateurSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },

    nom: {
      type: String,
      required: true,
    },
    // mot de passe
    pwd: {
      type: String,
      required: true,
    },

    adresse: {
      type: String,
      required: true,
    },

    tel: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      required: true,
    },

    est_admin: {
      type: Boolean,
      required: true,
    },

    email_confirmer: {
      type: Boolean,
      required: true,
    },

    code_recuperation: {
      type: String,
      default: "n/a",
    },

    commandes: [
      {
        type: Schema.Types.ObjectId,
        // ref: "Commande"
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Utilisateur", utilisateurSchema);
