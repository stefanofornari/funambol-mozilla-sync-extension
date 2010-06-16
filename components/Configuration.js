Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function FunambolConfig() {
  this.wrappedJSObject = this;
}

FunambolConfig.prototype = {
  classDescription: "Funambol configuration XPCOM",
  classID         : Components.ID("{9a60d2e5-dcab-4e48-89a7-3095e7aa542e}"),
  contractID      : "@funambol.com/configuration;1",
  QueryInterface  : XPCOMUtils.generateQI([Components.interfaces.FunambolConfig]),

  // Sync mutex
  isSyncing       : false,

  // Server preferences
  serverUri       : "http://localhost:8080/funambol/ds",
  username        : "guest",
  password        : "guest",
  logLevel        : 1,
  path            : ".",

  // Contacts preferences
  contactSync     : false,
  contactFolder   : "",
  contactUri      : "card",
  contactLast     : 0,

  // Common calendar preferences
  calendarFolder  : "",

  // Appointments preferences
  eventSync       : false,
  eventUri        : "event",
  eventLast       : 0,

  // Tasks preferenceshelloworld
  taskSync        : false,
  taskUri         : "task",
  taskLast        : 0,

  // Restore sync preferences. Used after a recover sync
  contactRestore  : false,
  eventRestore    : false,
  taskRestore     : false,

  // Proxy prefs
  useProxy        : false,
  proxyPort       : 8080,
  proxyHost       : "",
  proxyUsername   : "",
  proxyPassword   : "",

  // Auto-sync preferences
  isScheduledSync : false,
  syncAtStartup   : false,
  syncInterval    : "15",

  //
  // Methods
  //
  save: function() {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                          .getService(Components.interfaces.nsIPrefBranch);

    prefs.setCharPref("funambol.sync.account.url"           , this.serverUri      );
    prefs.setCharPref("funambol.sync.account.username"      , this.username       );
    prefs.setCharPref("funambol.sync.account.password"      , this.password       );
    prefs.setBoolPref("funambol.sync.account.proxy.enable"  , this.useProxy       );
    prefs.setCharPref("funambol.sync.account.proxy.host"    , this.proxyHost      );
    prefs.setIntPref ("funambol.sync.account.proxy.port"    , this.proxyPort      );
    prefs.setCharPref("funambol.sync.account.proxy.username", this.proxyUsername  );
    prefs.setCharPref("funambol.sync.account.proxy.password", this.proxyPassword  );

    prefs.setIntPref("funambol.sync.log-level"              , this.logLevel       );
    prefs.setBoolPref("funambol.sync.auto.enable"           , this.isScheduledSync);
    prefs.setBoolPref("funambol.sync.auto.startup"          , this.syncAtStartup  );
    prefs.setIntPref ("funambol.sync.auto.interval"         , this.syncInterval   );

    prefs.setBoolPref("funambol.sync.addressbook.enable"    , this.contactSync    );
    prefs.setCharPref("funambol.sync.addressbook.folder"    , this.contactFolder  );
    prefs.setCharPref("funambol.sync.addressbook.uri"       , this.contactUri     );
    prefs.setIntPref ("funambol.sync.addressbook.last"      , this.contactLast    );
    prefs.setBoolPref("funambol.sync.addressbook.restore"   , this.contactRestore );

    prefs.setCharPref("funambol.sync.calendar.folder"       , this.calendarFolder );
    prefs.setBoolPref("funambol.sync.calendar.event.enable" , this.eventSync      );
    prefs.setCharPref("funambol.sync.calendar.event.uri"    , this.eventUri       );
    prefs.setIntPref ("funambol.sync.calendar.event.last"   , this.eventLast      );
    prefs.setBoolPref("funambol.sync.calendar.event.restore", this.eventRestore   );
    prefs.setBoolPref("funambol.sync.calendar.task.enable"  , this.taskSync       );
    prefs.setCharPref("funambol.sync.calendar.task.uri"     , this.taskUri        );
    prefs.setIntPref ("funambol.sync.calendar.task.last"    , this.taskLast       );
    prefs.setBoolPref("funambol.sync.calendar.task.restore" , this.taskRestore    );
  },

  load: function() {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                          .getService(Components.interfaces.nsIPrefBranch);

    //
    // NOTE: if a value does not exists, the default defined in this interface will be taken
    //

    //
    // Client
    //
    if (prefs.prefHasUserValue("funambol.sync.log-level")) {
      this.logLevel = prefs.getIntPref("funambol.sync.log-level");
    }

    if (prefs.prefHasUserValue("funambol.sync.auto.enable")) {
      this.isScheduledSync = prefs.getBoolPref("funambol.sync.auto.enable");
    }

    if (prefs.prefHasUserValue("funambol.sync.auto.startup")) {
      this.syncAtStartup = prefs.getBoolPref("funambol.sync.auto.startup");
    }

    if (prefs.prefHasUserValue("funambol.sync.auto.interval")) {
      this.syncInterval = prefs.getIntPref("funambol.sync.auto.interval");
    }

    //
    // Account - main
    //
    if (prefs.prefHasUserValue("funambol.sync.account.url")) {
      this.serverUri = prefs.getCharPref("funambol.sync.account.url");
    }

    if (prefs.prefHasUserValue("funambol.sync.account.username")) {
      this.username = prefs.getCharPref("funambol.sync.account.username");
    }

    if (prefs.prefHasUserValue("funambol.sync.account.password")) {
      this.password = prefs.getCharPref("funambol.sync.account.password");
    }

    //
    // Account - proxy
    //
    if (prefs.prefHasUserValue("funambol.sync.account.proxy.enable")) {
      this.useProxy = prefs.getBoolPref("funambol.sync.account.proxy.enable");
    }

    if (prefs.prefHasUserValue("funambol.sync.account.proxy.host")) {
      this.proxyHost = prefs.getCharPref("funambol.sync.account.proxy.host");
    }

    if (prefs.prefHasUserValue("funambol.sync.account.proxy.port")) {
      this.proxyPort = prefs.getIntPref("funambol.sync.account.proxy.port");
    }

    if (prefs.prefHasUserValue("funambol.sync.account.proxy.username")) {
      this.proxyUsername = prefs.getCharPref("funambol.sync.account.proxy.username");
    }

    //
    // Address book
    //
    if (prefs.prefHasUserValue("funambol.sync.addressbook.enable")) {
      this.contactSync =  prefs.getBoolPref("funambol.sync.addressbook.enable");
    }

    if (prefs.prefHasUserValue("funambol.sync.addressbook.folder")) {
      this.contactFolder =  prefs.getCharPref("funambol.sync.addressbook.folder");
    }

    if (prefs.prefHasUserValue("funambol.sync.addressbook.uri")) {
      this.contactUri =  prefs.getCharPref("funambol.sync.addressbook.uri");
    }

    if (prefs.prefHasUserValue("funambol.sync.addressbook.last")) {
      this.contactLast =  prefs.getIntPref("funambol.sync.addressbook.last");
    }

    if (prefs.prefHasUserValue("funambol.sync.addressbook.restore")) {
      this.contactRestore =  prefs.getBoolPref("funambol.sync.addressbook.restore");
    }

    //
    // Calendar - main
    //
    if (prefs.prefHasUserValue("funambol.sync.calendar.folder")) {
      this.calendarFolder =  prefs.getCharPref("funambol.sync.calendar.folder");
    }

    //
    // Calendar - event
    //
    if (prefs.prefHasUserValue("funambol.sync.calendar.event.enable")) {
      this.eventSync =  prefs.getBoolPref("funambol.sync.calendar.event.enable");
    }

    if (prefs.prefHasUserValue("funambol.sync.calendar.event.uri")) {
      this.eventUri =  prefs.getCharPref("funambol.sync.calendar.event.uri");
    }

    if (prefs.prefHasUserValue("funambol.sync.calendar.event.last")) {
      this.eventLast =  prefs.getIntPref("funambol.sync.calendar.event.last");
    }

    if (prefs.prefHasUserValue("funambol.sync.calendar.event.restore")) {
      this.eventRestore =  prefs.getBoolPref("funambol.sync.calendar.event.restore");
    }

    //
    // Calendar - task
    //
    if (prefs.prefHasUserValue("funambol.sync.calendar.task.enable")) {
      this.taskSync =  prefs.getBoolPref("funambol.sync.calendar.task.enable");
    }

    if (prefs.prefHasUserValue("funambol.sync.calendar.task.uri")) {
      this.taskUri =  prefs.getCharPref("funambol.sync.calendar.task.uri");
    }

    if (prefs.prefHasUserValue("funambol.sync.calendar.task.last")) {
      this.taskLast =  prefs.getIntPref("funambol.sync.calendar.task.last");
    }

    if (prefs.prefHasUserValue("funambol.sync.calendar.task.restore")) {
      this.taskRestore =  prefs.getBoolPref("funambol.sync.calendar.task.restore");
    }
  }

};
var components = [FunambolConfig];
function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule(components);
}