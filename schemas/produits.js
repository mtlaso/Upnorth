const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const produitSchema = new Schema(
  {
    id_categorie: {
      type: Schema.Types.ObjectId,
      ref: "Categorie",
    },

    nom: {
      type: String,
      required: true,
    },

    desc: {
      type: String,
      required: true,
    },

    prix: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },

    sexe: {
      type: String,
      required: true,
    },

    est_discontinue: {
      type: Boolean,
      required: true,
    },

    tailles: [
      {
        id_taille: {
          type: Schema.Types.ObjectId,
          ref: "Taille",
        },
        qty: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Produit", produitSchema);
