
const NLP_API_KEY = 'AIzaSyBy9CeoxXbMk-1CNSOOBn-ATQMPP-yayMs';
const NLP_API_URL = 'https://language.googleapis.com/v1beta2/documents:';
const NLP_METHOD = 'annotateText';
var entitiesWithEnoughSalience = [];


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

  .then(json => handleAPIData(json));
}

function listenForFormSubmit() {
    $('.textForm').on('submit', function analizeProvidedText() {
        event.preventDefault();
        var corpus = $('textarea').val();
        analyzeEntitySentiment(corpus);
    })

}

function getEntitiesWithSalience(array) {
  let salientEntities = [];
  for (let i=0; i < Object.keys(array.entities).length; i++ ) {
    if ((array.entities[i].salience * 100) >= 2) {
    salientEntities.push(array.entities[i].name)
    }
  }
  return filterSentencesWithSalienceWords(salientEntities,array.sentences);
}

function filterSentencesWithSalienceWords(words,sentences) {
  let reducedText = [];
  let entitiesAlreadyUsed = [];
  for(let i=0; i < Object.keys(sentences).length; i++) {
    for (let j=0; j < words.length; j++) {
      if (sentences[i].text.content.includes(words[j]) 
      && !reducedText.includes(sentences[i].text.content) 
      && !entitiesAlreadyUsed.includes(words[j])) {
        console.log(words);
        reducedText.push(sentences[i].text.content);
        entitiesAlreadyUsed.push(words[j]);
      }
    }  
  } 
  return reducedText;
}

//this is the function that runs after clicking on analize, it calls getEntitiesWithSalience//
/*function listenForDisplayResultsSubmit(data) {*/
function handleAPIData(data) {
    const reducedText = getEntitiesWithSalience(data)
    for (let i=0; i < Object.keys(data.entities).length; i++) {
      if ("wikipedia_url" in data.entities[i].metadata && (data.entities[i].salience * 100) >= 1) {
        $('.resultsList').show();
        $('.resultsList').append(`<li><a href="${data.entities[i].metadata.wikipedia_url}" target="_blank">${data.entities[i].name}</a></li>`)
      }
    }
    $('.resultsDisplay').append(`<div>${reducedText}</div>`).val();
    console.log(data);
}


$(listenForFormSubmit);