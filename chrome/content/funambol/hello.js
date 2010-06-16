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
if(!com.funambol.util) com.funambol.hello = {};

netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

com.funambol.hello = {


    /** Windows management methods */
    helloWorld: function() {
      try {
        //var c = Components.classes['@funambol.com/configuration;1']
        //                            .getService().wrappedJSObject;

        var c = Components.classes['@funambol.com/configuration;1'].getService(Components.interfaces.fnblConfig);
        alert(c.save());
      } catch (anError) {
        alert("ERROR: " + anError);
      }
    },
}