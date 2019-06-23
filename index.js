
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
    } else
    {
      alert("Invalid input, please verify your source and paste again or try a different article")
    }

  })

  .then(json => handleAPIData(json));
}

function listenForFormSubmit() {
    $('.textForm').on('submit', function analyzeProvidedText() {
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

function filterSentencesWithSalientWords(words,sentences) {
  let reducedText = [];
  let sentencesSentiment = [];
  sentences.forEach(sentence => words.forEach(word => {
    if(sentence.text.content.includes(word) && !reducedText.includes(sentence.text.content)) {
      reducedText.push(sentence.text.content);
      sentencesSentiment.push(sentence.sentiment.score);}
  }));
  console.log(reducedText)
  return [reducedText,sentencesSentiment]
}


//this is the function that runs after clicking on analyze, it calls getEntitiesWithSalience//
/*function listenForDisplayResultsSubmit(data) {*/
function handleAPIData(data) {
  const filteredSentencesAndSentiment = getEntitiesWithSalience(data);
  const sentencesSentimentAverage = getSentencesSentimentAverage(filteredSentencesAndSentiment[1]);
  let linksAvailable =0;
  for (let i=0; i < Object.keys(data.entities).length; i++) {
    if ("wikipedia_url" in data.entities[i].metadata && (data.entities[i].salience * 100) >= 1) {
      $('.yesLinksTitle').css('display','flex');
      $('.resultsList').css('display','flex')
      $('.resultsList').append(`<li><a href="${data.entities[i].metadata.wikipedia_url}" target="_blank">${data.entities[i].name}</a></li>`)
      linksAvailable +=1;
    }
    if (linksAvailable <1) { 
      $('.noLinksTitle').css('display','flex');
    }
  }
  calculateReductionPercentage(filteredSentencesAndSentiment[0]);
  const sentencesWithLineBreaks = addLineBreaksToSentences(filteredSentencesAndSentiment[0]);
  displayArticleSentiment(sentencesSentimentAverage);
  $('.resultsDisplay').append(`<div>${sentencesWithLineBreaks.join(' ')}</div>`).val();
  $('.textForm').hide();
  $('.analyzeAnotherArticleButton').css('display','flex');
  console.log(sentencesWithLineBreaks);
}
  
//With this function we calculate the percentage of reduction in the text that's returned to the user//
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
    $('.gaugeImageContainer').append(`<img src="media/img/gauge0.png" alt="Sentiment measurement for the analyzed article">`);
    $('.gaugeImageContainer').append('<span>The article\'s sentiment is neutral</span>');
  } else if(sentimentValue === 1 || sentimentValue === 2) {
    $('.gaugeImageContainer').append(`<img src="media/img/gauge+1.png" alt="Sentiment measurement for the analyzed article">`);
    $('.gaugeImageContainer').append('<span>The article\'s sentiment is slightly positive</span>')
  } else if(sentimentValue === 3 || sentimentValue === 4) {
    $('.gaugeImageContainer').append(`<img src="media/img/gauge+2.png" alt="Sentiment measurement for the analyzed article">`);
    $('.gaugeImageContainer').append('<span>The article\'s sentiment is positive</span>')
  } else if(sentimentValue === 5 || sentimentValue === 6) {
    $('.gaugeImageContainer').append(`<img src="media/img/gauge+3.png" alt="Sentiment measurement for the analyzed article">`);
    $('.gaugeImageContainer').append('<span>The article\'s sentiment is quite positive</span>')
  } else if(sentimentValue === 7 || sentimentValue === 8) {
    $('.gaugeImageContainer').append(`<img src="media/img/gauge+4.png" alt="Sentiment measurement for the analyzed article">`);
    $('.gaugeImageContainer').append('<span>The article\'s sentiment is very positive</span>')
  } else if(sentimentValue === 9 || sentimentValue > 10) {
    $('.gaugeImageContainer').append(`<img src="media/img/gauge+5.png" alt="Sentiment measurement for the analyzed article">`);
    $('.gaugeImageContainer').append('<span>The article\'s sentiment is extremely positive</span>')
  } else if(sentimentValue === -1 || sentimentValue === -2) {
    $('.gaugeImageContainer').append(`<img src="media/img/gauge-1.png" alt="Sentiment measurement for the analyzed article">`);
    $('.gaugeImageContainer').append('<span>The article\'s sentiment is slightly negative</span>')
  } else if(sentimentValue === -3 || sentimentValue === -4) {
    $('.gaugeImageContainer').append(`<img src="media/img/gauge-2.png" alt="Sentiment measurement for the analyzed article">`);
    $('.gaugeImageContainer').append('<span>The article\'s sentiment is negative</span>')
  } else if(sentimentValue === -5 || sentimentValue === -6) {
    $('.gaugeImageContainer').append(`<img src="media/img/gauge-3.png" alt="Sentiment measurement for the analyzed article">`);
    $('.gaugeImageContainer').append('<span>The article\'s sentiment is quite negative</span>')
  } else if(sentimentValue === -7 || sentimentValue === -8) {
    $('.gaugeImageContainer').append(`<img src="media/img/gauge-4.png" alt="Sentiment measurement for the analyzed article">`);
    $('.gaugeImageContainer').append('<span>The article\'s sentiment is very negative</span>')
  } else if(sentimentValue === -9 || sentimentValue < -10) {
    $('.gaugeImageContainer').append(`<img src="media/img/gauge-5.png" alt="Sentiment measurement for the analyzed article">`);
    $('.gaugeImageContainer').append('<span>The article\'s sentiment is extremely negative</span>')
  }
}

//This function returns the application to a state where the user can analyze a different article//
function listenForAnalyzeAnotherArticleButton() {
  $('.analyzeAnotherArticleButton').on('click', function analyzeAnotherArticle() {
    event.preventDefault();
    console.log('analyze another article is working');
  $('.analyzeAnotherArticleButton').hide();
  $('.textForm').css('display','flex');
  $('.textForm textarea').val('');
  $('.resultsDisplay').css('display','flex');
  $('.resultsDisplay').empty();
  $('.resultsList').empty();
  $('.displayReduction').empty();
  $('.gaugeImageContainer').empty();
  $('.noLinksTitle').hide();
  $('.yesLinksTitle').hide();
  })
}

// We get the average sentiment value from the sentences that we are using on our return text. //
function getSentencesSentimentAverage(sentimentValues) {
  let sum = sentimentValues.reduce((previous, current) => current += previous);
  let avg = sum / sentimentValues.length;
  console.log(sum);
  return Math.round(avg * 10);
}


//With this function we add line breaks to create paragraphs so that the return text is easier to read.//
function addLineBreaksToSentences(sentences) {
  for (let i=0; i < sentences.length; i++ ) {
    if (i % 5 === 0) {
      sentences.splice( i , 0, '<br><br><br>');
    }
  }
  return sentences;
}


$(listenForFormSubmit);
$(listenForAnalyzeAnotherArticleButton);