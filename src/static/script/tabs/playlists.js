"use strict"

var PLAYLISTS = (function(){

var playlist_table = "";

function _clonePlaylist(hashkey) {
    return function() {
        TOOLS.PLAYLISTS.clonePlaylist(hashkey,"private");
        BODY_CONTENT.clear();
        BODY_CONTENT.populate();
    }
}

function _viewPlaylist(hashkey) {
    return function() {
        TOOLS.QUERIES.virtualRedirect("Voting","Playlist",{"playlist":hashkey});
    };
}

function _deletePlaylist(hashkey) {
    return function() {
        playlist_table.rows[i+1].style.display = "None";
        TOOLS.PLAYLISTS.deletePlaylist(hashkey);
    }
}

function _createPlaylist(nameInput,privacyInput) {
    return function() {
        if (nameInput.value != "") {
            TOOLS.PLAYLISTS.createPlaylist(nameInput.value,privacyInput.value);
            TOOLS.QUERIES.virtualRedirect("Voting","Downloads");
        }
    }
}


function _setNameFromInput(cell,hashkey) {
    return function() {
        var newName = cell.firstElementChild.value;
        cell.removeChild(cell.firstElementChild);
        if (newName !== "") {
            cell.innerText = newName;
            TOOLS.PLAYLISTS.renamePlaylist(hashkey,newName);
        } else {
            cell.innerText = PLAYLISTS.userPlaylistInfo[hashkey]["Name"];
        }
        cell.onclick = _makeNameInput(cell,hashkey);
    };
}

function _setPrivacy(hashkey,input) {
    return function() {
        TOOLS.PLAYLISTS.changePlaylistPrivacy(hashkey,input.value);
    }
}

function _makeNameInput(cell,hashkey) {
    return function() {
        var currName = cell.innerText;
        cell.innerText = "";
        var input = document.createElement("input");
        input.value = currName;
        input.onchange = _setNameFromInput(cell,hashkey);
        cell.appendChild(input);
        cell.onclick = function() {};
    };
}

function _makePrivacyInput(select) {
    var privateOpt = document.createElement("option");
    privateOpt.innerText = "Private";
    privateOpt.value = "private";
    var viewableOpt = document.createElement("option");
    viewableOpt.innerText = "Publically Viewable";
    viewableOpt.value = "viewable";
    var editableOpt = document.createElement("option");
    editableOpt.innerText = "Publically Editable";
    editableOpt.value = "editable";
    select.appendChild(privateOpt);
    select.appendChild(viewableOpt);
    select.appendChild(editableOpt);
}

return {
populateBody:function(){
    var subtab = TOOLS.QUERIES.getCurrentSubtabName();
    if (subtab === "My Playlists") {
        playlist_table = document.createElement("table");
        var newRow = playlist_table.insertRow(0);
        var labels = ["Name","Size","View","Clone","Privacy","Remove"];
        for (var i = 0; i < labels.length; i++) {
            var newCell = document.createElement("th");
            newCell.innerText = labels[i];
            newRow.appendChild(newCell);
        }
        var favHash = PLAYLISTS.userPlaylistInfo["(favourites)"].HashID;
        {
            var newRow = playlist_table.insertRow(-1);
            var nameCell = newRow.insertCell(-1);
            nameCell.innerText = "Favourites";
            var sizeCell = newRow.insertCell(-1);
            sizeCell.innerText = PLAYLISTS.userPlaylistInfo["(favourites)"]["Size"];
            var viewCell = newRow.insertCell(-1);
            var viewButton = document.createElement("button");
            viewButton.innerText = "View";
            viewButton.onclick = function(){TOOLS.QUERIES.virtualRedirect("Voting","Favourites")};
            viewCell.appendChild(viewButton);
            var cloneCell = newRow.insertCell(-1);
            var cloneButton = document.createElement("button");
            cloneButton.innerText = "Clone";
            cloneButton.onclick = _clonePlaylist("(favourites)");
            cloneCell.appendChild(cloneButton);
        }
        for (var hashkey in PLAYLISTS.userPlaylistInfo) {
            if (hashkey !== favHash && PLAYLISTS.userPlaylistInfo.hasOwnProperty(hashkey)) {
                var newRow = playlist_table.insertRow(-1);
                var nameCell = newRow.insertCell(-1);
                nameCell.innerText = PLAYLISTS.userPlaylistInfo[hashkey]["Name"];
                nameCell.onclick = _makeNameInput(nameCell,hashkey);
                var sizeCell = newRow.insertCell(-1);
                sizeCell.innerText = PLAYLISTS.userPlaylistInfo[hashkey]["Size"];
                var viewCell = newRow.insertCell(-1);
                var viewButton = document.createElement("button");
                viewButton.innerText = "View";
                viewButton.onclick = _viewPlaylist(hashkey);
                viewCell.appendChild(viewButton);
                var cloneCell = newRow.insertCell(-1);
                var cloneButton = document.createElement("button");
                cloneButton.innerText = "Clone";
                cloneButton.onclick = _clonePlaylist(hashkey);
                cloneCell.appendChild(cloneButton);
                var privacyCell = newRow.insertCell(-1);
                var privacyInput = document.createElement("select");
                _makePrivacyInput(privacyInput);
                privacyInput.onchange = _setPrivacy(hashkey,privacyInput);
                privacyCell.appendChild(privacyInput);
                var removeCell = newRow.insertCell(-1);
                var removeButton = document.createElement("button");
                removeButton.innerText = "Delete";
                removeButton.onclick = _deletePlaylist(hashkey);
                removeCell.appendChild(removeButton);
            }
        }
        BODY_CONTENT.appendNode(playlist_table);
    } else if (subtab === "Add Playlist") {
        BODY_CONTENT.appendText("Playlist name:","b");
        BODY_CONTENT.appendBreak();
        var nameInput = document.createElement("input");
        BODY_CONTENT.appendNode(nameInput);
        BODY_CONTENT.appendBreak();
        BODY_CONTENT.appendText("Playlist privacy:","b");
        BODY_CONTENT.appendBreak();
        var privacyInput = document.createElement("select");
        _makePrivacyInput(privacyInput);
        BODY_CONTENT.appendNode(privacyInput);
        BODY_CONTENT.appendBreak();
        var createButton = document.createElement("button");
        createButton.innerText = "Create!";
        createButton.onclick = _createPlaylist(nameInput,privacyInput);
        BODY_CONTENT.appendNode(createButton);
    } else if (subtab === "Public Playlists") {
        playlist_table = document.createElement("table");
        var newRow = playlist_table.insertRow(0);
        var labels = ["Name","Owner","Size","View","Make Private Copy"];
        for (var i = 0; i < labels.length; i++) {
            var newCell = document.createElement("th");
            newCell.innerText = labels[i];
            newRow.appendChild(newCell);
        }
        for (var hashkey in PLAYLISTS.publicPlaylistInfo) {
            if (PLAYLISTS.publicPlaylistInfo.hasOwnProperty(hashkey)) {
                var newRow = playlist_table.insertRow(-1);
                var nameCell = newRow.insertCell(-1);
                nameCell.innerText = PLAYLISTS.publicPlaylistInfo[hashkey]["Name"];
                var ownerCell = newRow.insertCell(-1);
                ownerCell.innerText = PLAYLISTS.publicPlaylistInfo[hashkey]["OwnerName"];
                var sizeCell = newRow.insertCell(-1);
                sizeCell.innerText = PLAYLISTS.publicPlaylistInfo[hashkey]["Size"]
                var viewCell = newRow.insertCell(-1);
                var viewButton = document.createElement("button");
                viewButton.innerText = "View";
                viewButton.onclick = _viewPlaylist(hashkey);
                viewCell.appendChild(viewButton);
                var cloneCell = newRow.insertCell(-1);
                var cloneButton = document.createElement("button");
                cloneButton.innerText = "Clone";
                cloneButton.onclick = _clonePlaylist(hashkey);
                cloneCell.appendChild(cloneButton);
            }
        }
        BODY_CONTENT.appendNode(playlist_table);
    } else {
        BODY_CONTENT.appendText("Press a subtab button to open a subtab!");
    }
},

userPlaylistInfo:PLAYLISTS.userPlaylistInfo,
publicPlaylistInfo:PLAYLISTS.publicPlaylistInfo
};
})();

LOADER.tab_scripts["Playlists"] = PLAYLISTS //Capitalised
LOADER.loading_callback();
