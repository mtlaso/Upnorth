const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listeSchema = new Schema(
  {
    id_utilisateur: {
      type: Schema.Types.ObjectId,
      ref: "Utilisateur",
      required: true,
    },
    produits: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Liste", listeSchema);
