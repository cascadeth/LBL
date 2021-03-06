// ==UserScript==
// @name     Color Code Ticket Types
// @namespace  http://tampermonkey.net/
// @version   3.0
// @description Color code the tickets based on types in the queue
// @author    Tyler Farnham / Luke Miletta
// @match    https://oregonstate.teamdynamix.com/TDNext/Home/Desktop/*
// ==/UserScript==
var modified = false;
var reports;
var coloredReports = [];

window.setTimeout(items, 100);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    items() is the main function for this script. It creates the button that toggles the color on the tickets and adds the event listeners for the various buttons that
    this script applies to (i.e. the refresh button on the report, the page select buttons on the bottom of the ticket report, and the button that we create to toggle color.

    If something were to break on this script in the future it would likely be the hard coded paths to elements relative to the maxReport that is selected. Some troubleshooting
    that you can do to fix it is confirm that any element.childNodes.childNodes still points to the correct element upon execution.
    */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function items(){
    try{
        reports = document.getElementsByClassName("report-module");
    }
    catch(e){
        window.setTimeout(items, 100);
    }

    if (!(reports.length)){
        return; //Break out of the script if it finds no reports
    }
    var toggleColorButton;
    for(var i = 0; i < reports.length; i++){
        var currentReport = reports[i];
        var currentButtonPosition = currentReport.childNodes[0].childNodes[1];
        // 1. Create the button
        toggleColorButton = document.createElement("i");
        toggleColorButton.innerHTML = "Toggle Color";
        toggleColorButton.setAttribute("class", "fa fa-lg gutter-left-xs");
        toggleColorButton.setAttribute("title", "Toggle Color");
        toggleColorButton.setAttribute("id", "toggle-button-" + i);
        toggleColorButton.setAttribute("style", "border-style: solid; padding: 5px; border-width: 1px; border-radius: 5px;");
        toggleColorButton.parentReport = currentReport;
        // 2. Append somewhere
        currentButtonPosition.appendChild(toggleColorButton);
        currentButtonPosition.insertBefore(toggleColorButton, currentButtonPosition.firstChild);
        // 3. Add event handler
        toggleColorButton.addEventListener ("click", function(){click_form_button(this.id, this.parentReport)});
    }
    //Creates a button that stays docked on the top of the page that toggles whether the tickets are colored by modified date or status.
    var toggleModified = document.createElement("button");
    toggleModified.type = "button"
    toggleModified.innerHTML = "Color By Modified Date";
    toggleModified.setAttribute("class", "fa fa-lg gutter-left-xs");
    toggleModified.setAttribute("title", "toggleModified");
    toggleModified.setAttribute("id", "modifiedButton");
    toggleModified.setAttribute("style", "border-style: solid; padding: 5px; border-width: 1px; border-radius: 5px; background-color: #FFFFFF; margin-top: 7px; border-color: black;");
    var toggleModifiedInsertLocation = document.getElementById("divTabHeader");
    toggleModifiedInsertLocation.appendChild(toggleModified);
    toggleModifiedInsertLocation.insertBefore(toggleModified, toggleModifiedInsertLocation.firstChild);
    toggleModified.onclick = function(){clickToggleModify();};

}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    setColors loops through all of the tickets in the maxReport and sets the color on them according to their status.
    */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function setColors(tickets){
    if(!modified){
        for(var i = 0; i < tickets.length; i++){
            for(var j = 0; j < tickets[i].children.length; j++){ //Makes it select the status attribute of the ticket to check to prevent different report formats from making this fail.
                if(((tickets[i].children)[j].innerHTML) == "Open"){
                    tickets[i].setAttribute("style", "background-color: #d4fce6;");
                }
                else if(((tickets[i].children)[j].innerHTML) == "In Process"){
                    tickets[i].setAttribute("style", "background-color: #76a8f7;");
                }
                else if(((tickets[i].children)[j].innerHTML) == "New"){
                    tickets[i].setAttribute("style", "background-color: #f25757;");
                }
                else if(((tickets[i].children)[j].innerHTML) == "Escalated - Internal"){
                    tickets[i].setAttribute("style", "background-color: #e17efc;");
                }
            }
        }
    }
    else{
        var ticketAttributeBar = tickets[0].parentNode.parentNode.childNodes[1].childNodes[1].childNodes;
        var modifiedPositionIndex = 0;
        for(modifiedPositionIndex; modifiedPositionIndex < ticketAttributeBar.length; modifiedPositionIndex++){
            if(ticketAttributeBar[modifiedPositionIndex].innerText == "Modified"){
                break;
            }
        }
        var ticketModifiedDate = new Date();
        var untouchedDays = 0;
        for(var l = 0; l < tickets.length; l++){
            ticketModifiedDate = tickets[l].children[modifiedPositionIndex - 1].innerText;
            ticketModifiedDate = ticketModifiedDate.split(' ')[1];
            untouchedDays = daysSinceModified(new Date(ticketModifiedDate));
            if(untouchedDays < 2){
                tickets[l].setAttribute("style", "background-color: #76a8f7;");
            }
            else if(untouchedDays < 3){
                tickets[l].setAttribute("style", "background-color: #A6D785;");
            }
            else if(untouchedDays < 4){
                tickets[l].setAttribute("style", "background-color: #ffbb00;");
            }
            else if(untouchedDays < 5){
                tickets[l].setAttribute("style", "background-color: #ff7b3a;");
            }
            else if(untouchedDays >= 5){
                tickets[l].setAttribute("style", "background-color: #f25757;");
            }
        }
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    setColors loops through all of the tickets in the maxReport and removes the coloring from them.
    */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function removeColors(tickets){
    for(var i = 0; i < tickets.length; i++){
        tickets[i].setAttribute("style", "");
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    click_form_button() is executed when you click on the button that we create for this script. It applies the coloring to all of the tickets in the maxReport
    if there was no coloring already and removes the coloring on the tickets if the tickets were colored already.
    */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function click_form_button(buttonID, currentReport){
    var i;

    var toggleColorButton = document.getElementById(buttonID);
    var tickets = ((((((currentReport.childNodes)[1]).childNodes)[1]).childNodes)[3]);//Gets the element that holds all of the tickets
    tickets = tickets.children; //The children of that element are the tickets themselves. This is now an array of tickets.

    if(toggleColorButton.getAttribute("style") == "border-style: solid; padding: 5px; border-width: 1px; border-radius: 5px;"){ //If the button is not pressed then press it and set the colors
        toggleColorButton.setAttribute("style", "border-style: solid; padding: 5px; border-width: 1px; border-radius: 5px; background-color: #2b2b2b; color: #f5f5f5;");
        setColors(tickets);
        coloredReports.push(currentReport);
    }
    else{
        toggleColorButton.setAttribute("style", "border-style: solid; padding: 5px; border-width: 1px; border-radius: 5px;"); //If the button is pressed then un-press it and remove the colors.
        removeColors(tickets);
        for(i = 0; i < coloredReports.length; i++){
            if(coloredReports[i] === currentReport){
                coloredReports.splice(i, 1);
                break;
            }
        }
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    daysSinceModified calculates the number of days between the current date and a date that is passed into it as 'ticketModifiedDate'
    */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function daysSinceModified(ticketModifiedDate){
    var today = new Date();
    var timeDiff = Math.abs(today.getTime() - ticketModifiedDate.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    function executed when the toggle modify button is clicked. Toggles the color coding attribute between status and last modified date.
    */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function clickToggleModify(){
    if(modified){
        modified = false;
    }
    else{
        modified = true;
    }
    var modifiedButton = document.getElementById("modifiedButton");
    for(var i = 0; i < coloredReports.length; i++){
        var currentReport = coloredReports[i];
        var tickets = ((((((currentReport.childNodes)[1]).childNodes)[1]).childNodes)[3]);//Gets the element that holds all of the tickets
        tickets = tickets.children; //The children of that element are the tickets themselves. This is now an array of tickets.
        setColors(tickets);
    }

    if(modifiedButton.getAttribute("style") == "border-style: solid; padding: 5px; border-width: 1px; border-radius: 5px; background-color: #FFFFFF; margin-top: 7px; border-color: black;"){ //If the button is not pressed then press it and set the colors
        modifiedButton.innerHTML = "Color By Status";
        modifiedButton.setAttribute("style", "border-style: solid; padding: 5px; border-width: 1px; border-radius: 5px; background-color: #2b2b2b; color: #f5f5f5; margin-top: 7px; border-color: black;");
    }
    else{
        modifiedButton.innerHTML = "Color By Modified Date";
        modifiedButton.setAttribute("style", "border-style: solid; padding: 5px; border-width: 1px; border-radius: 5px; background-color: #FFFFFF; margin-top: 7px; border-color: black;"); //If the button is pressed then un-press it and remove the colors.
    }
}
