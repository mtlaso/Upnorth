"use strict";

const express = require("express");

// commentaire
const checkoutController = require("../controllers/checkout.controller");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.post(
  "/create-checkout-session",
  isAuth,
  checkoutController.postCreateCheckoutSession
);
router.get("/success", isAuth, checkoutController.getSuccess);
router.get("/cancel", isAuth, checkoutController.getCancel);

module.exports = router;
