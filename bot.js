// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');
const OPENAI_RESOURCE = process.env.OPENAI_RESOURCE;
const OPENAI_DEPLOYMENT = process.env.OPENAI_DEPLOYMENT;
const OPENAI_VERSION = process.env.OPENAI_VERSION;
const OPENAI_COMPLETION_URL = `https://${OPENAI_RESOURCE}.openai.azure.com/openai/deployments/${OPENAI_DEPLOYMENT}/chat/completions?api-version=${OPENAI_VERSION}`;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const axios = require('axios');

var getCompletion = async function(text) {
    var data = {
        messages: [
            {
                role: 'user',
                content: text
            }
        ]
    };
    var res = await axios({
        method: 'post',
        url: OPENAI_COMPLETION_URL,
        headers: {
            'Content-Type': 'application/json',
            'api-key': OPENAI_API_KEY
        },
        data: data
    });
    return (res.data.choices[0] || []).message?.content;
};

class EchoBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            try {
                const replyText = await getCompletion(context.activity.text);
                await context.sendActivity(replyText);
            } catch (e) {
                console.log(e);
            }
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Hello and welcome!';
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // By calling next() you ensure that the next botHandler is run.
            await next();
        });
    }
}
module.exports.EchoBot = EchoBot;

