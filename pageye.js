var koa = require("koa")
const koa_session = require("koa-session")
const koa_route = require("koa-router")
const koa_static = require("koa-static")
const koa_views = require("koa-views")
const koa_body = require("koa-body")
const bodyParser = require("koa-bodyparser")
const path = require("path")

const router_login = require("./routes/login.js")
const router_index = require("./routes/index.js")
const router_tasks = require("./routes/tasks.js")
const router_view = require("./routes/view.js")

// Set session
const session_signed_key = ["D0g3_Threezh1!@#"]
const session_config = {
	key: "eye_session",
	maxAge: 24 * 1000 * 60, // 5 minitus
	rolling: true,
};

const app = new koa()

// Set session
const session = koa_session(session_config, app)
app.keys = session_signed_key
app.use(session);

app.use(koa_body({
	multipart: true,
	formidable: {
		maxFileSize: 200*1024*1024 // 2M
	}
}));

app.use(bodyParser())
app.use(koa_static(path.join( __dirname, "public")))
app.use(koa_views(path.join(__dirname, "views"), {extension: "ejs"}))

const router = new koa_route()

app.use(router.routes())
app.use(router_login.routes())
app.use(router_index.routes())
app.use(router_tasks.routes())
app.use(router_view.routes())
app.use(router.allowedMethods())

app.listen(6001);
console.log("Pageye running at http://127.0.0.1:6001");   