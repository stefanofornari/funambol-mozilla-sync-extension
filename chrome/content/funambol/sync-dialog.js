/*
 * Copyright (C) 2003-2007 Funambol
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 */

// Get xp connect priviledge
netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

String.prototype.endsWith = function(str)
{return (this.match(str+"$")==str)}

/** Initialize the main sync dialog */
function initSyncDialog() {
    prepareForNotSync();
    addSyncObservers();

    // check if the sync process is in progress
    if(isSyncing()) {
        prepareForSync();
    }
}

/** Initialize the main sync dialog for not sync */
function prepareForNotSync() {
    enableMenu();
    initSyncButtons();
    initSyncMessages();
}

var dotsInterval;
/** Initialize the main sync dialog for sync */
function prepareForSync() {
    disableMenu();
    syncAllDisable();

    // start sync all button animation
    if(dotsInterval) clearInterval(dotsInterval);
    dotsInterval = setInterval("updateDots();", 500);
}

var dotCount = 0;
/** Dots animator updater */
function updateDots() {
    var dots = "";
    for(var i=0; i<dotCount; i++) {
        dots += ".";
    }
    if(dotCount > 2) {
        dotCount = -1;
    }
    window.document.getElementById("syncAllTitle").value = "Sync in progress " + dots;
    dotCount++;
}

/** Show the about dialog */
function showAboutDialog() {
	openDialog("chrome://funambol/content/about-dialog.xul", "", "chrome, centerscreen, modal");
}
/** Show the recover dialog */
function showRecoverDialog() {
    openDialog("chrome://funambol/content/recover-dialog.xul", "", "chrome, centerscreen, modal");
    initSyncDialog();
    if(window.recover) {
        com.funambol.client.sync(window.recoverMode);
    }
    window.recover = false;
}
/** Show the options dialog */
function showFunambolOptions(tabId) {
	var app = Components.classes["@mozilla.org/addressbook/cardproperty;1"] ? "messenger" : "calendar";
	openDialog("chrome://" + app + "/content/preferences/preferences.xul",
		       "Preferences",
		       "chrome,titlebar,toolbar,centerscreen",
		       'paneFunambol',
		       tabId);
}

/** Start the sync process */
function synchronize() {
    if(!isSyncing()) {
        prepareForSync();
        com.funambol.client.sync();
    }
}

function initSyncButtons() {
    if(dotsInterval) clearInterval(dotsInterval);
    syncAllEnable();
    initSyncButton("contact", !getContactSync());
    initSyncButton("event", !getEventSync());
    initSyncButton("task", !getTaskSync());
}
function initSyncButton(sourceId, disable) {
    disable ? syncItemDisable(sourceId) : syncItemEnable(sourceId);
}

function initSyncMessages() {
    initSyncMessage("contact", com.funambol.util.getConfig().contactLast);
    initSyncMessage("event", com.funambol.util.getConfig().eventLast);
    initSyncMessage("task", com.funambol.util.getConfig().taskLast);
    document.getElementById("funambol-sync-status").label = "Ready";
}

function initSyncMessage(sourceId, lastAnchor) {
    var msg = lastAnchor == 0 ? "Not synchronized" :
                                "Last sync: " + dateFormat(new Date(lastAnchor*1000), "dddd, mmm dS, h:MMTT");
    window.document.getElementById(sourceId + "Status").value = msg;
}

/** Handle onMouseOver event for the syncall button */
function syncAllOnMouseOver() {
    if(!isSyncing()) {
        syncAllEnableOnMouseOver();
    }
}
/** Handle onMouseOut event for the syncall button */
function syncAllOnMouseOut() {
    if(!isSyncing()) {
        syncAllEnableOnMouseOut();
    }
}

/********************* Start Observers handling *********************/

/** Initialize the observer service */
var observerService = Components.classes["@mozilla.org/observer-service;1"]
                                  .getService(Components.interfaces.nsIObserverService);
var observerSet = false;

/** Add sync observers */
function addSyncObservers() {
    if(observerSet) {
        return;
    }
    observerService.addObserver(syncSourceObserver, "contact", false);
    observerService.addObserver(syncSourceObserver, "event",   false);
    observerService.addObserver(syncSourceObserver, "task",    false);
    observerService.addObserver(syncObserver,       "sync",    false);
    observerService.addObserver(errorObserver,      "error",   false);
    observerSet = true;
}

/** Remove sync observers */
function removeSyncObservers() {

    if(!observerSet) {
        return;
    }
    observerService.removeObserver(syncSourceObserver, "contact");
    observerService.removeObserver(syncSourceObserver, "event");
    observerService.removeObserver(syncSourceObserver, "task");
    observerService.removeObserver(errorObserver,      "error");
    observerService.removeObserver(syncObserver,       "sync");
    observerSet = false;
}

