
require('./google.js');


/******* Primera función, SignUp ********/

/*
	Esta función crea un nuevo objeto User, Parse automáticamente revisa si ya existe o no un usuario.
	Params: name, email, password
*/
Parse.Cloud.define("signUp", function(request, response) {
	var name = request.params.name;
	var email = request.params.email;
	var password = request.params.password;

	var user = new Parse.User();
	user.set("username", email);
	user.set("password", password);
	user.set("email", email);

	// Se pueden agregar los campos adicionales
	user.set("name", name);

	// Seguridad del objeto ¿Quien puede leer y modificar?
	var acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
	acl.setPublicWriteAccess(false);
	user.setACL(acl);

	user.signUp(null, {
		useMasterKey:true,
		success: function(user) {
			console.log('Signup exitoso. '+ user.id)
			response.success('¡Sign Up exitoso! UserId: ' + user.id);
		},
		error: function(user, error) {
			console.log("Error: " + error.code + " " + error.message);
	  	  	response.error("Error: " + error.code + " " + error.message);
	  	}
	});
});


/******* Prueba de Google Vision y modulos  ********/

/*
	En esta funcion, probamos el uso de otras funciones en otros módulos. Vamos a analizar una imagen con el API de Cloud Vision.
	Params: url
*/
Parse.Cloud.define("visionTest", function(request, response) {
	var url = request.params.url;

	var google = require('./google.js');
	google.googleVision(url, ["LABEL", "FACE", "TEXT", "DOCUMENT_TEXT"], function(error,resp){
		if(error == null){
			response.success(resp);
		}else{
			response.error(error);
		}
	});
});



