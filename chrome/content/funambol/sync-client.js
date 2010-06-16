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
if(!com.funambol.client) com.funambol.client = {};

netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

com.funambol.client = {

    nsIThread: Components.interfaces.nsIThread,
    fnblComponent: Components.interfaces.fnblComponent,
    
    tManager: Components.classes["@mozilla.org/thread-manager;1"].getService(Components.interfaces.nsIThreadManager),
    funambolComponent: Components.classes["@mozilla.org/funambol/component;1"].getService(Components.interfaces.fnblComponent),
    syncMode: Components.interfaces.fnblComponent.TWO_WAY_SYNC,
    
    /* Start sync with a specific syncMode */
    sync: function(mode) {
        var thread = this.tManager.newThread(0);
        if(mode) this.syncMode = mode;
        else this.syncMode = this.fnblComponent.TWO_WAY_SYNC;
        thread.dispatch(this, this.nsIThread.DISPATCH_SYNC);
    },

    /* Separate thread */
    run: function () {
        this.funambolComponent.synchronize(this.syncMode);
    }
};



