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

if(!com) var com = {};
if(!com.funambol) com.funambol = {};
if(!com.funambol.preferences) com.funambol.preferences = {};

netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

com.funambol.preferences = {

    intervals: new Array("5", "10", "15", "30", "45", "60"),

    initPreferences: function(){
        var config = com.funambol.util.getConfig();

        document.getElementById("serverUrl").value = 		  config.serverUri;
        document.getElementById("username").value = 		  config.username;
        document.getElementById("password").value = 		  config.password;
        document.getElementById("contactCheck").checked =     config.contactSync;
        document.getElementById("contactDetails").disabled = !document.getElementById("contactCheck").checked;
        document.getElementById("eventCheck").checked = 	  config.eventSync;
        document.getElementById("taskCheck").checked = 		  config.taskSync;
        document.getElementById("calDetails").disabled =     !document.getElementById("eventCheck").checked && !document.getElementById("taskCheck").checked;
        document.getElementById("schedulerCheck").checked =   config.isScheduledSync;
        document.getElementById("intervalList").disabled =   !document.getElementById("schedulerCheck").checked;
        document.getElementById("startupSyncCheck").checked = config.syncAtStartup;
        document.getElementById("radioLog").selectedIndex =   config.logLevel;

        /** Used for unit testing */
        document.getElementById("unitTestButton").hidden =   !config.enableUnitTest;

        var syncInterval = config.syncInterval;
        var list = document.getElementById("intervalList");

        for (var i=0; i<this.intervals.length; i++) {

            var interval = this.intervals[i];
            var suffix = " minutes"

            if(interval >= 60) {
                interval /= 60;
                suffix = " hour"
                if(interval > 60) {
                    // plural suffix
                    suffix += "s";
                }
            }
            list.appendItem(interval + suffix, this.intervals[i]);

            if(this.intervals[i] == syncInterval) {
                list.selectedIndex = i;
            }
        }

        if(!com.funambol.util.isThunderbird()) {
            document.getElementById("contactCheck").disabled = true;
            document.getElementById("contactDetails").disabled = true;
        }

        if(!com.funambol.util.isCalendarSupported() || !com.funambol.util.isCalendarVersionSupported()) {
            document.getElementById("eventCheck").disabled = true;
            document.getElementById("calDetails").disabled = true;
            document.getElementById("taskCheck").disabled = true;
            if(!com.funambol.util.isCalendarVersionSupported()) {
                document.getElementById("calLabel").value = "[Only Calendar 1.0 is supported]";
                document.getElementById("calLabel").disabled = true;
            }
        }
        // Disable configuration settings during sync
        if(config.isSyncing) {
            document.getElementById("serverUrlLabel").disabled = true;
            document.getElementById("serverUrl").disabled = true;
            document.getElementById("usernameLabel").disabled = true;
            document.getElementById("username").disabled = true;
            document.getElementById("passwordLabel").disabled = true;
            document.getElementById("password").disabled = true;
            document.getElementById("proxyButton").disabled = true;
            document.getElementById("contactCheck").disabled = true;
            document.getElementById("contactDetails").disabled = true;
            document.getElementById("eventCheck").disabled = true;
            document.getElementById("calDetails").disabled = true;
            document.getElementById("taskCheck").disabled = true;
            document.getElementById("schedulerCheck").disabled = true;
            document.getElementById("intervalList").disabled = true;
            document.getElementById("radioLog").disabled = true;
            document.getElementById("logButtonView").disabled = true;
            document.getElementById("logButtonSend").disabled = true;
            document.getElementById("unitTestButton").disabled = true;
        }

        // select the correct picture to show on the right side of the pref panel
        var picture = com.funambol.util.isThunderbird() ? "icon_thunderbird_128x128.png" :
                                                          "icon_sunbird_128x128.png";

        document.getElementById("funambolLogo1").setAttribute("src", "chrome://funambol/skin/images/" + picture);
        document.getElementById("funambolLogo2").setAttribute("src", "chrome://funambol/skin/images/" + picture);
        document.getElementById("funambolLogo3").setAttribute("src", "chrome://funambol/skin/images/" + picture);

        // check whether the log tab shall be selected
        if ("arguments" in window && window.arguments[1] && document.getElementById(window.arguments[1])) {
            document.getElementById("prefTabBox").selectedTab = document.getElementById(window.arguments[1]);
        }
    },
    savePreferences: function(){
        var config = com.funambol.util.getConfig();

        if(document.getElementById("serverUrl") != null) {

            config.serverUri       = document.getElementById("serverUrl").value;
            config.username        = document.getElementById("username").value;
            config.password        = document.getElementById("password").value;
            config.contactSync     = document.getElementById("contactCheck").checked;
            config.eventSync       = document.getElementById("eventCheck").checked;
            config.taskSync        = document.getElementById("taskCheck").checked;
            config.logLevel        = document.getElementById("radioLog").selectedIndex;
            config.isScheduledSync = document.getElementById("schedulerCheck").checked;
            config.syncAtStartup   = document.getElementById("startupSyncCheck").checked;

            if(document.getElementById("intervalList").selectedItem.value) {
                config.syncInterval = document.getElementById("intervalList").selectedItem.value;
            }
            config.save();

            // if the opener window is the sync dialog, initialize it
            if(window.opener.initSyncDialog) {
                window.opener.initSyncDialog();
            }
        }
    },
    checkCalDetailsButton: function(){
        document.getElementById("calDetails").disabled = !document.getElementById("eventCheck").checked &&
            !document.getElementById("taskCheck").checked;
    },
    checkContactDetailsButton: function(){
        document.getElementById("contactDetails").disabled = !document.getElementById("contactCheck").checked;
    },
    enableScheduledSync: function(){
        document.getElementById("intervalList").disabled = !document.getElementById("schedulerCheck").checked;
    },
    checkContactDetailsButtonPosix: function(){
        this.checkContactDetailsButton();

        var config = com.funambol.util.getConfig();

        config.contactSync = document.getElementById("contactCheck").checked;
        config.save();
        // if the opener window is the sync dialog, initialize it
        if(window.opener.initSyncDialog) {
            window.opener.initSyncDialog();
        }
    },
    checkCalDetailsButtonPosix: function(){
        this.checkCalDetailsButton();

        var config = com.funambol.util.getConfig();

        config.eventSync = document.getElementById("eventCheck").checked;
        config.taskSync = document.getElementById("taskCheck").checked;
        config.save();

        // if the opener window is the sync dialog, initialize it
        if(window.opener.initSyncDialog) {
            window.opener.initSyncDialog();
        }
    },
    enableScheduledSyncPosix: function(){
        this.enableScheduledSync();

        var config = com.funambol.util.getConfig();

        config.isScheduledSync = document.getElementById("schedulerCheck").checked;
        config.save();
    },
    startUnitTest: function(){
        var fnblComponent = Components.classes["@mozilla.org/funambol/component;1"].getService(Components.interfaces.fnblComponent);
        fnblComponent.startUnitTest();
    },
    saveServerUrl: function(){
        var config = com.funambol.util.getConfig();

        config.serverUri = document.getElementById("serverUrl").value;
        config.save();
    },
    saveUsername: function(){
        var config = com.funambol.util.getConfig();

        config.username = document.getElementById("username").value;
        config.save();
    },
    savePassword: function(){
        var config = com.funambol.util.getConfig();

        config.password = document.getElementById("password").value;
        config.save();
    },
    saveLogLevel: function(){
        var config = com.funambol.util.getConfig();

        config.logLevel = document.getElementById("radioLog").selectedIndex;
        config.save();
    },
    saveSyncInterval: function(){
        if(document.getElementById("intervalList").selectedItem.value) {
            var config = com.funambol.util.getConfig();

            config.syncInterval = document.getElementById("intervalList").selectedItem.value;
            config.save();
        }
    },
    enableStartupSyncPosix: function(){
        var config = com.funambol.util.getConfig();

        config.syncAtStartup = document.getElementById("startupSyncCheck").checked;
        config.save();
    }
}
