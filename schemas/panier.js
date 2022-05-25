const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const panierSchema = new Schema(
  {
    id_utilisateur: {
      type: Schema.Types.ObjectId,
      ref: "Utilisateur",
      required: true,
    },
    produits: [
      {
        id_produit: {
          type: Schema.Types.ObjectId,
          ref: "Produit",
          required: true,
        },
        taille: {
          type: String,
          required: true,
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

module.exports = mongoose.model("Panier", panierSchema);
