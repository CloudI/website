****************
HTML Integration
****************

.. index::
 single: Web Socket 


Once the Book Service has been developed, integration with the HTML pages is straightfoward.  Note that the HTML pages use the JQuery Mobile framework which simplifies much of the Javascript coding.  If you use a different (or no) web framework the general principles would remain the same.  

.. note::

 The HTML pages use the Web Sockets integration method which is part of the HTML5 specification.  Web Sockets may not work correctly on older browsers. 


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

Next, the web socket is opened using the following code:

::

  web_socket = new WebSocket(host_url + service_name);


Web sockets raise events and a function is defined that will handle the **onopen** event.  In this case, when the socket is opened then the **send** function will be called:

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


Complete Source
===============

.. todo::

  Add link to the HTML source code  

 
  
