
function style_set_active_stylesheet(title)
{
    var i, a, main;
    for (i = 0; (a = document.getElementsByTagName("link")[i]); i++)
    {
        if (a.getAttribute("rel").indexOf("style") != -1 &&
            a.getAttribute("title"))
        {
            a.disabled = true;
            if (a.getAttribute("title") == title)
                a.disabled = false;
        }
    }
}

function style_get_active_stylesheet()
{
    var i, a;
    for (i = 0; (a = document.getElementsByTagName("link")[i]); i++)
    {
        if (a.getAttribute("rel").indexOf("style") != -1 &&
            a.getAttribute("title") &&
            ! a.disabled)
            return a.getAttribute("title");
    }
    return null;
}

function style_get_preferred_stylesheet()
{
    var i, a;
    for (i = 0; (a = document.getElementsByTagName("link")[i]); i++)
    {
        if (a.getAttribute("rel").indexOf("style") != -1 &&
            a.getAttribute("rel").indexOf("alt") == -1 &&
            a.getAttribute("title"))
            return a.getAttribute("title");
    }
    return null;
}

function style_create_cookie(name, value, days)
{
    var expires = null;
    if (days)
    {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else
    {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function style_read_cookie(name)
{
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++)
    {
        var c = ca[i];
        while (c.charAt(0) == ' ')
            c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0)
            return c.substring(nameEQ.length,c.length);
    }
    return null;
}

window.onload = function(e)
{
    var cookie = style_read_cookie("style");
    var title = cookie ? cookie : style_get_preferred_stylesheet();
    style_set_active_stylesheet(title);
}

window.onunload = function(e)
{
    var title = style_get_active_stylesheet();
    style_create_cookie("style", title, 365);
}

var cookie = style_read_cookie("style");
var title = cookie ? cookie : style_get_preferred_stylesheet();
style_set_active_stylesheet(title);