/** Initialize the sync source observer */
var syncSourceObserver = {

    sourceSyncing: false,
    beginReceived: false,

    contactRestored: false,
    eventRestored:   false,
    taskRestored:    false,

  	observe: function (subject, source, message) {
  	    if(message == "begin") {
            this.handleBeginSync(source);
            this.beginReceived = true;
            window.document.getElementById(source + "Status").value = "Begin sync of " + source + "s";
        }
        else if(message == "end") {
            clearInterval(interval);
  	        syncItemEnable(source);
  	        this.sourceSyncing = false;
  	        window.document.getElementById(source + "Status").value = "Waiting for server data...";
        }
        else if(message == "restored") {

            // a sync source config sync has been restored
            if(source == "contact") this.contactRestored = true;
            if(source == "event")   this.eventRestored = true;
            if(source == "task")    this.taskRestored = true;
        }
        else {
            if(!this.sourceSyncing && !this.beginReceived && !message.endsWith("needed")) {
                this.handleBeginSync(source);
            }
            window.document.getElementById(source + "Status").value = message;
        }
	},
	handleBeginSync: function (source) {
        arrowIndex = 0;
        if(interval) clearInterval(interval);
        interval = setInterval("updateArrows('" + source + "');", 200);
        syncItemEnableSyncing(source);
        this.sourceSyncing = true;
	}
};

var arrowIndex = 0;
var interval;

/** Ratating arrows updater */
function updateArrows(source) {
    if(arrowIndex == 0) {
        window.document.getElementById(source + "Arrows").src = "chrome://funambol/skin/images/arrows32a.ico";
    } else if(arrowIndex == 1) {
        window.document.getElementById(source + "Arrows").src = "chrome://funambol/skin/images/arrows32b.ico";
    } else if(arrowIndex == 2) {
        window.document.getElementById(source + "Arrows").src = "chrome://funambol/skin/images/arrows32c.ico";
    } else if(arrowIndex == 3) {
        window.document.getElementById(source + "Arrows").src = "chrome://funambol/skin/images/arrows32d.ico";
        arrowIndex-=4;
    }
    arrowIndex++;
}

var syncObserver = {
  	observe: function (subject, topic, data) {
  	    if(data == "start") {
  	        prepareForSync();
  	        syncSourceObserver.contactRestored = false;
            syncSourceObserver.eventRestored = false;
            syncSourceObserver.taskRestored = false;
  	    }
  	    else if(data == "end") {
  	        prepareForNotSync();
  	        if(getContactSync() && !syncSourceObserver.contactRestored) {
  	            syncItemEnableSuccess("contact");
  	        }
            if(getEventSync() && !syncSourceObserver.eventRestored) {
  	            syncItemEnableSuccess("event");
  	        }
            if(getTaskSync() && !syncSourceObserver.taskRestored) {
  	            syncItemEnableSuccess("task");
  	        }
  	        if(interval) clearInterval(interval);
  	    }
	    else document.getElementById("funambol-sync-status").label = data;
	}
};
var errorObserver = {
  	observe: function (subject, topic, data) {
  	    if(interval) clearInterval(interval);
  	    prepareForNotSync();
  	    if(getContactSync() && !syncSourceObserver.contactRestored) {
            syncItemEnableFailed("contact");
        }
        if(getEventSync() && !syncSourceObserver.eventRestored) {
            syncItemEnableFailed("event");
        }
        if(getTaskSync() && !syncSourceObserver.taskRestored) {
            syncItemEnableFailed("task");
        }

		// Handle the result error code
        var message;
        var requireLoadOptions = false;
        if(data == "401" || data == "404" || data == "407" || data == "2060") {
            message = "Can't access your account. Please check your server location, username or password.";
            requireLoadOptions = true;
        }
        else if(data == "2001" || data == "700") {
            message = "Can't access to the server. Please check your network connectivity and your account server's location."
            requireLoadOptions = true;
        }
        else if(data == "408" || data == "2007") {
            message = "Request timeout."
        }
        else if(data == "511") {
            message = "Server failure."
        }
        else if(data == "512") {
            message = "Synchronization failed."
        }
        else if(data == "10003") {
            message = "Please select at least one item to sync.";
            requireLoadOptions = true;
        }
        else {
            message = " code " + data;
        }
        alert("Error: " + message);

        if(requireLoadOptions) {
            showFunambolOptions();
        }
	}
};

/********************* End Observers handling *********************/


/********************* Start buttons updaters *********************/

