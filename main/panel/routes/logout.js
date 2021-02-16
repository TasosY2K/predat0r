module.exports = (application) => {
  application.get('/logout', async function(request, response) {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    response.redirect('/');
  });
};
