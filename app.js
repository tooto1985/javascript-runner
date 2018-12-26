var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var fs = require('fs');

//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());




app.get(/.*\.js/, function(req, res, next) {
  fs.readFile(path.join('public', req.originalUrl), function(err,data) {
    if (err) {
      next();
      return;
    }
    var lines = data.toString().split('\n');
    for(var i=0,max=lines.length;i<max;i++) {
      if (/function.*\(.*\)\s*{\s*[^ /\*\d\*/]*$/.test(lines[i])) {
        lines[i] = lines[i].replace('\r','') + ";try{}finally{var _x_=_x_||new XMLHttpRequest();_x_.open('GET','/run?url=" + req.originalUrl + ":" + i + "');_x_.send()};\r";
      }
      //console.log(lines[i]);
    }
    res.set('Content-Type', 'application/javascript')
    res.send(lines.join('\n'));
  })
})


app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', indexRouter);
//app.use('/users', usersRouter);


app.get("/run", function(req, res) {
  //console.log(req.query);
  var p = req.query.url.split(':')[0];
  var i = parseInt(req.query.url.split(':')[1]);
  var data = fs.readFileSync(path.join('public', p));
  if (!data) {
    next();
    return;
  }
  var lines = data.toString().split('\n');
  console.log(lines);
  if (lines[i].indexOf(' /*run*/') > -1) {
    res.end();
    return;
  }
  lines[i] = lines[i].replace('\r','') + ' /*run*/\r';
  fs.writeFileSync(path.join('public', p),lines.join('\n'))
  res.end();
})




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
