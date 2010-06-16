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

netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

// the sync scheduler (obtained form setInterval, removed with clearInterval)
var syncScheduler;

// Check if the Funambol Component is registered correctly
if(Components.classes["@mozilla.org/funambol/component;1"]) {

    var fnblComponent = Components.classes["@mozilla.org/funambol/component;1"].getService(Components.interfaces.fnblComponent);
    var fnblConfig =  com.funambol.util.getConfig();

    // Add the address book and calendar listeners
    fnblComponent.setContactListener();

    var em = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);
    var cal = em.getItemForID("{e2fda1a4-762b-4020-b5ad-a41df1933103}");
    var calVersion = 0;

    if(cal) {
	    calVersion = em.getItemForID("{e2fda1a4-762b-4020-b5ad-a41df1933103}").version;
    }

    if(Components.classes["@mozilla.org/calendar/manager;1"] && calVersion.substring(0, 3) == "1.0") {
	    fnblComponent.setCalendarListener();
    }
    if(Components.classes["@mozilla.org/calendar/manager;1"] && calVersion.substring(0, 3) != "1.0") {
        // disable the calendar sync if the specific version isn't supported
        fnblConfig.eventSync = false;
        fnblConfig.taskSync = false;
        fnblConfig.save();
    }

    var errorOccured = false;

    // Get observer service
    var observerService = Components.classes["@mozilla.org/observer-service;1"]
                                  .getService(Components.interfaces.nsIObserverService);

    var syncObserver = {
  	    observe: function (subject, topic, data) {
  	        if(data == "start") {
                // The sync should start before all the chrome components are loaded including "funambol-status-bar"
                if(document.getElementById("funambol-status-bar")) {
                    document.getElementById("funambol-status-bar").label = "Starting sync...";
                }
            }
  	        else if(data == "end") {
  	            if(!errorOccured) {
  	                var now = new Date().toLocaleTimeString();
  	                document.getElementById("funambol-status-bar").label = "Last sync: " + now;
  	            }
  	            errorOccured = false;
	        }
	        else {
                // The sync should start before all the chrome components are loaded including "funambol-status-bar"
                if(document.getElementById("funambol-status-bar")) {
                    document.getElementById("funambol-status-bar").label = data;
                }
            }
	    }
    };
    var errorObserver = {
  	    observe: function (subject, topic, data) {
		    document.getElementById("funambol-status-bar").label = "Synchronization failed";
            errorOccured = true;
	    }
    };

    // Adding observers
    observerService.addObserver(syncObserver,  "sync",    false);
    observerService.addObserver(errorObserver, "error",   false);

    // Capture the main window closing event
    window.addEventListener('close', onCloseMainWindow, true);

    // Check if the sync shall start at Mozilla startup
    if(fnblConfig.syncAtStartup) {
        startBackgroundSync();
    }

    // Check for scheduled sync
    if(fnblConfig.isScheduledSync && fnblConfig.syncInterval) {
        syncScheduler = setInterval("startBackgroundSync();", fnblConfig.syncInterval * 60000);
    }
}
else {
    //Error: the Funambol XPCOM component has not been registered
    alert("The Funambol Component can't be loaded. Please report it to the authors.");
}

function onCloseMainWindow() {
    //
    // FIXME: abort the main window closing, if the user wants to continue to sync
    //
    //if(window.isSyncing && confirm("A sync process is running, do you want to abort it?"))
    //{
    //    return true;
    //}
    return true;
}

function showSyncDialog() {
    window.open("chrome://funambol/content/sync-dialog.xul", "showmore", "chrome, centerscreen").focus();
}

function startBackgroundSync() {
    var fconfig = com.funambol.util.getConfig();
    // Abort the automatic sync if it has been started manually
    if(!fconfig.isSyncing) {
        com.funambol.client.sync();
    }
}