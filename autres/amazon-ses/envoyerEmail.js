const AWS = require("aws-sdk");
const dotenv = require("dotenv").config();

const SES_CONFIG = {
  accessKeyId: process.env.AWS_SES_SMTP_ID,
  secretAccessKey: process.env.AWS_SES_SMTP_SECRET,
  region: "us-east-1", // N. Virginia
  apiVersion: "latest",
};

const AWS_SES = new AWS.SES(SES_CONFIG);

const initEmailRecuperation = (emailTo, token) => {
  return (params = {
    Destination: {
      CcAddresses: [],
      ToAddresses: [emailTo],
    },
    Message: {
      Body: {
        Text: {
          Data: `Bonjour, changez votre mot de passe en cliquant sur le bouton suivant ou en visitant le lien suivant : ${process.env.URL}/recover/${token}`,
        },
        Html: {
          Data:
            "<h1>Récupérez votre mot de passe (valide pour 15 minutes).</h1>" +
            `<p>Bonjour, changez votre mot de passe en cliquant sur le bouton suivant : </p>` +
            `<a href="${process.env.URL}/recover/${token}" referrerpolicy="no-refferer" blank="_blank">Changer mot de passe</a>`,
        },
        Text: {
          Charset: "UTF-8",
          Data: "",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Récupérez votre mot de passe.",
      },
    },
    Source: "noreply@webhub.rocks", // webhub.rocks est un domaine que j'ai,
    ReplyToAddresses: ["reply@webhub.rocks"],
  });
};

const initEmailConfirmation = (emailTo, userId) => {
  return (params = {
    Destination: {
      CcAddresses: [],
      ToAddresses: [emailTo],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data:
            "<h1>Confirmer votre email.</h1>" +
            `<p>Bonjour, veuillez confirmer votre email en cliquant sur le bouton suivant ou en visitant le lien suivant : ${process.env.URL}/confimer/${userId}</p>` +
            `<a href="${process.env.URL}/confirmer/${userId}" referrerpolicy="no-refferer" blank="_blank">Confirmer email</a>`,
        },
        Text: {
          Charset: "UTF-8",
          Data: "",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Confirmer votre email.",
      },
    },
    Source: "noreply@webhub.rocks", // webhub.rocks est un domaine que j'ai,
    ReplyToAddresses: ["reply@webhub.rocks"],
  });
};

const envoyerEmailRecuperation = (params) => {
  const sendPromise = AWS_SES.sendEmail(params).promise();

  return new Promise((resolve, reject) => {
    sendPromise
      .then(function (data) {
        console.log(
          `AWS SES : email de recuperation envoyé, message id : ${data.MessageId}`
        );
        resolve(data);
      })
      .catch(function (err) {
        console.error(`AWS SES err : ${err.stack}`);
        reject(err);
      });
  });
};

const envoyerEmailConfirmation = (params) => {
  const sendPromise = AWS_SES.sendEmail(params).promise();

  return new Promise((resolve, reject) => {
    // Handle promise's fulfilled/rejected states
    sendPromise
      .then(function (data) {
        console.log(
          `AWS SES : email de confirmation envoyé, message id : ${data.MessageId}`
        );
        resolve(data);
      })
      .catch(function (err) {
        console.error(`AWS SES err : ${err.stack}`);
        reject(err);
      });
  });
};

exports.initEmailRecuperation = initEmailRecuperation;
exports.envoyerEmailRecuperation = envoyerEmailRecuperation;

exports.initEmailConfirmation = initEmailConfirmation;
exports.envoyerEmailConfirmation = envoyerEmailConfirmation;
