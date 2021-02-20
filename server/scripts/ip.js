const axios = require("axios");

exports.info = async (ipAddress) => {
    return await axios.get("http://ip-api.com/json/" + ipAddress);
};
