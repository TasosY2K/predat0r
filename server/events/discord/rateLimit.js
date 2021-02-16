module.exports = async (client, rateLimitInfo) => {
    console.log(
        `rateLimit: rl : ${rateLimitInfo.requestLimit} : td: ${rateLimitInfo.timeDifference} : mt ${rateLimitInfo.method} : path ${rateLimitInfo.path}`
    );
};
