var express = require('express')
  , app = express()
  , request = require('request')

app.configure(function() {
  app.use(express.bodyParser())
})

app.post('/:project', function(req, res) {

  console.log('Payload received:', req.body)

  req.body.payload = JSON.parse(req.body.payload)

  var project = req.body.payload.project
    , branch = req.body.payload.branch
    , repoUrl = process.env.STRIDER_URL + project
    , success = req.body.payload['test_exitcode'] === 0
    , messageSuffix = ' on ' + branch + ' - <' + repoUrl + '|' + project + '>'
    , messagePrefix = 'SUCCESS - Tests have passed successfuly'

  if (!success) {
    messagePrefix = 'FAILURE - Tests have failed'
    messageSuffix += ' @channel'
  }

  var data =
        { channel: '#' + req.params.project
        , username: 'striderbot'
        , 'icon_url': 'https://avatars1.githubusercontent.com/u/2199591?s=140'
        , text: messagePrefix + messageSuffix
        }
    , token = process.env.SLACK_TOKEN
    , url = 'https://clock.slack.com/services/hooks/incoming-webhook?token=' + token

  data['link_names'] = 1

  request.post(
    { url: url
    , json: true
    , body: data
    }
  , function(error, response, body) {
      if (error) {
        console.log(error)
        return res.send(500)
      }
      console.log('Slack response:', body)
      res.send(200)
    }
  )
})

var port = process.env.PORT || 6200
app.listen(port, function() {
  console.log('Listening on ' + port)
})
