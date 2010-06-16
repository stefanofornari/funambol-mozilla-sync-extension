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
if(!com.funambol.util) com.funambol.util = {};

netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

com.funambol.util = {

    extManager: Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager),

    /**
     * Check if the underlying application is Thunderbird
     */
    isThunderbird: function(){
        return Components.classes["@mozilla.org/addressbook/cardproperty;1"];
    },

    /**
     * Check if the underlying application includes calendar services
     */
    isCalendarSupported: function(){
        return Components.classes["@mozilla.org/calendar/manager;1"];
    },

    /**
     * Check if the underlying calendar is supported
     */
    isCalendarVersionSupported: function(){
        return (this.getCalendarVersion().substring(0, 3) == "1.0");
    },

    /**
     * Check if the calendar version
     */
    getCalendarVersion: function(){
        return this.extManager.getItemForID("{e2fda1a4-762b-4020-b5ad-a41df1933103}").version;
    },

    /** Windows management methods */
    showSyncDialog: function(){
        open("chrome://funambol/content/sync-dialog.xul", "showmore", "chrome, centerscreen").focus();
    },
    showContactDetails: function(){
        openDialog("chrome://funambol/content/contacts-details.xul", "", "chrome, centerscreen");
    },
    showCalendarDetails: function(){
        openDialog("chrome://funambol/content/calendar-details.xul", "", "chrome, centerscreen");
    },
    showLogDialog: function(){
        openDialog("chrome://funambol/content/log-dialog.xul", "", "chrome, centerscreen");
    },
    showProxyDialog: function(){
        openDialog("chrome://funambol/content/proxy-settings.xul", "", "chrome, centerscreen");
    },
    showAboutDialog: function() {
        openDialog("chrome://funambol/content/about-dialog.xul", "", "chrome, centerscreen, modal");
    },
    showFunambolOptions: function(tabId) {
        var app = this.isTunderbird() ? "messenger" : "calendar";
        openDialog("chrome://" + app + "/content/preferences/preferences.xul",
                   "Preferences",
                   "chrome,titlebar,toolbar,centerscreen",
                   'paneFunambol',
                   tabId);
    },
    showLogOutput: function(){
        var filePath = this.getConfig().path + "synclog.txt";

        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath( filePath );
        if ( file.exists() == false ) {
            alert("Log file does not exist: "+savefile);
        }
        var is = Components.classes["@mozilla.org/network/file-input-stream;1"]
            .createInstance( Components.interfaces.nsIFileInputStream );
        is.init( file,0x01, 00004, null);
        var sis = Components.classes["@mozilla.org/scriptableinputstream;1"]
            .createInstance( Components.interfaces.nsIScriptableInputStream );
        sis.init( is );
        var output = sis.read( sis.available() );
        document.getElementById( "syncLog" ).value = output;
    },

    getConfig: function() {
        //return Components.classes["@mozilla.org/funambol/config;1"].getService(Components.interfaces.fnblConfig);
        var config = Components.classes["@funambol.com/configuration;1"].getService().wrappedJSObject;
        config.load();

        return config;
    },
    isSyncing: function() {
        return this.getConfig().isSyncing;
    },
    /** Check if contacts shall be synced */
    getContactSync: function() {
        return this.isThunderbird() && this.getConfig().contactSync && this.getConfig().contactFolder != "";
    },
    /** Check if events shall be synced */
    getEventSync: function() {
        return this.getConfig().eventSync && this.getCalendarSync();
    },
    /** Check if events shall be synced */
    getTaskSync: function() {
        return this.getConfig().taskSync && this.getCalendarSync();
    },
    /** Check if calendar is installed */
    getCalendarSync: function() {
        return this.isCalendarSupported() && this.isCalendarVersionSupported() && this.getConfig().calendarFolder != "";
    }
}