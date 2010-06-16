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
if(!com.funambol.recover) com.funambol.recover = {};

netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

com.funambol.recover = {

    fnblConfig: com.funambol.util.getConfig(),

    init: function () {
        document.getElementById("contactCheck").disabled = !com.funambol.util.getContactSync(this.fnblConfig);
        document.getElementById("eventCheck").disabled = !com.funambol.util.getEventSync(this.fnblConfig);
        document.getElementById("taskCheck").disabled = !com.funambol.util.getTaskSync(this.fnblConfig);
    },
    doRecover: function () {
        var fnblComponent = Components.interfaces.fnblComponent;
        window.opener.recover = false;

        if(!document.getElementById("contactCheck").checked &&
           !document.getElementById("eventCheck").checked &&
           !document.getElementById("taskCheck").checked) {
            alert("Select the items to recover!!");
            return false;
        }

        // Save current sync options
        this.fnblConfig.contactRestore = this.fnblConfig.contactSync;
        this.fnblConfig.eventRestore = this.fnblConfig.eventSync;
        this.fnblConfig.taskRestore = this.fnblConfig.taskSync;

        this.fnblConfig.contactSync = document.getElementById("contactCheck").checked;
        this.fnblConfig.eventSync = document.getElementById("eventCheck").checked;
        this.fnblConfig.taskSync = document.getElementById("taskCheck").checked;

        this.fnblConfig.save();

        if(document.getElementById("syncFrom").selectedIndex == 0) {
            window.opener.recover = true;
            window.opener.recoverMode = fnblComponent.REFRESH_FROM_CLIENT;
        } else if(document.getElementById("syncFrom").selectedIndex == 1) {
            if (!confirm("A refresh sync from server has been requested. All the local items will be " +
                         "deleted before adding the server items. Are you sure you want to continue?")) {
                return false;
            }
            window.opener.recover = true;
            window.opener.recoverMode = fnblComponent.REFRESH_FROM_SERVER;
        }
        return true;
    }
}