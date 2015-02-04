****************
HTML Integration
****************

.. index::
 single: WebSocket 


Once the Book Service has been developed, integration with the HTML pages is straightfoward.  Note that the HTML pages use the JQuery Mobile framework which simplifies much of the Javascript coding.  If you use a different (or no) web framework the general principles would remain the same.  

.. note::

 The HTML pages use the WebSocket integration method which is part of the HTML5 specification.  WebSockets may not work correctly on older browsers. 

.. index::
 single: Cowboy
 single: WebSocket 

Enabling WebSockets
===================

Support for WebSockets is disabled in the default configuration of the Cowboy web server used with CloudI.  To enable WebSockets follow these steps.

1.  Change the current directory to the installation files for CloudI. Note that your location may be different than what is shown below. 

::

  cd /opt/cloudi/cloudi-1.4.0/src

2.  Change the current directory to the Cowboy HTTP source

::

  cd lib/cloudi_service_http_cowboy/src


3.  Edit the **cloudi_service_http_cowboy.erl** file and change the line that looks like:

::

  -define(DEFAULT_USE_WEBSOCKETS,                   false).

to 

::

  -define(DEFAULT_USE_WEBSOCKETS,                   true).

4.  Remove the Cowboy runtime library so that it will get rebuilt by the installation process.

::

  cd /usr/local/lib/cloudi-1.4.0/lib
  sudo rm cloudi_service_http_cowboy_1.4.0

5.  Then run the **make** and **make install** command from the installation source directory and reinstall the software.

::

  cd /opt/cloudi/cloudi-1.4.0/src
  make
  sudo make install 

.. note::

  Reinstalling CloudI will change the cloudi.conf, app.config, and vm.args files in the runtime library.  The previous versions are automatically saved as cloudi.conf.old, app.config.old, and vm.args.old and you may need to restore these files if you have made any changes.



Calling the Book Service
========================

Invocation of the Book Service is done using Javascript and consists of several different functions shown below.

First, some global variables are defined:

::

    // Customize for your environment
    var web_socket = undefined;
    var host_url = "ws://127.0.0.1:6464";
    var service_name = "/recommend/book/newbooks";
    var request_type = "get";

Next, the WebSocket is opened using the following code:

::

  web_socket = new WebSocket(host_url + service_name);


WebSockets raise events and a function is defined that will handle the **onopen** event.  In this case, when the socket is opened then the **send** function will be called:

:: 

    // define function that is called when the web socket is opened
    web_socket.onopen = function () {
            send();
    };

The **send** function is defined as follows:

::

    function send() {
        // if the web socket is in an open status then send the request
        if (web_socket.readyState == web_socket.OPEN) {
            web_socket.send(request_type);
        }
    }


When a message is received by the socket, the **onmessage** event is raised, and is handled by the following function:

::

        web_socket.onmessage = function (evt) {
            var data = evt.data;
            if (is("Blob", data)) {
                var reader = new FileReader();
                reader.readAsText(data, "text/plain");
                reader.onload = function (reader_evt) {
                    data = reader_evt.target.result;
                    handle_message(data);
                };
            }
            else {
                handle_message(data);
            }
        };

The detailed processing of the message is performed by the **handle_message** function described below.

.. index::
 single: JSON


Parsing the Results
===================

A simplified version of the **handle_message** function is shown below:

::

        handle_message = function (data) {

            if (data.startsWith("notification:")) {
                // client state check to determine this is an incoming
                // service request, not an incoming response
                var response = "ok";
                web_socket.send(response);
            }
            else {
                if (data != "got connect! yay!") {

                    // parse the JSON array
                    var obj = JSON.parse(data);

                    // add items to the list
                    $.each(obj, function (i, item) {
                        //alert("Item ID = " + item.id);
                        //alert("Title = " + item.title);
                        var tag = "<li>" + item.title + "</li>";
                        $("#itemList").append(tag).listview('refresh');
                    });

                }
            }
        };


Parsing the JSON string that contains an array of **items** returned by the Book Service is very simple and performed by the code:

::

  // parse the JSON array
  var obj = JSON.parse(data);

Referencing individual attributes of an item is done like this:

::

    item.id 
    item.title

.. index::
 single: AJAX 
 single: CORS 

Using AJAX instead of WebSockets
================================

The use of WebSockets for integration of HTML pages with CloudI as shown in the preceeding sections is simple and efficient.  However, there is one limitation when using the default CloudI / Cowboy configuration - namely that only GET operations are supported.  A simple work around is to use the XML HTTP Request mechanism.  Because your HTML pages might be hosted at a different port or location then the CloudI service, a Cross-Origin Resource Sharing (CORS) request will be demonstrated below using the same general outline used earlier in the WebSocket example.

First, some global variables are defined:

::

    // Customize for your environment
    var service_host = "http://localhost:6467";
    var rank_book_service = "/recommend/book/download";


Next, a utility function is created:

::

  function createCORSRequest(method, url) {
    console.log("Creating CORS Request " + method + " " + url);

    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {

      // Check if the XMLHttpRequest object has a "withCredentials" property.
      // "withCredentials" only exists on XMLHTTPRequest2 objects.
      xhr.open(method, url, true);

    } else if (typeof XDomainRequest != "undefined") {

      // Otherwise, check if XDomainRequest.
      // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
      xhr = new XDomainRequest();
      xhr.open(method, url);

    } else {

      // Otherwise, CORS is not supported by the browser.
      xhr = null;
      console.log("XHR not supported by this browser");

    }
    return xhr;
  }


Next, code for creating and sending the CORS request is defined:

::

  function rank_book(user_ID, item_ID, rating) {
    // create a CORS request
    var service_url = service_host + rank_book_service;
    var xhr = createCORSRequest('POST', service_url);
    if (!xhr) {
      throw new Error('CORS not supported');
    }

    // define a function to handle the response
    xhr.onload = function() {
      var responseText = xhr.responseText;
      console.log(responseText);
      // process the response.
      return;
    };

    // define a function to handle errors
    xhr.onerror = function() {
      console.log('There was an error!');
      return;
    };

    // send the request
    xhr.send('?user_ID=\"' + user_ID + '\"' + '&item_id=\"' + item_ID + '\"' + '&rating=\"' + rating + '\"');
  } 
 

Complete Source
===============

The complete source is located on GitHub `here <https://github.com/brucekissinger/book_recommendation>`_  in the **html** folder.

