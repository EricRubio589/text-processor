
const NLP_API_KEY = 'AIzaSyBy9CeoxXbMk-1CNSOOBn-ATQMPP-yayMs';
const NLP_API_URL = 'https://language.googleapis.com/v1beta2/documents:';
const NLP_METHOD = 'analyzeSentiment';


function analyzeEntitySentiment(text){

  let document = {
    type: 'PLAIN_TEXT',
    language: 'en',
    content: text
  }

  let payload = {
    document,
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
  .then(json => listenForDisplayResultsSubmit(json))
    /*
    answerArray = res.json();
    answerArray = JSON.stringify(json); 
    console.log('Received from server:', JSON.stringify(json));
  })*/
  ;

}

function listenForFormSubmit() {
    $('.textForm').on('submit', function analizeProvidedText() {
        event.preventDefault();
        var corpus = $('textarea').val();
        analyzeEntitySentiment(corpus);
        /*console.log('this is the answerArray', answerArray);*/
    })

}

function listenForDisplayResultsSubmit(data) {
    /*$('.resultsDisplayContainer').on('click', '.displayResultsButton', function handleData(event) {
    event.preventDefault();
    console.log('Show results is working') 
    $('.resultsDisplay').append(answerArray).val();    
    });*/

    $('.displayResultsButton').click(function handleData(event) {
        event.preventDefault();
        console.log(data);
        /*console.log('Show results is working');*/
        let reducedText;
         for (let i=0; i < data.length; i++) {
            if (data.sentences[i].sentiment.score.val() >= 0.1);
            reducedText += data.sentences[i].text.content;
         }
        $('.resultsDisplay').append(`<div>${reducedText}</div>`).val();
    });
}


listenForFormSubmit();
/*listenForDisplayResultsSubmit();*/