const koa_router = require("koa-router")
const common = require("../modules/common.js")
const db = require('../modules/db.js')
const fs = require("fs")

const router = koa_router()

router.get("/tasks", async(ctx) => {
	common.validLogin(ctx)

	if (ctx.query.task) {
		const taskname = ctx.query.task
		common.delDir("public/tasks/" + taskname)
		db._deleteMany("Pageye_Tasks", {"name": taskname})
		db._drop(taskname)
		ctx.redirect("/tasks")
	}


	let pageye_tasks = await db._find("Pageye_Tasks", {})
	let content = ""
	let index = 0
	for (task of pageye_tasks) {
		index++
		let task_index = index
		let task_name = task["name"]
		let task_description = task["description"]
		let task_amount = task["amount"]
		let task_status_200_urls = await db._find(task_name, {'status': {'$in': [200]}})
		let task_status_200 = task_status_200_urls.length
		let task_status_404_urls = await db._find(task_name, {'filepath': {'$exists': false}})
		let task_status_400_urls = await db._find(task_name, {'status': {'$in': [400, 401, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417]}})
		let task_status_404 = task_status_404_urls.length + task_status_400_urls.length
		let task_all_urls = await db._find(task_name, {})
		let task_status_other = task_all_urls.length - task_status_200 - task_status_404
		let task_line = `
	    <tr>
	      <td>${task_index}</td>
	      <td>${task_name}</td>
	      <td>${task_description}</td>
	      <td>${task_amount}</td>
	      <td>
	      	<span class="badge badge-success">${task_status_200}</span>
	      	<span class="badge badge-danger">${task_status_404}</span>
	      	<span class="badge badge-warning">${task_status_other}</span>
	      </td>
	      <td>
	      	<a href="/view?task=${task_name}" class="btn btn-outline-info">view</a>
	      	<a href="/tasks?task=${task_name}" class="btn btn-outline-danger">delete</a>
	      </td>
	    </tr>
		`
		content += task_line
	}
	await ctx.render("tasks", {content})
});

router.post("/tasks", async(ctx) => {
	ctx.redirect("/tasks")
});

module.exports = router