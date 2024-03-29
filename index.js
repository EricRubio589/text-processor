
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
        $('.submitButton').hide();
    })

}



//this is the function that runs after clicking on analyze, it calls getEntitiesWithSalience//
function handleAPIData(data) {
  const filteredSentencesAndSentiment = getEntitiesWithSalience(data);
  const sentencesSentimentAverage = getSentencesSentimentAverage(filteredSentencesAndSentiment[1]);
  $('.resultsListContainer').css('display','flex');
  let linksAvailable =0;
  for (let i=0; i < Object.keys(data.entities).length; i++) {
    if ("wikipedia_url" in data.entities[i].metadata && (data.entities[i].salience * 100) >= 1) {
      $('.yesLinksTitle').css('display','flex');
      $('.resultsList').css('display','flex')
      $('.resultsList').append(`<li><a href="${data.entities[i].metadata.wikipedia_url}" target="_blank">${data.entities[i].name}</a></li>`)
      linksAvailable +=1;
    }
  }
  if (linksAvailable <1) { 
    $('.noLinksTitle').css('display','flex');
  }
  calculateReductionPercentage(filteredSentencesAndSentiment[0]);
  const sentencesWithLineBreaks = addLineBreaksToSentences(filteredSentencesAndSentiment[0]);
  displayArticleSentiment(sentencesSentimentAverage);
  $('.resultsDisplay').css('display','flex');
  $('.resultsDisplay').append(`<div>${sentencesWithLineBreaks.join(' ')}</div>`).val();
  $('.textForm').hide();
  $('.analyzeAnotherArticleButton').css('display','flex');
}

//These two functions work in conjuction as when the first one is called from handleAPIData it gets the values //
//for the entities with the most salience and then it passed that array to be compared with the sentences on   //
//filterSentencesWithSalientWords and this last one returns the sentences that contain those salient entities.  //                                                                                                                                //
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
  return [reducedText,sentencesSentiment]
}

//With this function we calculate the percentage of reduction in the text that's returned to the user//
function calculateReductionPercentage(reduced) {
  let stringReducedText = JSON.stringify(reduced).length;
  let stringInputText = $('textarea').val().length;
  let percentageReduced = 100 - (Math.round((stringReducedText * 100) / stringInputText));
  $('.displayReduction').show();
  $('.displayReduction').append(`<div>Original text reduced by ${percentageReduced}%</div>`);
}

//This array will help us on the function displayArticleSentiment to display the right sentiment reading for the article//
const SENTIMENTS = [
  { minSentiment: -9,   gauge: "-5",   description: 'extremely negative' },
  { minSentiment: -8,   gauge: "-4",   description: 'very negative' },
  { minSentiment: -6,   gauge: "-3",   description: 'quite negative' },
  { minSentiment: -4,   gauge: "-2",   description: 'negative' },
  { minSentiment: -2,   gauge: "-1",   description: 'slightly negative' },
  { minSentiment: 0,    gauge: "0",    description: 'neutral' },
  { minSentiment: 1,    gauge: "+1",   description: 'slightly positive' },
  { minSentiment: 3,    gauge: "+2",   description: 'positive' },
  { minSentiment: 5,    gauge: "+3",   description: 'quite positive' },
  { minSentiment: 7,    gauge: "+4",   description: 'very positive' },
  { minSentiment: 9,    gauge: "+5",   description: 'extremely positive' }
];

//this function appends the right information on the html to display the sentiment reading by using sentimentValue//
function displayArticleSentiment(sentimentValue) {
  $('.gaugeImageContainer').css('display','flex');
    let sentiment = SENTIMENTS.find( s => s.minSentiment >= sentimentValue );
  $('.gaugeImageContainer').append(`
      <img src="media/img/gauge${sentiment.gauge}.png" alt="Sentiment for this article is ${sentiment.description}">
      <span>The article\'s sentiment is ${sentiment.description}</span>`);
}      

//This function returns the application to a state where the user can analyze a different article//
function listenForAnalyzeAnotherArticleButton() {
  $('.analyzeAnotherArticleButton').on('click', function analyzeAnotherArticle() {
    event.preventDefault();
  $('.analyzeAnotherArticleButton').hide();
  $('.textForm').css('display','flex');
  $('.submitButton').show();
  $('.textForm textarea').val('');
  $('.resultsDisplay').hide();
  $('.resultsDisplay').empty();
  $('.resultsList').empty();
  $('.displayReduction').empty();
  $('.resultsListContainer').hide();
  $('.gaugeImageContainer').hide();
  $('.gaugeImageContainer').empty();
  $('.noLinksTitle').hide();
  $('.yesLinksTitle').hide();
  })
}

// We get the average sentiment value from the sentences that we are using on our return text. //
function getSentencesSentimentAverage(sentimentValues) {
  let sum = sentimentValues.reduce((previous, current) => current += previous);
  let avg = sum / sentimentValues.length;
  return Math.round(avg * 10);
}


//With this function we add line breaks to create paragraphs so that the return text is easier to read.//
function addLineBreaksToSentences(sentences) {
  for (let i=1; i < sentences.length; i++ ) {
    if (i % 5 === 0) {
      sentences.splice( i , 0, '<br><br><br>');
    }
  }
  return sentences;
}


$(listenForFormSubmit);
$(listenForAnalyzeAnotherArticleButton);