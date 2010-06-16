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

//
// syncEnabled controls wether the sync should start when a submeby of the
// toolbar menu is selected. For some reason, then one of the item is
// choosen, also the default command is executed.
//
var syncEnabled = true;

function synchronizeToolbar() {
    if (syncEnabled) {
        window.open("chrome://funambol/content/sync-dialog.xul", "showmore", "chrome, centerscreen").focus();
        var fnblConfig = com.funambol.util.getConfig();
        if(!fnblConfig.isSyncing) {
            setTimeout("com.funambol.client.sync();", 100);
        }
    } else {
        syncEnabled = true;
    }
}

function showSyncDialogToolbar() {
    syncEnabled = false;
    window.open("chrome://funambol/content/sync-dialog.xul", "showmore", "chrome, centerscreen").focus();
}

function showOptionsToolbar() {
    syncEnabled = false;
    var app = Components.classes["@mozilla.org/addressbook/cardproperty;1"] ? "messenger" : "calendar";
	openDialog("chrome://" + app + "/content/preferences/preferences.xul",
		       "Preferences",
		       "chrome,titlebar,toolbar,centerscreen",
		       'paneFunambol');
}
