/** 
 * Modifications to "ShowJournal.js" by Ryerson University Library
 * 
 * Modified to... just fix everything.
 **/
$('head').append('<link rel="stylesheet" href="https://local.4libs.org/apps/summon/ShowJournal.css" type="text/css" />');

/** 
 * Finds an h3 with text "Journal & Book" in the right pane, grabs it's 
 * parent li (only if the li has the .content class), and hides said li.
 * 
 * Why? I don't know. Why didn't the page just render with that li hidden in
 * the first place?
 * 
 * Also... I don't think that this li element even exists...
 **/
$('div#rightPane div.customSections li h3[ng-bind="::section.title"]')
  .filter(function (index) { return $(this).text() == "Journal & Book" })
  .parent(".content")
  .css("display", "none");

/** 
 * This forcibly unhides the first li in the customSections div. 
 * 
 * I'm not sure why they render it, then hide it via JS. Also, why do they use 
 * such a generic selector to hide it?
 **/
$('div#rightPane div.customSections li').first().css("display", "block");

setTimeout(function () {
  callAtoZ();
}, 500);

function callAtoZ() {
  // gets the ?q= query parameter from the current URL
  var currentQuery = getQueryParameter(location.href, "q");
  var libhash = getParam('libhash');
  var baseUrl = "https://local.4libs.org/apps/summon/GetJournalAndBook.php";

  var yql = baseUrl + "?libhash=" + libhash + "&title=" + currentQuery;
  $.ajax({
    type: 'GET',
    dataType: 'jsonp',
    crossDomain: true,
    url: yql,
    success: successCallback
  });
}

/** 
 * Added by Ryerson University Library
 * 
 * Moves the callback out of the ajax options to make the code readable.
 * Also fixes a bunch of terrible code in the original function.
 * Also removes a bunch of unused/repeated code in the original function.
*/

var successCallback = function (data) {
  // generate journalsHTML
  var journalsHTML = "";
  if ( !onlyBook() ) {
    var journalData = data.filter(function (i) { return i['format'] == 'journal'; });
    journalsHTML += generateTitlesHTML(journalData);
  }

  // generate booksHTML
  var booksHTML = "";
  if ( !onlyJournal() ) {
    var bookData = data.filter(function (i) { return i['format'] == 'book'; });
    booksHTML += generateTitlesHTML(bookData);
  }

  // Struture the HTML to be added to #mydiv < lol wtf
  var html = "<div>";
  if (journalsHTML.trim().length > 0) {
    html += "<a href='#' class='format'>Journal</a><br>";
    html += journalsHTML;
    html += '<br>';
  }
  if (booksHTML.trim().length > 0) {
    html += "<a href='#' class='format'>Book</a><br>"
    html += booksHTML;
  }
  html += "</div>";

  // This is actually stupid.
  $('div#mydiv').html(html);

  /** 
   * This is also pretty dumb. Why would you do this when you injected CSS at
   * the beginning of this script?
  */
  // TODO: remove this garbage.
  $('.format').css({
    "background-color": "#29b6f6",
    "-moz-border-radius": "3px",
    "-webkit-border-radius": "3px",
    "border-radius": "3px",
    "border": "0.3px solid  #e0e0e0 ",
    "display": "inline-block",
    "cursor": "pointer",
    "color": "#ffffff",
    "font-family": "Arial",
    "font-size": "13px",
    "font-weight": "bold",
    "padding": "5px 11px",
    "width": "100%",
    "text-decoration": "none"
  });
}

// Added by Ryerson University Library
function generateTitlesHTML(data) {
  html = "";
  for (var i = 0; i < data.length; i++) {
    var title = data[i]['title'];
    var pidentifer = data[i]['pidentifer'];
    var eidentifer = data[i]['eidentifer'];
    html += generateHoldingsTitleHTML(title, pidentifer, eidentifer);
    html += generateHoldingsHTML(data[i]['holdings']);
  }
  return html;
}

// Added by Ryerson University Library
function generateHoldingsTitleHTML(title, pidentifer, eidentifer) {
  var nbsp = "&nbsp;";
  var comma = ",";

  var html = '';
  if (title) {
    html += "<span><b>" + title + "</b></span> ";
  }
  if (pidentifer) {
    html += "<span>" + pidentifer + "</span>";
  }
  if (eidentifer) {
    if (pidentifer)
      html += comma + nbsp + "<span>" + eidentifer + "</span>";
    else
      html += "<span>" + eidentifer + "</span>";
  }
  return html;
}

// Added by Ryerson University Library
function generateHoldingsHTML(holdingsData) {
  // This is dumb. But it's the way the data is structured so whatever.
  var numHoldings = holdingsData['dbname'].length;

  var html = "";
  for (var j = 0; j < numHoldings; j++) {
    var dbName = holdingsData['dbname'][j];
    var dbUrl = holdingsData['url'][j];
    var startDate = holdingsData['startdate'][j];
    var endDate = holdingsData['enddate'][j];

    var dbLine = "<div style='text-indent:15px'>";
    if (dbName && dbUrl) {
      dbLine += "<a target='_blank' href='" + dbUrl + "'>" + dbName + "</a>";
    }
    else if (dbName) {
      dbLine += dbName;
    }

    dbLine += generateDateStringHTML(startDate, endDate)

    dbLine += "</div>";
    html += dbLine;
  }

  return html;
}

// Added by Ryerson University Library
function generateDateStringHTML(startDate, endDate) {
  var nbsp = "&nbsp;";

  var html = '';
  if (startDate) {
    html += nbsp + "from" + nbsp + startDate;
    if (endDate) {
      html += nbsp + "to" + nbsp + endDate;
    } else {
      html += nbsp + "to present";
    }
  }
  return html;
}

// Checks if the 'book' parameter is set
// Added by Ryerson University Library
function onlyBook() {
  var book = getParam('book');
  if (book !== undefined && book === 'true') {
    return true;
  }
  return false;
}

// Checks if the 'journal' parameter is set
// Added by Ryerson University Library
function onlyJournal() {
  var journal = getParam('journal');
  if (journal !== undefined && journal === 'true') {
    return true;
  }
  return false;
}

// Added by Ryerson University Library
function getParam(paramName) {
  // Finds the script src for ShowJournal.js
  var scripts = document.getElementsByTagName('script');
  var myScript;
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].src.search("ShowJournal.js") > 0) {
      myScript = scripts[i].src;
      break;
    }
  }

  // Grabs everything after ? from the script src
  var queryString = myScript.replace(/^[^\?]+\??/, '');

  var params = parseQuery(queryString);
  return params[paramName];
}

function parseQuery(query) {
  var Params = new Object();
  if (!query) return Params; // return empty object
  var Pairs = query.split(/[;&]/);
  for (var i = 0; i < Pairs.length; i++) {
    var KeyVal = Pairs[i].split('=');
    if (!KeyVal || KeyVal.length != 2) continue;
    var key = unescape(KeyVal[0]);
    var val = unescape(KeyVal[1]);
    val = val.replace(/\+/g, ' ');
    Params[key] = val;
  }
  return Params;
}

function getQueryParameter(source, parameterName) {
  var queryString = source;
  var parameterName = parameterName + "=";

  if (queryString.length > 0) {
    begin = queryString.lastIndexOf(parameterName);
    if (begin != -1) {
      begin += parameterName.length;
      end = queryString.lastIndexOf("&", begin);
      if (end == -1 || begin >= end) {
        end = queryString.length
      }
      return queryString.substring(begin, end);
    }
  }
  return "null";
}