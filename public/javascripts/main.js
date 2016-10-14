$(document).ready(function(){

var socket = io("http://localhost:3000");

$("#btn_prenderLed").click(function(){
	socket.emit("enviandoDatos","Prender");
	});


$("#btn_apagarLed").click(function(){
	socket.emit("enviandoDatos","Apagar");
});

socket.on('mostrarTemp',function(temp){
	jQuery("#temp").text(temp);
	
});

socket.on('mostrarTempMax',function(temp){

	jQuery("#tempMax").text(temp);
});

socket.on('tieneAgua',function(resp){

	jQuery("#agua").text(resp);
});

$("#boton").click(function(){
	socket.emit("enviandoDatos","setearTemp",$('#aa').val());

	alert(jQuery('#aa').val());
console.log(jQuery('#temp').text());
});		

console.log(jQuery('#temp').text());

});

