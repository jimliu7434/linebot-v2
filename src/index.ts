import Koa from "koa";
import Router from "koa-router";
import logger from "koa-logger";

const app: Koa = new Koa();
const router: Router = new Router();

app.use(logger());

router.get("/:ch", async (ctx) => {
    const ch:string = ctx.params.ch;
    ctx.body = `Hello World ${ch}`;
    return ctx.status = 200;
});

app.use(router.routes());
app.listen(3000, () => {
    // tslint:disable-next-line:no-console
    console.log(`server at 3000`);
});
