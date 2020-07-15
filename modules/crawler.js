'use strict';
const common = require("./common.js")
const db = require("./db.js")
const path = require("path")

const puppeteer = require("puppeteer")
const { Cluster } = require("puppeteer-cluster")
const cheerio = require("cheerio")

const sensitive = require("./scan/sensitive.js")

exports.crawlBasicInfo = async function (taskinfo) {
	let task_id = taskinfo["id"]
	let taskname = taskinfo["name"]
	let headers = taskinfo["headers"]

	const pathToExtension = path.join('/Users/threezh1/Desktop/Sec/Scripts/eye/pageye/node_modules/puppeteer/.local-chromium/mac-722234/chrome-mac/Chromium.app/Contents/MacOS/Chromium');
	const cluster = await Cluster.launch({
		concurrency: Cluster.CONCURRENCY_PAGE,
		maxConcurrency: 10,
		retryLimit: 2,
		puppeteerOptions: {
			executablePath: pathToExtension,
			defaultViewport: {width:1440, height:780},
			headless: true,
			ignoreHTTPSErrors: true,
		}
	});

	await cluster.task(async ({ page, data: data }) => {
		try {
			let page_info = await db._find("Pageye_Tasks", {"name": taskname})

			let black_url_words = /(loginout)/i
			if (black_url_words.exec(data["url"]) == null) {
				await page.setExtraHTTPHeaders(page_info[0]["headers"])
			}
			let response = await page.goto(data["url"], {
				timeout: 10 * 1000,
			})
			let body = ""
			let title = ""
			body = await page.content();
			let $ = cheerio.load(body)
			title = $('title').text().replace(" ","").replace("\n","")
			const ip = response.remoteAddress()
			const remoteAddress = ip["ip"] + ":" + ip["port"]
			const go_url = response.url()
			const status = response.status()
			const headers = response.headers()
			const body_length = body.length
			try {
				await page.screenshot({
					path: `${data["filepath"]}/${data["index"]}.png`,
					type: "png",
					clip: {x: 0, y: 0, width: 1440, height: 900}
				})
				console.log(data["url"] + ` ${data["filepath"]}/${data["index"]}.png`)
			} catch (err) {
				console.log("No picture")
			}

			let url_info = {}
			url_info["index"] = data["index"]
			url_info["go_url"] = go_url
			url_info["title"] = title
			url_info["status"] = status
			url_info["body_length"] = body_length
			url_info["headers"] = headers
			url_info["filepath"] = `${data["taskname"]}/${data["index"]}.png`
			url_info["remoteAddress"] = remoteAddress
			url_info["scan_sensitive"] = sensitive.sensitiveScan(body)
			const newvalue = { $set : url_info }
			db.updateOne(data["taskname"], {"url":data["url"]}, newvalue, (err, result) => {
				if (err) {
					console.log("Update Fail => " + data["url"])
					console.log(err.errmsg)
				}else{
					console.log("Update Success => " + data["url"])
				}
			})
		} catch(err) {
			console.log(data["url"] + " " + err)
		}
	});

	let index = 0
	let filepath = path.join(__dirname, '../public/tasks/' + taskname);
	for (url of urls) {
		index++
		let page_data = {
			"index": index,
			"url": url,
			"filepath": filepath,
			"taskname": taskname,
		}
		cluster.queue(page_data)
	}
	await cluster.idle()
	await cluster.close()
}