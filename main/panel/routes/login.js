const authcord = require('../../library/authcord');

module.exports = (application, client, secret) => {
  application.get('/login', async function(request, response) {
    if (request.cookies && request.cookies['access_token'] && request.cookies['refresh_token']) {
      response.redirect('/');
    } else {
      response.redirect(authcord.url({id: client, secret: secret}, 'http://localhost/callback'));
    }
  });
};
