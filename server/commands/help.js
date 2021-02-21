exports.run = (client, message) => {
    message.channel.send(`\`\`\`
-help 
    Shows this command

-clients [ID || Tag] [info field]
    Shows clients or info about them
    Examples:
        ${client.settings.fallbackPrefix}clients
        ${client.settings.fallbackPrefix}clients 9
        ${client.settings.fallbackPrefix}clients MyTag
        ${client.settings.fallbackPrefix}clients 4 chrome
    
-tag <ID> <TagName>
    Sets tag to a spceffic client
    Examples:
        ${client.settings.fallbackPrefix}tag 12 workstation3\`\`\``);
};
