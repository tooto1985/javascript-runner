var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var fs = require('fs')
var app = express()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.get(/.*\.js/, function (req, res, next) {
  fs.readFile(path.join('public', req.originalUrl), function (err, data) {
    if (err) {
      next()
      return
    }
    var lines = data.toString().split('\n')
    for (var i = 0, max = lines.length; i < max; i++) {
      if (/function.*\(.*\)\s*{/.test(lines[i])) {
        lines[i] = lines[i].replace('\r', '') + ';_cb_(' + i + ');\r'
      }
    }
    lines[++i] = ';function _cb_(n) {\r'
    lines[++i] = '  window._xhr_ = window._xhr_ || new XMLHttpRequest();\r'
    lines[++i] = "  _xhr_.open('GET', '/run?url=" + req.originalUrl + ":' + n, false);\r"
    lines[++i] = '  _xhr_.send();\r'
    lines[++i] = '};\r'
    res.set('Content-Type', 'application/javascript')
    res.send(lines.join('\n'))
  })
})
app.use(express.static(path.join(__dirname, 'public')))
app.get('/run', function (req, res, next) {
  var p = req.query.url.split(':')[0]
  var i = parseInt(req.query.url.split(':')[1])
  var data = fs.readFileSync(path.join('public', p))
  var lines = data.toString().split('\n')
  if (/function.*\(.*\)\s*{.*(?:\/\*(\s\d+\s)\*\/)/.test(lines[i])) {
    var start = lines[i].lastIndexOf('/*') + 2
    var end = lines[i].lastIndexOf('*/')
    var n = parseInt(lines[i].substring(start, end)) + 1
    lines[i] = lines[i].replace(/(function.*\(.*\)\s*{.*\/\*\s)\d+(\s\*\/)/, '$1' + n + '$2')
    fs.writeFileSync(path.join('public', p), lines.join('\n'))
  } else {
    if (/function.*\(.*\)\s*{/.test(lines[i])) {
      lines[i] = lines[i].replace('\r', '') + ' /* 1 */\r'
      fs.writeFileSync(path.join('public', p), lines.join('\n'))
    }
  }
  res.end()
})
app.use(function (req, res, next) {
  next(createError(404))
})
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})
module.exports = app
