// 
//  https://github.com/ahammer-/hackernews-collapse
//  April 2015
//  
//  Based on a bookmarklet by Alexander Kirk.
//  http://alexander.kirk.at/2010/02/16/collapsible-threads-for-hacker-news/
//  


// From: http://stackoverflow.com/a/2117523
function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}


jQuery(function($) {

    var SETTINGS = {};

    safari.self.addEventListener("message", function(event) {
        if (event.name === "settings") {
            SETTINGS = event.message;
        }
    }, false);

    safari.self.tab.dispatchMessage("getSettings", null);
    $("body").addClass("collapsible-comments");

    function collapse(e) {
        var $e = $(e.target);
        var el = $e.closest("table");

        var comment = el.find("span.comhead").parent().siblings().not("br");
        var childComments = $("table.parent-" + el.data("comment")).closest("tr");
        var thread = childComments.add(comment);
        var votearrow = comment.closest("td").prev();
        var numChildComments = el.find("span.numchildcomments");

        var visible = childComments.length ? childComments.is(":visible") : comment.is(":visible");

        if (visible) {
            // Expand all child comments before hiding thread
            childComments
                .find("span.collapse")
                    // Collapse label
                    .text("[-]")
                .end()
                .find("span.numchildcomments")
                    // Hide number of child comments
                    .text("")
                .end()
                .find("span.comhead")
                    // Show arrows
                    .parent().siblings().closest("td").prev().css("visibility", "visible")
                .end()
                .find("span.comhead")
                    // Expand comments
                    .parent().siblings().not("br").show()
                .end();

            // Hide thread
            $e.text("[+]");
            thread.hide();
            votearrow.css("visibility", "hidden");

            if (SETTINGS && SETTINGS['showNumChildComments']) {
                var numChildCommentText = "(" + childComments.length + " child" + (childComments.length == 1 ? "" : "ren") + ")";
                numChildComments.text(numChildCommentText);
            }
            else {
                numChildComments.text("");
            }
        }
        else {
            // Show thread
            $e.text("[-]");
            thread.show();
            votearrow.css("visibility", "visible");
            numChildComments.text("");
        }
    }

    var comments = $("body table table").eq(2);
    var parents = [];

    // Prepare comments
    $("table", comments).each(function() {
        var $this = $(this);
        var level = Math.floor($("td img[src*='s.gif']", this)[0].width / 40);

        var commentHeader = $("span.comhead", this);
        // Prepend collapse icon
        commentHeader.prepend(" ", $("<span class='collapse'>[-]</span><span> </span>")
                        .css({cursor: "pointer"})
                        .click(collapse)
                        .hover(function() { this.style.textDecoration = "underline"; },
                               function() { this.style.textDecoration = "none"; }));
        // Append number of comments
        commentHeader.append(" ", $("<span class='numchildcomments'></span>"))

        // Extract comment IDs
        var commentIDs = $("a[href*=item]", commentHeader);
        var id = commentIDs[0];

        // Some comments don't have IDs, e.g. flagged comments
        if (typeof id === 'undefined' || id === null) {
            id = guid();
        }
        else {
            id = commentIDs[0].href;
            id = id.substr(id.indexOf("=") + 1);
        }

        // Add comment IDs
        $this.addClass("comment-" + id).data("comment", id);

        // Add all parent's IDs to each comment
        parents[level] = id;
        if (level > 0) {
            for (var i = 0; i < level; i++) {
                $this.addClass("parent-" + parents[i]);
            }
        }
    });
});
