
//LABEL, FACE, TEXT, DOCUMENT_TEXT
module.exports.googleVision = function(imageUrl, features, callback){
  console.log("Before GOOGLE VISION request.");

  var googleFeatures = [];
  for (var i = 0; i < features.length; i++) {
    var feature = {
      "type": features[i].toUpperCase()+ "_DETECTION"
    }
    googleFeatures.push(feature);
  }
 
  //Parámetros para el Request de Cloud Vision
  var parameters = {
    "requests": [
      {
        "features": googleFeatures,
        "image": {
          "source": {
            "imageUri": imageUrl
          }
        }
      }
    ]
  }

  
  var params = JSON.stringify(parameters);
  Parse.Cloud.httpRequest({
      method: 'POST',
      url: "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBL0QYPScnrjHML8i9Kq5VLXVuqoiM_34o",
      body: params
  }).then(function(httpResponse) {
      console.log("Google Responded");

      var resp = JSON.parse(httpResponse.text);
      var labelAnnotations = resp.responses[0].labelAnnotations;
      var faces = resp.responses[0].faceAnnotations;
      var labels = [];

      for (var i = 0; i < labelAnnotations.length; i++) {
        labels.push(labelAnnotations[i].description);
      }

      var fullTextAnnotation = resp.responses[0].fullTextAnnotation;
      var textAnnotations = resp.responses[0].textAnnotations;

      if(fullTextAnnotation != undefined){
        var fullText = fullTextAnnotation.text;
        console.log('FullText: ' + fullText);
      }


      console.log("Labels: " + labels.toString());

      // Respuesta modificada
      var googleResponse = {
        "labels":labels,
        "fullText":fullText,
        "textAnnotations":textAnnotations
      };

      if(faces != undefined){
        googleResponse.faces = faces.length
      }
      callback(null,googleResponse);
  });
}
