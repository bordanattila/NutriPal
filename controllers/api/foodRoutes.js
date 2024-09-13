const path = require('path');

exports.foodDetails = (req, res) => {
  if (req.session.userId) {
      res.sendFile(path.join(__dirname, '../public/views/foodDetails.html'));
  } else {
      res.redirect('/');
  }
};
