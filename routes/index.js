const koa_router = require("koa-router")
const common = require("../modules/common.js")
const db = require('../modules/db.js')
const crawler = require('../modules/crawler.js')
const fs = require("fs")
const path = require("path")

const router = koa_router()

function insertDB(urls, headers, taskname, description) {
	let index = 0
	for (url of urls) {
		index++
		url_info = {
			"id": index,
			"url": url
		}
		db.insertOne(taskname, url_info, (err, result) => {
			if(err){
				console.log(`Insert Fail => ${url}`)
			}
		})
	}
	task_info = {
		"id": 1,
		"name": taskname,
		"description": description,
		"amount": urls.length,
		"headers": headers
	}
	db.insertOne("Pageye_Tasks", task_info, (err, result) => {
		if(err){
			console.log(`Taks info insert fail`)
		}else{
			console.log(`Taks info insert success`)
			crawler.crawlBasicInfo(task_info)
		}
	})
}

function processUrls(add_urls, add_headers, add_taskname, add_description, file_content) {
	//console.log(add_urls, headers, taskname, file_content)
	post_urls = add_urls.split("\n")
	file_urls = file_content.split("\n")
	urls = post_urls.concat(file_urls)
	urls = common.uniqueArray(urls)

	header_list = add_headers.split("\n")
	header_list = common.uniqueArray(header_list)
	let headers = {}
	for (header of header_list) {
		header_key = header.split(":")[0]
		header_value = header.substring(header.indexOf(": ") + 2)
		headers[header_key] = header_value
	}

	taskname = add_taskname
	description = add_description
	// console.log(urls)
	// console.log(headers)
	// console.log(taskname)
	// console.log(description)
	insertDB(urls, headers, taskname, description)
}

router.get("/index", async(ctx) => {
	common.validLogin(ctx)
	const content = common.readFile("src/index.html")
	await ctx.render("main", {content})
});

router.post("/index", async(ctx) => {
	common.validLogin(ctx)
	const add_body = ctx.request.body
	add_urls = add_body["urls"]
	add_headers = add_body["headers"]
	add_taskname = add_body["taskname"]
	add_description = add_body["description"]
	// Process file
	taskpath = path.join(__dirname, "../public/tasks/", add_taskname)
	if (common.mkDir(taskpath) == false) {
		const content = "<b>" + add_taskname + "</b> Task already exists"
		await ctx.render("alert", {content})
		return 
	}
	const add_file = ctx.request.files.file
	if(add_file.name != ""){
		const reader = fs.createReadStream(add_file.path)
		const filePath = path.join(__dirname, "../public/upload/temp.txt")
		const upStream = fs.createWriteStream(filePath)
		reader.pipe(upStream).on("finish", async() => {
			file_content = common.readFile("public/upload/temp.txt")
			processUrls(add_urls, add_headers, add_taskname, add_description, file_content)
		})
	}else{
		processUrls(add_urls, add_headers, add_taskname, add_description, "")
	}
	ctx.redirect("/tasks")
});

module.exports = router