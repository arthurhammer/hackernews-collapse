/**
 * Hacker News Collapsible Threads Bookmarklet companion script
 * Copyright (c) 2010 Alexander Kirk, http://alexander.kirk.at/
 * http://alexander.kirk.at/2010/02/16/collapsible-threads-for-hacker-news/
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
**/

/**
 * Original script modified by ahammer-, October 2014.
 * https://github.com/ahammer-/hackernews-collapse.safariextension
 */


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
                    .text("[-]")
                .end()
                .find("span.numchildcomments")
                    .text("")
                .end()
                .find("span.comhead")
                    // Show arrows
                    .parent().siblings().closest("td").prev().css("visibility", "visible")
                .end()
                .find("span.comhead")
                    // Expand comments
                    .parent().siblings().not("br").show();

            thread.hide();
            votearrow.css("visibility", "hidden");
            var numChildCommentText = "(" + childComments.length + " child" + (childComments.length == 1 ? "" : "ren") + ")";
            numChildComments.text(SETTINGS && SETTINGS['showNumChildComments'] ? numChildCommentText : "");
        }
        else {
            $e.text("[-]");
            thread.show();
            votearrow.css("visibility", "visible");
            numChildComments.text("");
        }
    }

    var comments = $("body table table").eq(2);
    var parents = [];

    $("table", comments).each(function() {
        var $this = $(this);
        var level = Math.floor($("td img[src*='s.gif']", this)[0].width / 40);
        var comhead = $("span.comhead", this);
        comhead.prepend(" ", $("<span class='collapse'>[-]</span><span> </span>").css({cursor: "pointer"}).click(collapse).hover(function() { this.style.textDecoration = "underline"; }, function() { this.style.textDecoration = "none"; }));
        comhead.append(" ", $("<span class='numchildcomments'></span>"))

        var id = $("a[href*=item]", comhead);
        if (! id.length) {
            return true;
        }
        id = id[0].href;
        id = id.substr(id.indexOf("=") + 1);

        $this.addClass("comment-" + id).data("comment", id);
        parents[level] = id;
        if (level > 0) {
            for (var i = 0; i < level; i++) {
                $this.addClass("parent-" + parents[i]);
            }
        }
    });
});
