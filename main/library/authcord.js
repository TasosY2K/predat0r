
const btoa = require('btoa');
const fetch = require('node-fetch');
let redirectUri; /* Redirect store. */

/* Scopes mapped with their API names. */
exports.scopes = scopes = {
  IDENTIFY: 'identify',
  JOIN_GUILDS: 'guilds.join',
  GUILDS: 'guilds',
};

/**
 * Generate the authorization URL.
 *
 * @param {Object} client the client object.
 * @param {String} client.id the client's id.
 *
 * @param {String} urlRedirect the redirect in URI form.
 * @param {Array<String>} scopes the scopes for the url to include.
 *
 * @return {String} the formed URL.
 */
function url(client, urlRedirect, scopes = ['identify']) {
  if (!urlRedirect) {
    throw new Error('UNSPECIFIED URL_REDIRECT');
  } else {
    redirectUri = encodeURIComponent(urlRedirect);
  }
  return `https://discordapp.com/oauth2/authorize?client_id=${client.id}&scope=${scopes.join('%20')}&response_type=code&redirect_uri=${redirectUri}`;
}

/**
 * Handle a callback from discord to get the access & refresh tokens.
 *
 * @param {Object} client the client object.
 * @param {String} client.id the client's id.
 * @param {String} client.secret the client's secret.
 *
 * @param {String} code the code recieved from discord from the callback.
 * @param {String} type the grant type of the request.
 *
 * @return {JSON} the json sent directly from discord.
 */
async function callback(client = {}, code, redirect = redirectUri, type = 'authorization_code') {
  if (!code) throw new Error('NO DISCORD CODE PROVIDED');
  if (!client || client && !client.secret || client && !client.id) throw new Error('MALFORMED CLIENT');
  const creds = btoa(`${client.id}:${client.secret}`);
  const response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=${type}&code=${code}&redirect_uri=${redirect}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${creds}`,
        },
      });
  return await response.json();
}

/**
 * Exchange an access or refresh token for user data.
 *
 * @param {Object} client the client object.
 * @param {String} client.id the client's id.
 * @param {String} client.secret the client's secret.
 *
 * @param {String} accessToken the access token for the exchange.
 * @param {String} refreshToken the fallback refresh token.
 *
 * @return {JSON} the user's data.
 */
async function exchangeUser(client, accessToken, refreshToken) {
  const response = await fetch('http://discordapp.com/api/users/@me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (response.status === '401') {
    return exchangeUser(client, callback(client, refreshToken, 'refresh_token'), refreshToken);
  } else {
    return await response.json();
  }
}

/**
 * Exchange an access or refresh token for user guilds data.
 *
 * @param {Object} client the client object.
 * @param {String} client.id the client's id.
 * @param {String} client.secret the client's secret.
 *
 * @param {String} accessToken the access token for the exchange.
 * @param {String} refreshToken the fallback refresh token.
 *
 * @return {JSON} the user's guild data.
 */
async function exchangeGuilds(client, accessToken, refreshToken) {
  const response = await fetch('http://discordapp.com/api/users/@me/guilds', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (response.status === '401') {
    return exchangeGuilds(client, callback(client, refreshToken, 'refresh_token'), refreshToken);
  } else {
    return await response.json();
  }
}

/**
 * Join a guild on behalf of a user.
 *
 * @param {Object} client the client object.
 * @param {String} client.id the client's id.
 * @param {String} client.secret the client's secret.
 *
 * @param {String} accessToken the access token for the exchange.
 * @param {String} refreshToken the fallback refresh token.
 *
 * @return {Boolean} if the user joined the channel successfully.
 */
async function joinGuild(client, accessToken, refreshToken, guildId, options = {}) {
  const user = await exchangeUser(client, accessToken, refreshToken);
  const response = await fetch(`http://discordapp.com/api/guilds/${guildId}/${user.id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: options,
  });
  if (response.status === '401') {
    return await joinGuild(client, callback(client, refreshToken, 'refresh_token'), refreshToken);
  } else {
    return true;
  }
}

module.exports = {exchangeUser, exchangeGuilds, joinGuild, url, callback, redirectUri};
