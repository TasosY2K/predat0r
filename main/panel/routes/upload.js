const authcord = require('../../library/authcord');

module.exports = (application, client, secret) => {
  application.get('/upload', async function(request, response) {
    if (request.cookies && request.cookies['access_token'] && request.cookies['refresh_token']) {
      const user = await authcord.exchangeUser({id: client, secret: secret}, request.cookies['access_token'], request.cookies['refresh_token']);
      response.render('upload', {username: user.username});
    } else {
      response.render('upload');
    }
  });
};
