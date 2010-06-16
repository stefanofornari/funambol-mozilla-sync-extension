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
if(!com.funambol.log) com.funambol.log = {};

com.funambol.log = {

    sendLog: function(){
        if(Components.classes["@mozilla.org/messengercompose;1"] == null) {
            alert("Can't find mail services!");
            return;
        }
        var msgComposeType = Components.interfaces.nsIMsgCompType;
        var msgComposFormat = Components.interfaces.nsIMsgCompFormat;
        var msgComposeService = Components.classes["@mozilla.org/messengercompose;1"].getService();
        msgComposeService = msgComposeService.QueryInterface(Components.interfaces.nsIMsgComposeService);
        var fnblConfig = com.funambol.util.getConfig();

        var params = Components.classes["@mozilla.org/messengercompose/composeparams;1"].createInstance(Components.interfaces.nsIMsgComposeParams);
        if (params) {
            params.type = msgComposeType.New;
            params.format = msgComposFormat.Default;
            var composeFields = Components.classes["@mozilla.org/messengercompose/composefields;1"].createInstance(Components.interfaces.nsIMsgCompFields);
            var attachment = Components.classes["@mozilla.org/messengercompose/attachment;1"].createInstance(Components.interfaces.nsIMsgAttachment);

            attachment.name = "synclog.txt";
            attachment.contentType = "text/log";
            attachment.url = "file://" + fnblConfig.path + "/synclog.txt";

            composeFields.addAttachment(attachment);

            var em = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);
            var fmp = em.getItemForID("syncmlplugin@funambol.com");

            if (composeFields) {
                composeFields.to = "fmz-logs@funambol.com";
                composeFields.subject = "Funambol Mozilla Sync Client Report";
                composeFields.body = "Funambol Mozilla Sync Client v" + fmp.version + " Sync Report \r\n--------------------------------------------------\r\n" +
                                     "Message: \r\n\r\n\r\n--------------------------------------------------\r\n" +
                                     "Server url: " + fnblConfig.serverUri + "\r\n" +
                                     ((fnblConfig.contactSync == true )? "+": "-") + " Contacts folder: \"" + fnblConfig.contactFolder + "\". Uri: \"" + fnblConfig.contactUri + "\"\r\n" +
                                     ((fnblConfig.eventSync == true )? "+": "-") + " Events folder: \"" + fnblConfig.calendarFolder + "\". Uri: \"" + fnblConfig.eventUri + "\"\r\n" +
                                     ((fnblConfig.taskSync == true )? "+": "-") + " Tasks folder: \"" + fnblConfig.calendarFolder + "\". Uri: \"" + fnblConfig.taskUri + "\"";

                params.composeFields = composeFields;
                msgComposeService.OpenComposeWindowWithParams(null, params);
            }
        }
    }
}

