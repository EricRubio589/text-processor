
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
  return filterSentencesWithSalientWords(salientEntities,array.sentences);
}

/*function filterSentencesWithSalientWords(words,sentences) {
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
}*/

function filterSentencesWithSalientWords(words,sentences) {
  let reducedText = [];
  sentences.forEach(sentence => words.forEach(word => {
    if(sentence.text.content.includes(word) && !reducedText.includes(sentence.text.content)) {
      reducedText.push(sentence.text.content);} 
  }));
  console.log(reducedText)
  return reducedText
}


//this is the function that runs after clicking on analize, it calls getEntitiesWithSalience//
/*function listenForDisplayResultsSubmit(data) {*/
function handleAPIData(data) {
    const reducedText = getEntitiesWithSalience(data)
    for (let i=0; i < Object.keys(data.entities).length; i++) {
      if ("wikipedia_url" in data.entities[i].metadata && (data.entities[i].salience * 100) >= 1) {
        $('.resultsList').css('display','flex')
        $('.resultsList').append(`<li><a href="${data.entities[i].metadata.wikipedia_url}" target="_blank">${data.entities[i].name}</a></li>`)
      }
    }
    const articleSentiment = (data.documentSentiment.score) * 10;
    calculateReductionPercentage(reducedText);
    displayArticleSentiment(articleSentiment);
    $('.resultsDisplay').append(`<div>${reducedText}</div>`).val();
    console.log(data);
}
  

  function calculateReductionPercentage(reduced) {
    let stringReducedText = JSON.stringify(reduced).length;
    let stringInputText = $('textarea').val().length;
    let percentageReduced = 100 - (Math.round((stringReducedText * 100) / stringInputText));
    $('.displayReduction').show();
    $('.displayReduction').append(`<div>Original text reduced by ${percentageReduced}%</div>`);
  }


  function displayArticleSentiment(sentimentValue) {
    $('.gaugeImageContainer').css('display','flex');
    if(sentimentValue === 0) {
      $('.gaugeImageContainer').append(`<img src="media/img/gauge0.png" alt="Sentiment measurement for the analized article">`);
      $('.gaugeImageContainer').append('<span>The article\'s sentiment is neutral</span>');
    } else if(sentimentValue === 1 || sentimentValue === 2) {
      $('.gaugeImageContainer').append(`<img src="media/img/gauge+1.png" alt="Sentiment measurement for the analized article">`);
      $('.gaugeImageContainer').append('<span>The article\'s sentiment is slightly positive</span>')
    } else if(sentimentValue === 3 || sentimentValue === 4) {
      $('.gaugeImageContainer').append(`<img src="media/img/gauge+2.png" alt="Sentiment measurement for the analized article">`);
      $('.gaugeImageContainer').append('<span>The article\'s sentiment is positive</span>')
    } else if(sentimentValue === 5 || sentimentValue === 6) {
      $('.gaugeImageContainer').append(`<img src="media/img/gauge+3.png" alt="Sentiment measurement for the analized article">`);
      $('.gaugeImageContainer').append('<span>The article\'s sentiment is quite positive</span>')
    } else if(sentimentValue === 7 || sentimentValue === 8) {
      $('.gaugeImageContainer').append(`<img src="media/img/gauge+4.png" alt="Sentiment measurement for the analized article">`);
      $('.gaugeImageContainer').append('<span>The article\'s sentiment is very positive</span>')
    } else if(sentimentValue === 9 || sentimentValue === 10) {
      $('.gaugeImageContainer').append(`<img src="media/img/gauge+5.png" alt="Sentiment measurement for the analized article">`);
      $('.gaugeImageContainer').append('<span>The article\'s sentiment is extremely positive</span>')
    }
  }


$(listenForFormSubmit);