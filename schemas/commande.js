const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commandeSchema = new Schema(
  {
    produits: [
        {
          id_produit: {
            type: Schema.Types.ObjectId,
            ref: "Produit",
            required: true,
          },
          nom: {
            type: String,
            required: true,
          },
          image: {
            type: String,
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
          prix: {
              type: Number,
              required: true,
          }
        },
      ],
    total : {
        type: Number,
        required: true
    },
    adresseLivraison : {
        type: String,
        required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Commande", commandeSchema);
