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
if(!com.funambol.proxy) com.funambol.proxy = {};

netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

com.funambol.proxy = {

    fnblConfig: com.funambol.util.getConfig(),

    init: function {
        document.getElementById("proxyUsername").value = this.fnblConfig.proxyUsername;
        document.getElementById("proxyPassword").value = this.fnblConfig.proxyPassword;

        var disabled = !this.fnblConfig.useProxy;
        document.getElementById("useProxy").checked         = !disabled;
        document.getElementById("txt").disabled             = disabled;
        document.getElementById("proxyUsernameL").disabled  = disabled;
        document.getElementById("proxyUsername").disabled   = disabled;
        document.getElementById("proxyPasswordL").disabled  = disabled;
        document.getElementById("proxyPassword").disabled   = disabled;
    },
    doOK: function {
        this.fnblConfig.proxyUsername = document.getElementById("proxyUsername").value;
        this.fnblConfig.proxyPassword = document.getElementById("proxyPassword").value;
        this.fnblConfig.useProxy = document.getElementById("useProxy").checked;
        this.fnblConfig.save();
    },
    enableProxy: function {
        var disabled = !document.getElementById("useProxy").checked;
        document.getElementById("txt").disabled = disabled;
        document.getElementById("proxyUsernameL").disabled = disabled;
        document.getElementById("proxyUsername").disabled = disabled;
        document.getElementById("proxyPasswordL").disabled = disabled;
        document.getElementById("proxyPassword").disabled = disabled;
    }
}
