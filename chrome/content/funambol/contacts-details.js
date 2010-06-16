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

com.funambol.contact = {

    fnblConfig: com.funambol.util.getConfig(),
    rdfService: Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService),
    lastFolder: '',

    /** Initialize the contacts details */
    initContactDetails: function(){
        document.getElementById("cardUri").value = this.fnblConfig.contactUri;
        var list = document.getElementById("cardList");
        var contactFolder = this.fnblConfig.contactFolder;

        lastFolder = contactFolder;

        var directory = this.rdfService.GetResource("moz-abdirectory://").QueryInterface(Components.interfaces.nsIAbDirectory);

        var cn = directory.childNodes;
        var i = 0;

        while(cn.hasMoreElements() == true){
            var aBook = cn.getNext();
            aBook = aBook.QueryInterface(Components.interfaces.nsIAbDirectory);
            var dirName = aBook.dirName;
            var fileName = aBook.fileName;
            list.appendItem(dirName, fileName);
            if(fileName == contactFolder) {
                list.selectedIndex = i;
            }
            i++;
        }
    },

    /** Save the contacts details to the config. */
    saveContactDetails: function(){
        this.fnblConfig.contactUri = document.getElementById("cardUri").value;
        if(document.getElementById("cardList").selectedItem.value) {
            if(lastFolder != document.getElementById("cardList").selectedItem.value) {
                this.fnblConfig.contactFolder = document.getElementById("cardList").selectedItem.value;
            }
        }
        this.fnblConfig.save();
    }
}
