// Generer 16 characteres aleatoires pour busboy
const random = function () {
  return new Promise((resolve, reject) => {
    const { randomFill } = require("crypto");
    const buf = Buffer.alloc(16);
    randomFill(buf, (err, buf) => {
      if (err) throw err;
      resolve(buf.toString("hex"));
    });
  });
};

exports.random = random;
