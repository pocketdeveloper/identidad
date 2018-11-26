
var api_key = 'XPZaEnd3Zf6oapHEDx1vQSENMt48lqmc';
var api_secret = 'hRvA02Vk1Fzx4_9AGvQGMYonUyq50ju2';

module.exports.compareFaces = function(imageUrl1, imageUrl2, callback){
  console.log("Before FacePlus request.");

  var url = 'https://api-us.faceplusplus.com/facepp/v3/compare?api_key=' + api_key + '&api_secret=' + api_secret;
  url+= '&image_url1=' + encodeURIComponent(imageUrl1);
  url+= '&image_url2=' + encodeURIComponent(imageUrl2);
  console.log('url: ' + url);
  Parse.Cloud.httpRequest({
      method: 'POST',
      url: url
  }).then(function(httpResponse) {
      console.log("FacePlus Responded");
      var resp = JSON.parse(httpResponse.text);
      var confidence = resp.confidence;
      callback(null,confidence);
    }, function(httpResponse) {
      callback('Request subscribe failed with response code ' + httpResponse.status + '\n'+ httpResponse.text);
    });
}
