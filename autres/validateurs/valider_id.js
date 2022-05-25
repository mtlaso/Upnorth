const mongoose = require("mongoose");

/**
 * Valider identifiant de mongodb
 * @param {string} id: Identifiant '_id' à valider.
 * @returns {boolean} 'true' si valide, 'false' sinon.
 */
exports.valider = (id) => mongoose.Types.ObjectId.isValid(id);
