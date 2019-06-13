
const NLP_API_KEY = 'AIzaSyBy9CeoxXbMk-1CNSOOBn-ATQMPP-yayMs';
const NLP_API_URL = 'https://language.googleapis.com/v1beta2/documents:';
const NLP_METHOD = 'annotateText';


function analyzeEntitySentiment(text){

  let document = {
    type: 'PLAIN_TEXT',
    language: 'en',
    content: text
  }

  let features = {
    "extractSyntax": true,
    "extractEntities": true,
    "extractDocumentSentiment": true,
    "extractEntitySentiment": true,
    "classifyText": true
  }

  let payload = {
    document,
    features,
    encodingType: 'UTF16'
  }

  fetch (NLP_API_URL + NLP_METHOD + '?key=' + NLP_API_KEY, {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify(payload)
  })

  .then(res => {
    if( res.ok ){
      return res.json();
    }
  })

  .then(json => listenForDisplayResultsSubmit(json));
}

function listenForFormSubmit() {
    $('.textForm').on('submit', function analizeProvidedText() {
        event.preventDefault();
        var corpus = $('textarea').val();
        analyzeEntitySentiment(corpus);
    })

}

function listenForDisplayResultsSubmit(data) {
  $('.displayResultsButton').click(function handleData(event) {
      event.preventDefault();
      var reducedText = [];

        /*for (let i=0; i < Object.keys(data.sentences).length; i++) {
          if ((data.sentences[i].sentiment.score * 100) >= 50 
          || (data.sentences[i].sentiment.score * 100) <= -50) 
          {
            reducedText.push(data.sentences[i].text.content + " ");
            console.log(i); 
          }
        }
        */
        for (let i=0; i < Object.keys(data.entities).length; i++) {

          if ((data.entities[i].salience * 100) >= 1) {
            for (let i=0; i < Object.keys(data.sentences).length; i++)
          } 

          if ("wikipedia_url" in data.entities[i].metadata && (data.entities[i].salience * 100) >= 1) {
            $('.resultsList').show();
            $('.resultsList').append(`<li><a href="${data.entities[i].metadata.wikipedia_url}" target="_blank">${data.entities[i].name}</a></li>`)
          }
        }
        
      $('.resultsDisplay').append(`<div>${reducedText}</div>`).val();
      console.log(data);
  });
}


listenForFormSubmit();