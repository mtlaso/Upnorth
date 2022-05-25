const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tailleSchema = new Schema(
  {
    nom: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Taille", tailleSchema);
