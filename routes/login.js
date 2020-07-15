const koa_router = require("koa-router")
const common = require("../modules/common.js")
const fs = require("fs")

const router = koa_router()

router.get("/", async(ctx) => {
	ctx.redirect("/login")
});

router.get("/login", async(ctx) => {
	ctx.body = common.readFile("src/login.html")
});

router.post("/login", async(ctx) => {
	const login_data = ctx.request.body
	if(login_data["password"] == "threezh1"){
		ctx.session.logined = true
		ctx.redirect("/tasks")
	}
	ctx.redirect("/index")
});

module.exports = router