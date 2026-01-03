/* global TrelloPowerUp, parseCardText, generateICS */

var t = TrelloPowerUp.iframe();

var cardTitle = '';

// Download ICS file
function downloadICS(icsContent, filename) {
  var blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Show result message
function showResult(message, isError) {
  var resultDiv = document.getElementById('result');
  resultDiv.textContent = message;
  resultDiv.className = 'result ' + (isError ? 'error' : 'success');
  resultDiv.style.display = 'block';
}

// Generate and download ICS from card title
document.getElementById('generateBtn').addEventListener('click', function() {
  try {
    var parsed = parseCardText(cardTitle);
    var icsContent = generateICS(parsed);
    var filename = (parsed.title || 'event').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.ics';
    downloadICS(icsContent, filename);
    showResult('✓ ICS file downloaded successfully!', false);
  } catch (error) {
    showResult('Error: ' + error.message, true);
  }
});

// Load and display card title
t.render(function(){
  return t.card('name')
  .then(function(card){
    cardTitle = card.name;
    document.getElementById('cardTitle').textContent = cardTitle;
  })
  .then(function(){
    t.sizeTo('#app');
  });
});