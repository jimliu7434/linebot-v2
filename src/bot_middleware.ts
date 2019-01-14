import { raw } from "body-parser";
//import * as http from "http";
import { JSONParseError, SignatureValidationFailed, MiddlewareConfig, validateSignature } from "@line/bot-sdk";
import { Context } from "koa";

//export type Request = http.IncomingMessage & { body: any };
//export type Response = http.ServerResponse;
export type Context = Context & { body: any };
export type NextCallback = (err?: Error) => void;

export type Middleware = (
    //req: Request,
    //res: Response,
    ctx: Context,
    //next: NextCallback,
) => void;

function isValidBody(body?: any): body is string | Buffer {
    return (body && typeof body === "string") || Buffer.isBuffer(body);
}

export default function middleware(config: MiddlewareConfig): Middleware {
    if (!config.channelSecret) {
        throw new Error("no channel secret");
    }

    const secret = config.channelSecret;

    return async (ctx: Context) => {
        // header names are lower-cased
        // https://nodejs.org/api/http.html#http_message_headers
        const req = ctx.request;
        //const res = ctx.response;
        const signature = req.headers["x-line-signature"] as string;

        if (!signature) {
            throw new SignatureValidationFailed("no signature");
        }

        const getBody = (ctx: Context) => {
            const request = ctx.request;

            return new Promise(resolve => {
                if (isValidBody(request.rawBody)) {
                    // rawBody is provided in Google Cloud Functions and others
                    resolve(request.rawBody);
                }
                else if (isValidBody(request.body)) {
                    resolve(request.body);
                }
                else {
                    // body may not be parsed yet, parse it to a buffer
                    resolve(request.body);
                }
            });
        }

        const body: any = await getBody(ctx);
        if (!validateSignature(body, secret, signature)) {
            throw new SignatureValidationFailed(
                "signature validation failed",
                signature,
            );
        }

        const strBody = Buffer.isBuffer(body) ? body.toString() : body;

        try {
            req.body = JSON.parse(strBody);
        }
        catch (err) {
            throw new JSONParseError(err.message, strBody);
        }
    };
}