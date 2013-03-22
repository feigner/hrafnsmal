HRAFNSMÁL
=========

Visualize a github organization's commits over the last 24 hours, broken down by repository, push and commit.

![ScreenShot](https://raw.github.com/feigner/hrafnsmal/master/img/screenshot.png)

But, more than that, it's an excuse for me to poke around the github API and toy around with d3.js.

Largely based on on John Stasko's Sunburst design [http://www.cc.gatech.edu/gvu/ii/sunburst/], this demo has been cobbled together, inspired by various examples from the d3.js website.

Setup
-----

Update config.js with an OAuth token and the org's event API. Get a one-off token via:

    curl -i -u "username" -d '{"scopes":["repo"]}' https://api.github.com/authorizations

Run it.

    python -m SimpleHTTPServer 8080

-----

How is it with you, ye ravens? 

http://www.archive.org/stream/anglosaxonnorsep00chadrich#page/82/mode/2up
