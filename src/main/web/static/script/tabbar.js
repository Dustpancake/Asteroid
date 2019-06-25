function tab_callback(){}

/**
 * Used to add buttons to the end of a particular HTML element
 *
 * @param {Object} div - the element to add a button to
 * @param {string} buttonText - the text to display on the button
 * @param {buttonCallback} callback - the function to call for the 'click' event for the button
 *
 * @returns {Object} button - the DOM object of the button
 */
function generateTabButton(div, buttonText, callback) {
    var button = document.createElement("button");
    button.innerHTML = buttonText; //Setting text
    div.appendChild(button);
    button.addEventListener("click",callback);
    return button;
}

/**
 * Used as a lookup table for tab index to value of the "tab" query keys
 *
 * @param {number} index - the integer index of the tab
 *
 * @returns {string} queryName - the name of the "tab" query string key relating to the index. Returns the empty string "" if the index is out of bounds
 */
function getName(index) {
    switch(index) {
        case 0:
            return "Voting";
            break;
        case 1:
            return "Rating";
            break;
        case 2:
            return "Queue";
            break;
        case 3:
            return "Downloaded";
            break;
        case 4:
            return "Favourites";
            break;
        case 5:
            return "Playlists";
            break;
        case 6:
            return "Settings"
        default:
            return "";
            break;
    }
}

/*
 * The callback for a button click
 * @callback buttonCallback
 */

/**
 * Used to load a particular script based on a valid 'tab' query in the query string
 */
function includeQueryStringScript() {
    var urlParams = new URLSearchParams(location.search);
    if(urlParams.has("tab")) { //check if tab query exists
        var tabName = urlParams.get("tab");
        var scriptName = "" //The location of the script to load in
        switch(tabName) {
            case "Voting":
                tab_callback=function() {
                    includeQueryStringVoteFunc();
                };
                scriptName = "voting.js";
                break;
            case "Rating":
                scriptName = "rating.js"
                break;
            case "Settings":
                tab_callback=function(){
                    populateDivAccount("bodyDiv");
                    tab_callback=function(){};
                    console.log("Loaded in settings menu");
                };
                scriptName = "settings.js"
                break;
            default:
                var message = "No known tab with the name: "+tabName;
                document.getElementById("bodyDiv").innerHTML = message;
                return;
        }
        document.getElementById("scriptFiller").src = "../script/" + scriptName + "?v" + Math.random(); //If a valid tab query is given, loads in the relevant script
    }
}

function voting() {updateQuery({"tab":"Voting","v":Math.random()});}
function rating() {updateQuery({"tab":"Rating","v":Math.random()});}
function settings() {updateQuery({"tab":"Settings","v":Math.random()});}
//function tabs() {updateQuery({"tab":"Tabs","v":Math.random()});}
//function account() {updateQuery({"tab":"Account","v":Math.random()});}

/**
 * Used as a lookup table for values of the "tab" query to javascript functions for button callback
 *
 * @param {string} name - the name of the tab as per the "tab" query: expecting one of ["Voting","Rating","Tabs","Account"]
 *
 * @returns {string|buttonCallback} callback - the relevant callback function for the 'name' string if it matches one of the expected values, or the string "" if it doesn't.
 */
function defaultTabCallback(name) {
    switch(name) {
        case "Voting":
            return voting;
            break;
        case "Rating":
            return rating;
            break;
//        case "Tabs":
//            return tabs;
//            break;
//        case "Account":
//            return account;
//            break;
        case "Settings":
            return settings;
            break;
        default:
            return "";
    }
}

/**
 * Used to ensure that a valid "tabs" cookie exists, and set the cookie to the default value if it doesn't exist
 */
function defaultTabCookies() {
    var configJSON = getConfigJson();
    if (getCookie("tabs") == ""){
        if (configJSON.hasOwnProperty("default_tab_activation")) {
            setCookie("tabs",configJSON["default_tab_activation"],getCookieDuration());
        } else {
            setCookie("tabs","1,0,1,1,1,0",getCookieDuration());
        }
    }
}

/**
 * Used to populate a HTML element with the 'tab' buttons needed depending on the values stored in the "tabs" cookie
 *
 * @param {Object} element - the element to insert buttons into
 * @param {tableCallback} tableCallback - the lookup table for buttons to use
 */
function supplyButtons(element,tabCallback) {
    defaultTabCookies();
    var tabStr = getCookie("tabs")+",1";
    var tabArray = tabStr.split(','); //Which tabs the user wishes to be shown
    for(var i=0; i<tabArray.length; i++) {
        var number = tabArray[i];
        if (number == "1") {
            var callback = tabCallback(getName(i));
            if (typeof callback !== "string") { //Checking that a valid callback exists
                generateTabButton(element, getName(i), callback); //Creating a button with this callback
            }
        }
    }
}


/**
 * Convenience function used to populate the specified div element with the default tabs
 *
 * @param {string} elementname - the id specifying the element to insert tabs into
 */
function supplyTabButtons(elementname) {
    var tabsDiv = document.getElementById(elementname);
    supplyButtons(tabsDiv,defaultTabCallback);
}

current_callback();
