const { checkout, BestBuySignIn, prod, priceCheck } = require('./pup.js');

const cors = require('cors')
const express = require("express");
const app = express();
const path = require('path');
const fs = require('fs');
const file = require(path.join(__dirname, '../db.json'));

app.use(cors());

app.use(express.static(path.join(__dirname, './src')));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/BBlogin', async function(req, res) {
  file.BBemail = req.body.BBEmail;
  file.BBpass = req.body.BBPassword;
  BestBuySignIn(file.BBemail, file.BBpass);
  fs.writeFile(path.join(__dirname, '../db.json'), JSON.stringify(file), function writeJSON(err) {
      if (err) return console.log(err);
      console.log(JSON.stringify(file));
      console.log('writing to ' + 'db.json');
  });
})

app.use('/pup', async function(req, res) {
    const newD = {
      URL: req.body.URL,
      SecNumber: req.body.SecNumber,
      processed: req.body.processed
    };
//make another local storage json file for the table
    if(req.body.priceLimit !== "") {
      let pcheck = await priceCheck(newD.URL);
      if(req.body.priceLimit < Number(pcheck.price.replace(/[^0-9\.]+/g, ""))) {
        res.send({bot: pcheck.bot, sentence: "Price is over your limit!"});
      } else {
        let p = await checkout(newD.URL, newD.SecNumber);
        let p1 = await prod(newD.URL);

        res.send({ pup: p, prod: p1 });
      }
    } else {
      let p = await checkout(newD.URL, newD.SecNumber);
      let p1 = await prod(newD.URL);

      //push to table.json
      fs.readFile(path.join(__dirname, '../table.json'), 'utf-8', function (err, data) {
        let obj = JSON.parse(data);
        obj.unshift({processed: p, name: p1.prodName, price: p1.prodPrice, image: p1.prodImage})
        fs.writeFile(path.join(__dirname, '../table.json'), JSON.stringify(obj, null, 4), function writeJSON(err) {
          if (err) return console.log(err);
          console.log('writing to ' + 'table.json');
        });
      })

      res.send({ pup: p, prod: p1 });
    }
})

const port = 3001;

app.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});

