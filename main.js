
var google = require('./google.js');
var help = require('./helpers.js');
var faceplus = require('./faceplus.js');

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

	google.googleVision(url, ["LABEL", "FACE", "TEXT", "DOCUMENT_TEXT"], function(error,resp){
		if(error == null){
			response.success(resp);
		}else{
			response.error(error);
		}
	});
});

/*
	En esta funcion, probamos el uso de otras funciones en otros módulos. Vamos a analizar una imagen con el API de Cloud Vision.
	Params: url
*/
Parse.Cloud.define("uploadSelfie", function(request, response) {
	var url = request.params.url;
	var userId = request.params.userId;

	// Primero, vamos a obtener las respuestas del API de google.
	google.googleVision(url, ["LABEL", "FACE"], function(error,resp){
		if(error == null){
			//Con la respuesta del API, tenemos que asegurarnos que exista una cara.
			if(resp.faces == 1){

				//Ahora tenemos que obtener el usuario.
		        var query = new Parse.Query(Parse.User);
		        query.equalTo("objectId", userId);
		        query.first({
		            useMasterKey:true,
		            success: function(user) {
		                if(user != undefined){
		                	user.set('selfie',url);
		                	user.save(null,{useMasterKey:true});
		                	response.success('Selfie ha sido guardada exitosamente');
		                }else{
		                	response.error('¡Ups! No encontramos a ese usuario.');
		                }
		            },
		            error: function(error) {
		                response.error('¡Ups! No encontramos a ese usuario.');
		            }
		        });
			}else{
				response.error('¡Ups! La imagen no parece ser una selfie, por favor intenta de nuevo.');
			}
		}else{
			response.error(error);
		}
	});
});


/*
	En esta funcion, probamos el uso de otras funciones en otros módulos. Vamos a analizar una imagen con el API de Cloud Vision.
	Params: url
*/
Parse.Cloud.define("uploadIne", function(request, response) {
	var url = request.params.url;
	var userId = request.params.userId;

	// Primero, vamos a obtener las respuestas del API de google.
	google.googleVision(url, ["LABEL", "FACE", "TEXT", "DOCUMENT_TEXT"], function(error,resp){
		if(error == null){

			//Con la respuesta del API, tenemos que asegurarnos que exista una cara y que sea un documento
			if(resp.faces > 0 && resp.labels.indexOf('identity document')>=0){

				//Ahorta tenemos que localizar el CURP para asegurarnos

				var curp = getCurp(resp.textAnnotations);
				if(curp == null){
					response.error('¡Ups! La imagen no parece ser una identificación, por favor intenta de nuevo.');
					return;
				}

				//Ahora tenemos que obtener el usuario.
		        var query = new Parse.Query(Parse.User);
		        query.equalTo("objectId", userId);
		        query.first({
		            useMasterKey:true,
		            success: function(user) {
		                if(user != undefined){
		                	user.set('ine',url);
		                	user.set('curp',curp);
		                	user.save(null,{useMasterKey:true});
		                	response.success('Identificación ha sido guardada exitosamente. CURP: ' + curp);
		                }else{
		                	response.error('¡Ups! No encontramos a ese usuario.');
		                }
		            },
		            error: function(error) {
		                response.error('¡Ups! No encontramos a ese usuario.');
		            }
		        });
			}else{
				response.error('¡Ups! La imagen no parece ser una identificación, por favor intenta de nuevo.');
			}
		}else{
			response.error(error);
		}
	});
});


function getCurp(textAnnotations){
	var curp = null;

	if(textAnnotations != undefined){
	  	for (var i = 1; i < textAnnotations.length; i++) {
	  	  	var annotation = textAnnotations[i];
	  	  	var text = annotation.description;//La palabra o texto obtenido
	  	  	if(text.length == 18){// Las CURP tienen 18 caracteres
	  	  	  	console.log(text + ' podria ser CURP');
	  	  	  	if(help.isValidCurp(text)){//Validar con un REGEX
	  	  	  	  	curp = text;
	  	  	  	}
	  	  	}
	  	}
	}
	return curp;
}


Parse.Cloud.define("compareFaces", function(request, response) {
	var userId = request.params.userId;

	//Obtener el usuario.
    var query = new Parse.Query(Parse.User);
    query.equalTo("objectId", userId);
    query.first({
        useMasterKey:true,
        success: function(user) {
            if(user != undefined){
            	console.log('Selfie: ' +user.get('selfie'));
            	console.log('Ine: ' +user.get('ine'));
            	var imageUrl1 = user.get('selfie') || request.params.imageUrl1;
				var imageUrl2 = user.get('ine') || request.params.imageUrl2;

				faceplus.compareFaces(imageUrl1, imageUrl2, function(error,resp){
					if(error == null){
						user.set('confidence',resp);
						user.save(null,{useMasterKey:true});
						if(resp >= 80){
							response.success('Si es la misma persona. Credibilidad: ' +resp );
						}else{
							response.error('¡Ups! No es la misma persona');
						}
					
					}else{
						response.error(error);
					}
				});
            }else{
            	response.error('¡Ups! No encontramos a ese usuario.');
            }
        },
        error: function(error) {
            response.error('¡Ups! No encontramos a ese usuario.');
        }
    });
});


