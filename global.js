safari.application.addEventListener("message", function(event) {
    if (event.name === "getSettings") {
        var settings = {showNumChildComments: safari.extension.settings.showNumChildComments};
        event.target.page.dispatchMessage("settings", settings);
    }
}, false);
