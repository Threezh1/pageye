const koa_router = require("koa-router")
const common = require("../modules/common.js")
const db = require('../modules/db.js')
const fs = require("fs")

const router = koa_router()

router.get("/view", async(ctx) => {
	common.validLogin(ctx)

	if (!ctx.query.task) {
		const content = "No task specified"
		await ctx.render("alert", {content})
		return
	}
	taskname = ctx.query.task
	let pageye_urls = await db._find(taskname, {})
	if (pageye_urls.length == 0) {
		const content = "No urls"
		await ctx.render("alert", {content})
		return
	}
	pageye_urls_sort = pageye_urls.sort(common.compare("id"))
	let content = ""
	let index = 0
	for (url_info of pageye_urls_sort) {
		index++
		let url_index = index
		let url_url = url_info["url"]
		let url_title = url_info["title"]
		let url_status = url_info["status"]
		let url_filepath = url_info["filepath"]
		let url_body_length = url_info["body_length"]
		let url_remoteAddress = url_info["remoteAddress"]
		let url_headers = ""
		for (header in url_info["headers"]) {
			url_headers += `
		                  <tr>
		                    <td>${header}</td>
		                    <td>${url_info["headers"][header]}</td>
		                  </tr>`
		}
		let url_badge = "info"
		status_result = parseInt(url_status / 100)
		switch(status_result) {
			case 2:
				url_badge = "success"
				break
			case 3:
				url_badge = "info"
				break
			case 4:
				url_badge = "danger"
				break			
			case 5:
				url_badge = "warning"
				break
			default:
				url_badge = "info"
				break
		}

		let scan_sensitive = url_info["scan_sensitive"]

		let sensitive_table = ""

		for (info_name in scan_sensitive) {
			sensitive_table += `
		                  <tr>
		                    <td>${info_name}</td>
		                    <td>${scan_sensitive[info_name]}</td>
		                  </tr>`
		} 

		let url_line = `
		<div class="card rounded mt-3">
		  <div class="card-header"><span class="badge badge-info">${url_index}</span> <span class="badge badge-${url_badge}">${url_status}</span> ${url_url}</div>
		    <div class="card-body">
		      <div class="container">
		        <div class="row">
		          <div class="col-md-4">
		            <lable><h5>${url_title}</h5></lable><br>
		            <img class="border rounded my-2" src="/tasks/${url_filepath}" width="288" height="180">
		            <p>
		              <div class="">RemoteAddress: <b>${url_remoteAddress}</b></div> Length: <span class="badge badge-info">${url_body_length}</span><br>
		            </p>
		            <p>

		            </p>
		            <p>
		              <a href="${url_url}" class="btn btn-info" target="_blank">Goto</a>
		            </p>
		          </div>
		          <div class="col-sm-8">
		            <ul class="nav nav-tabs" >
		            <li class="nav-item">
		              <a class="nav-link active" data-toggle="tab" href="#http_header_${url_index}" aria-controls="http_header_${url_index}" aria-selected="true">HTTP HEADER</a>
		            </li>
		            <li class="nav-item">
		              <a class="nav-link" data-toggle="tab" href="#information_${url_index}" aria-controls="information_${url_index}" aria-selected="false">Information</a>
		            </li>
		            <li class="nav-item">
		              <a class="nav-link" data-toggle="tab" href="#interface_${url_index}" aria-controls="interface_${url_index}" aria-selected="false">Interface</a>
		            </li>
		          </ul>
		          <div class="tab-content mt-3">
		            <div class="tab-pane fade show active" id="http_header_${url_index}" aria-labelledby="http_header_${url_index}-tab">
		              <table class="table table-sm table-striped">
		                <thead>
		                  <tr class="table-active">
		                    <th>Header</th>
		                    <th>Value</th>
		                  </tr>
		                </thead>
		                <tbody>${url_headers}
		                </tbody>
		              </table>
		            </div>
		            <div class="tab-pane fade" id="information_${url_index}" aria-labelledby="information_${url_index}-tab">
		              <table class="table table-sm table-striped">
		                <thead>
		                  <tr class="table-active">
		                    <th>Name</th>
		                    <th>Value</th>
		                  </tr>
		                </thead>
		                <tbody>${sensitive_table}
		                </tbody>
		              </table>
		            </div>
		            <div class="tab-pane fade" id="interface_${url_index}" aria-labelledby="interface_${url_index}-tab">For jsfinder</div>
		          </div>
		          </div>
		        </div>
		      </div>
		  </div>
		</div>
		`
		if (url_filepath == undefined) {
			url_line = `
			<div class="card rounded border-success mt-3">
			  <div class="card-header"><div class="row"><div class="col-sm-10"><span class="badge badge-info">${url_index}</span> <span class="badge badge-danger">error</span> ${url_url}</div>
			  	<div class="col-sm-2 text-right"><a href="${url_url}" class="btn btn-info" target="_blank">Goto</a></div>
			  </div></div>
			</div>
			`
		}
		content += url_line
	}
	await ctx.render("view", {content})
});

router.post("/view", async(ctx) => {
	common.validLogin(ctx)
	const content = common.readFile("src/main.html")
	await ctx.render("main", {content})
});

module.exports = router