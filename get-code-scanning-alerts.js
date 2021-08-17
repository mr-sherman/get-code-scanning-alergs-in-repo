#!/usr/bin/env node

require('dotenv').config()
const pReduce = require('./lib/p-reduce');
const delay = require('delay');
const { Octokit } = require('@octokit/rest')

var buffer = ""

const [, , ...args] = process.argv
const repo_path = args[0]
var base_url = ''
if (args.length > 1)
  base_url = args[1]

if (base_url.slice(-1) == '/')
  base_url = base_url.slice(0, -1)
if (base_url.length > 0) {
  octokit = new Octokit({
    auth: process.env.GH_AUTH_TOKEN,
    previews: ['dorian-preview'],
    baseUrl: base_url + '/api/v3'
  });
}
else {
  octokit = new Octokit({
    auth: process.env.GH_AUTH_TOKEN,
    previews: ['dorian-preview']
  });
}

console.log("repo,tool,rule_id,severity,open,created_at,closed_by,closed_at,url,closed_reason")
octokit
  .paginate("GET /repos/:repo/code-scanning/alerts?per_page=100", {
    repo: repo_path
  })
  .then(alerts => {
    if (alerts.length > 0) {

      pReduce(alerts, (alert) => {
        console.log(`${repo_path},${alert.tool.name},${alert.rule.id},${alert.rule.severity},${alert.state},${alert.created_at},${alert.dismissed_by},${alert.dismissed_at},${alert.html_url},${alert.dismissed_reason}`)
      })
    }
    delay(300);
  })
  .catch(error => {
    console.error(`Getting repositories for repo ${repo_path} failed.
          ${error.message} (${error.status})
          ${error.documentation_url}`)
  })
