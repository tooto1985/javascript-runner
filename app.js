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


app.use(/.*\.js/, function(req, res, next) {
  fs.readFile(path.join('public', req.originalUrl), function(err,data) {
    if (err) {
      next();
      return;
    }
    var lines = data.toString().split('\n');
    for(var i=0,max=lines.length;i<max;i++) {
      if (/function.*\(.*\)\s*{\s*[^ /\*\d\*/]*$/.test(lines[i])) {
        lines[i] = lines[i].replace('\r','') + ';console.log(' + (i+1) +');\r';
      }
      console.log(lines[i]);
    }
    res.set('Content-Type', 'application/javascript')
    res.send(lines.join(''));
  })
})


app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', indexRouter);
//app.use('/users', usersRouter);







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
