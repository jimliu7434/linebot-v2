import Koa from "koa";
import Router from "koa-router";
import logger from "koa-logger";
import bodyparser from "body-parser";
import bot from "./bot";

const app: Koa = new Koa();
const router: Router = new Router();

app.use(logger());
app.use(bodyparser);

router.post("/callback",
    async (ctx, next) => {
        try {
            await bot.middleware(ctx);
            next();
        }
        catch (err) {
            // tslint:disable-next-line
            console.error(err);
            return ctx.status = 501;
        }
    },
    async (ctx) => {
        try {
            const result = await Promise.all(ctx.body.events.map(bot.eventHandler));
            ctx.body = result;
            return ctx.status = 200;
        }
        catch (err) {
            // tslint:disable-next-line
            console.error(err);
        }
    }
);


app.use(router.routes());
app.listen(3000);