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
if(!com.funambol.calendar) com.funambol.calendar = {};

netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

com.funambol.calendar = {

    fnblConfig: com.funambol.util.getConfig(),
    calendarManager: Components.classes["@mozilla.org/calendar/manager;1"].getService(Components.interfaces.calICalendarManager),
    lastFolder: '',

    /** Initialize the calendar details */
    initCalendarDetails: function(){

        document.getElementById("eventUri").value = this.fnblConfig.eventUri;
        document.getElementById("taskUri").value  = this.fnblConfig.taskUri;

        var list = document.getElementById("calList");
        var calendarFolder = this.fnblConfig.calendarFolder;

        // Remember the calendar folder set
        this.lastFolder = calendarFolder;
        var calendars = this.calendarManager.getCalendars({});
        var i = 0;
        for each(var calendar in calendars) {
            list.appendItem(calendar.name, calendar.uri.spec);
            if(calendar.uri.spec == calendarFolder) {
                list.selectedIndex = i;
            }
            i++;
        }
    },

    /** Save the Calendar details to the config. */
    saveCalendarDetails: function(){

        this.fnblConfig.eventUri = document.getElementById("eventUri").value;
        this.fnblConfig.taskUri  = document.getElementById("taskUri").value;

        if(document.getElementById("calList").selectedItem.value) {
            if(this.lastFolder != document.getElementById("calList").selectedItem.value)
                this.fnblConfig.calendarFolder = document.getElementById("calList").selectedItem.value;
        }
        this.fnblConfig.save();
    }
}