function syncAllEnable() {
    window.document.getElementById("syncAllTitle").value = "Sync All";
    window.document.getElementById("syncAllBox").setAttribute("class", "sync-button-base syncall-button");
    window.document.getElementById("syncAllArrows").setAttribute("class", "hidden");
}
function syncAllEnableOnMouseOut() {
    syncAllEnable();
}
function syncAllEnableOnMouseOver() {
    syncAllEnable();
    window.document.getElementById("syncAllBox").setAttribute("class", "sync-button-base syncall-button-active");
    window.document.getElementById("syncAllArrows").setAttribute("class", "syncall-button-arrows");
}
function syncAllDisable() {
    window.document.getElementById("syncAllTitle").value = "Sync in progress";
    window.document.getElementById("syncAllBox").setAttribute("class", "sync-button-base syncall-button-active");
    window.document.getElementById("syncAllArrows").setAttribute("class", "hidden");
}
function syncItemEnable(sourceId) {
    window.document.getElementById(sourceId + "Box").setAttribute("class", "sync-button-base sync-button");
    window.document.getElementById(sourceId + "Icon").src = "chrome://funambol/skin/images/" + sourceId + ".ico";
    window.document.getElementById(sourceId + "Title").style.color = "black";
    window.document.getElementById(sourceId + "Status").style.color = "black";
    window.document.getElementById(sourceId + "Arrows").setAttribute("class", "hidden");
}
function syncItemEnableSyncing(sourceId) {
    syncItemEnable(sourceId);
    window.document.getElementById(sourceId + "Box").setAttribute("class", "sync-button-base sync-button-active");
    window.document.getElementById(sourceId + "Arrows").src = "chrome://funambol/skin/images/arrows32a.ico";
    window.document.getElementById(sourceId + "Arrows").setAttribute("class", "sync-button-arrows");
}
function syncItemEnableSuccess(sourceId) {
    syncItemEnable(sourceId);
    window.document.getElementById(sourceId + "Arrows").src = "chrome://funambol/skin/images/icon_complete.ico";
    window.document.getElementById(sourceId + "Arrows").setAttribute("class", "sync-button-arrows");
}
function syncItemEnableFailed(sourceId) {
    syncItemEnable(sourceId);
    window.document.getElementById(sourceId + "Arrows").src = "chrome://funambol/skin/images/icon_alert.ico";
    window.document.getElementById(sourceId + "Arrows").setAttribute("class", "sync-button-arrows");
    window.document.getElementById(sourceId + "Status").value = "Last sync failed";
}
function syncItemDisable(sourceId) {
    window.document.getElementById(sourceId + "Box").setAttribute("class", "sync-button-base sync-button-disabled");
    window.document.getElementById(sourceId + "Icon").src = "chrome://funambol/skin/images/" + sourceId + "_gray.ico";
    window.document.getElementById(sourceId + "Title").style.color = "gray";
    window.document.getElementById(sourceId + "Status").style.color = "gray";
    window.document.getElementById(sourceId + "Arrows").setAttribute("class", "hidden");
}
/********************* End buttons updaters *********************/

/********************* Start menu updaters *********************/

function enableMenu() {
    window.document.getElementById("menu-file").setAttribute("disabled", "false");
    window.document.getElementById("menu-tools").setAttribute("disabled", "false");
    window.document.getElementById("menu-help").setAttribute("disabled", "false");
}
function disableMenu() {
    window.document.getElementById("menu-file").setAttribute("disabled", "true");
    window.document.getElementById("menu-tools").setAttribute("disabled", "true");
    window.document.getElementById("menu-help").setAttribute("disabled", "true");
}

/********************* End menu updaters *********************/


/** Check if the sync process is running */
function isSyncing() {
    return com.funambol.util.getConfig().isSyncing;
}

/** Check if contacts shall be synced */
function getContactSync() {
    return Components.classes["@mozilla.org/addressbook/cardproperty;1"] && com.funambol.util.getConfig().contactSync && com.funambol.util.getConfig().contactFolder != "";
}
/** Check if events shall be synced */
function getEventSync() {
    return com.funambol.util.getConfig().eventSync && getCalendarSync();
}
/** Check if tasks shall be synced */
function getTaskSync() {
    return com.funambol.util.getConfig().taskSync && getCalendarSync();
}
/** Check if calendar is installed */
function getCalendarSync() {
    var em = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);
	var cal = em.getItemForID("{e2fda1a4-762b-4020-b5ad-a41df1933103}");
	var calVersion = 0;
	if(cal) {
		calVersion = em.getItemForID("{e2fda1a4-762b-4020-b5ad-a41df1933103}").version;
    }
    return Components.classes["@mozilla.org/calendar/manager;1"] && calVersion.substring(0, 3) == "1.0" && com.funambol.util.getConfig().calendarFolder != "";
}
