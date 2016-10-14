var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// var SerialPort = require('serialport').SerialPort;
var email   = require("emailjs");

/*firmata*/
var Board = require("firmata");
var MaxTemp;
var tempActual;
var board = new Board('COM13',{baudRate:9600});
// OneWire ourWire(9);
board.on("ready", function() {


  console.log("conectado con arduino");


  board.pinMode(7,board.MODES.OUTPUT);
  board.pinMode(6,board.MODES.OUTPUT);
  board.pinMode(9,board.MODES.ONEWIRE);
  board.pinMode(10,board.MODES.INPUT);

  function inicializar(){
    /*funcion para obtener valor de termotupla*/
    board.sendOneWireRead(9,board.sendOneWireSearch(9,function(error,devices){


      if(error != null)
        console.log(error);
      else{
              //obtiene el dispositivo de un array que devuelve la funcion
              var dev = devices[0];  
            }


            board.sendOneWireReset(9);

            board.sendOneWireWrite(9,dev,0x44);

            board.sendOneWireDelay(9,5000);

            board.sendOneWireReset(9);

            board.sendOneWireWriteAndRead(9, dev, 0xBE, 9, function(error,data){
              var bin = (data[1]<<8) | data[0];
              var celcius = bin / 16.0;
        

              /*leer datos de medidor de nivel y notificar en el sitio si contiene agua o no*/
              board.analogRead(10, function(value){

                                // console.log(value);
                                if(value>20){

                                  io.emit('tieneAgua','SI');
                                  
                                }else{

                                  io.emit('tieneAgua','NO');
                  }

                });

              tempActual = celcius;
              io.emit('mostrarTemp',tempActual);
              if (MaxTemp == null){
                MaxTemp = "No seteada aún";
              }
              io.emit('mostrarTempMax',MaxTemp);


              if(tempActual>=MaxTemp && MaxTemp!='undefined'){
                board.digitalWrite(7,board.HIGH);
                board.digitalWrite(6,board.HIGH);
              }


            })
            return dev;
          }), 1 , function(error,data){
      console.log(error);
      console.log(data);

    });
  };


  setInterval(inicializar,5000);

  var contador = 0;


              });  



function actualizarDatos(){

  console.log(contador);
  console.log("esta aca");
  contador++;


}


/*funcion para enviar mail que recibe como parametro el mensaje*/
function enviarMail(mensaje){
  console.log("entra a la function");

  var server  = email.server.connect({
   user:    "cocheschro@gmail.com", 
   password: "nacional1", 
   host:    "smtp.gmail.com", 
   ssl: true
 });


  var message = {
   text:    mensaje, 
   from:    "you <cocheschro@gmail.com>", 
   to:      "someone <josemariaschroeder@gmail.com>",
   cc:      "else <njguibert@gmail.com>",
   subject: "actividad en el calentador de agua"
 };

// send the message and get a callback with an error or details of the message that was sent
server.send(message, function(err, message) { console.log(err || message); });

}



var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

//codigo agregado
var socket_io = require("socket.io");
var io = socket_io();
app.io = io;




io.on('connection',function(socket){
  console.log("Se conecto un usuario");

  

  socket.on('enviandoDatos',function(datos,temp){
    console.log("socket");




    switch(datos){
        case 'Prender':
        mensaje = "Se encendió el calentador de agua";
        console.log("Notifico PrenderCalentador a Arduino\n");
          board.digitalWrite(7,board.LOW);
          board.digitalWrite(6,board.LOW);
          enviarMail(mensaje);
       
        
        break;
        case 'Apagar':

          board.digitalWrite(7,board.HIGH);
          board.digitalWrite(6,board.HIGH);
          console.log("Notifico ApagarCalentador a Arduino\n");
        
        break;
        case 'setearTemp':
          mensaje = "Se seteó una nueva temperatura maxima en el calentador de agua";
          
          MaxTemp = temp;
          enviarMail(mensaje);
          console.log("se seteo temperatura maxima y es: " + temp);
        break;
      }
      
      console.log("enviarDatosMethod");
    })
});


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//incluye boostrap
app.use(express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));




app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
