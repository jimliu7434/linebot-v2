import Line from "@line/bot-sdk";
import Middleware from "./bot_middleware";

const config = {
    channelAccessToken: process.env.LINE_ACCESSTOKEN,
    channelSecret: process.env.LINE_SECRET,
};

const client = new Line.Client(config);

const middleware = Middleware(config);

const eventHandler = (event: Line.WebhookEvent) => {
    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore non-text-message event
        return Promise.resolve(null);
    }

    // create a echoing text message
    const echo: Line.TextMessage = { type: 'text', text: event.message.text };

    // use reply API
    return client.replyMessage(event.replyToken, echo);
}


export default { 
    client,
    middleware,
    eventHandler,
};

