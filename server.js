const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body')
const Router = require('koa-router');
const router = new Router();
const path = require('path');
const uuid = require('uuid');
const koaStatic = require('koa-static');
const WS = require('ws');
const app = new Koa();


app.use(koaBody({
  urlencoded: true,
  multipart: true
}))

app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
      return await next();
  }

  const headers = {'Access-Control-Allow-Origin': '*'};

  if (ctx.request.method !== 'OPTIONS') {
      ctx.response.set({...headers});
      try {
          return await next();
      } catch (e) {
          e.headers = {...e.headers, ...headers};
          throw e;
      }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
      ctx.response.set({
          ...headers,
          'Access-Control-Allow-Methods': 'GET, POST, DELETE',
      });

      if (ctx.request.get('Access-Control-Request-Headers')) {
          ctx.response.set(
              'Access-Control-Allow-Headers',
              ctx.request.get('Access-Control-Request-Headers'),
          );
      }
      ctx.response.status = 204;
  }
});



const users = ["Sasha", "Misha", "Lilya", "Anna"];
const messages = {name: "Sasha", msg: "Hello, guys!", date: new Date()};


app.use(router.routes()).use(router.allowedMethods());

router.get('/chat', async (ctx, next) => {
 ctx.response.body = messages;
})

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback()).listen(port);
const wsServer = new WS.Server({server});

wsServer.on('connection', (ws) => {
  const errCallback = (err) => {
    if (err) {
     console.log(err);
    }}


ws.on('message', msg => {
const body = JSON.parse(msg);
const indexUser = users.indexOf(msg);
if(indexUser > -1) {
    ws.send('Такое имя уже есть!', errCallback);
} else {
    ws.send("Добро пожаловать!", errCallback);
    users.push(msg)
}
})

})