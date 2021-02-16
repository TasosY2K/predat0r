const authcord = require('../../library/authcord');

module.exports = (application, client, secret) => {
  application.get('/callback', async function(request, response) {
    const callback = await authcord.callback({id: client, secret: secret}, request.query.code);
    response.cookie('access_token', callback.access_token);
    response.cookie('refresh_token', callback.refresh_token);
    response.redirect('/');
  });
};
