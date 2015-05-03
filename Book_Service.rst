************
Book Service
************

Configuration File
==================
Every service running in CloudI needs certain configuration information to be defined.  It is possible to dynamically add or remove services while CloudI is running and doing so can facilitate transparent updates or transitions between service implementations.  However, during system development it is safest to fully utilize the **cloudi.conf** CloudI configuration file for all the critical services the system requires, to ensure the critical services initialize upon CloudI startup.

Add the book service to the **/usr/local/etc/cloudi/cloudi.conf** file and restart CloudI:

::

 {services, [
   ...
   [{prefix, "/recommend/book/"},
    {module, book}],
   ...
  ]}.


.. note::
 Many service configuration arguments are available with typical defaults.  More information about the available service configuration arguments is available `here <http://cloudi.org/api.html#2_services_add>`_



Module Outline
==============
The Book Service module is split into several sections.  In this tutorial, the Book Service is developed using the Erlang language, but other languages supported by CloudI could have been used.  

 #.  Service initialization logic - needs to be customized for each application
 #.  Code for handling request messages - needs to be customized for each application
 #.  Code for handling informational messages - can use standard pattern
 #.  Logic for dealing with service termination - can use standard pattern
 #.  Logic for handling application-specific processing

Each of these sections is described in more detail below.

.. index::
 single: cloudi_service_init

Service Initialization Logic 
----------------------------

::

 cloudi_service_init(_Args, _Prefix, _Timeout, Dispatcher) ->

    % subscribe to different request patterns
    cloudi_service:subscribe(Dispatcher, "newbooks/get"),
    cloudi_service:subscribe(Dispatcher, "popularbooks/get"),
    cloudi_service:subscribe(Dispatcher, "recommendedbooks/get"),
    cloudi_service:subscribe(Dispatcher, "allbooks/get"),
    cloudi_service:subscribe(Dispatcher, "download/get"),
    cloudi_service:subscribe(Dispatcher, "newuser/get"),
    cloudi_service:subscribe(Dispatcher, "unrated/get"),
    cloudi_service:subscribe(Dispatcher, "rate/get"),
    cloudi_service:subscribe(Dispatcher, "/post"),

    % return ok
    {ok, #state{}}.

In the code above, the Book Service defines which messages it subscribes to.  Note that the list of request patterns matches the Service API table shown earlier in the :ref:`service-api-reference` section with the HTTP method type (*get* or *post*) appended. 

.. note::
 TODO: first pass continue from here:

Handling Requests
-----------------

.. index::
 single: cloudi_service_handle_request 
 single: Logging functions 

A simplified example for handling book service requests is shown below. Note that the underscore pattern is used to handle unexpected requests.

::

 cloudi_service_handle_request(Type, Name, Pattern, _RequestInfo, Request,
                              _Timeout, _Priority, _TransId, _Pid,
                              #state{} = State, Dispatcher) ->
    
        ?LOG_INFO("Handle Request: Type=~p, Name=~p, Pattern=~p, Request=~p", [Type, Name, Pattern, Request]),

        % based on the pattern and request, perform the appropriate action
        case Pattern of
                "/recommend/book/newbooks/get" ->
                        ReplyRecord = find_new(Dispatcher);

                "/recommend/book/popularbooks/get" ->
                        ReplyRecord = find_popular(Dispatcher);

                _ ->
                        ReplyRecord = cloudi_x_jsx:encode(["Invalid Request"])
        end,

        % send reply
        ?LOG_DEBUG("Sending reply=~p", [ReplyRecord]),
        {reply, ReplyRecord, State}.


.. tip:: 

  CloudI provides several pre-defined macros for logging. The LOG_INFO and LOG_DEBUG functions are shown in the example above.
 

.. index::
 single: cloudi_service:send_sync

Calling the MySQL Database Adapter
----------------------------------
Example Erlang source code for calling the MySQL Database Adapter is shown below:

::

  Query = "SELECT id, title FROM items",
  case cloudi_service:send_sync(Dispatcher, "/db/mysql/book", Query) of
      {ok, Result} ->
          parse_items(Result);
      {error, _} ->
          cloudi_x_jsx:encode(<<"No data found">>)
  end.

First, a string containing the SQL query is constructed.  Next, the service named ``"/db/mysql/book"`` is used to create a synchronous service request with the query.  Then the result of the query is matched to determine if the service request received a response (meaning the transaction is complete).  If the ``ok`` tuple is matched, the service request received a valid service response which indicates the MySQL database handled the query successfully (even if the SQL in the query produced an SQL error).  If the ``error`` tuple is matched, the service request did not receive a service response which would be caused by the timeout value being exceeded for the response or the MySQL CloudI service not existing.

Parsing the Results
-------------------

The Book Service uses several utility functions named **parse_items** and **parse_item** to handle the data returned from the database and encode it using the JSON format.

::

  parse_items({result_packet, _, Columns, List, _Trailer}) ->
        Return_value = parse_item(List),
        Return_value.

  parse_item(List)  ->
        parse_item(List, []).

  parse_item([H|T], Return_value)  ->
        % Note that the record can contain different numbers of colulmns
        % and that the columns need to be in the correct positions
        case H of 
                [Id, Title, Author, Language, Date, Web_page, Subject, Downloads] -> 
                        Item = #item{id=Id, title=Title, creator=Author, language=Language, date_created = Date, web_page=Web_page, subject=Subject, downloads=Downloads},      

                        Encoded_item = cloudi_x_jsx:encode(
                                [
                                  {<<"id">>, Item#item.id},
                                  {<<"title">>, Item#item.title},
                                  {<<"creator">>, Item#item.creator},
                                  {<<"language">>, Item#item.language},
                                  {<<"web_page">>, Item#item.web_page},
                                  {<<"subject">>, Item#item.subject},
                                  {<<"downloads">>, Item#item.downloads}
                                ]);

               [Id, Title] ->
                        Item = #item{id=Id, title=Title},

                        Encoded_item = cloudi_x_jsx:encode(
                                [
                                  {<<"id">>, Item#item.id},
                                  {<<"title">>, Item#item.title}
                                ]) 
        
        end,    

        ?LOG_TRACE("Item=~p", [Item]),

        Temp_return_value = [Return_value | Encoded_item], 
        New_return_value = [Temp_return_value | ","], 

        parse_item(T, New_return_value);

  parse_item([], Return_value) ->
        % strip the trailing comma from the return value
        Temp = string:strip(Return_value, right, $,),

        % add brackets around the return string
        string:concat(string:concat("[", Temp), "]").



.. index::
 single: cloudi_service_handle_info

Handling Informational Messages
-------------------------------
The ``cloudi_service_handle_info`` function is used for handling spontaneous messages to the service.  For example, if this service is linked to another process and that process unexpectedly halts, an exit trap message may be received.  Typically, the response to this message is to do nothing and the pattern shown below can be used with no modifications.

::

  cloudi_service_handle_info(Request, State, _) ->
    {noreply, State}.

.. index::
 single: cloudi_service_terminate

Service Termination
-------------------
The ``cloudi_service_terminate`` function is called when the CloudI server is shutting down and about to terminate.  You can add any logic needed to cleanup any resources used by this service or do additional notifications.  If nothing special is needed, you can use the pattern shown below.    

::
  cloudi_service_terminate(_Reason, _Timeout, #state{}) ->
    ok.

Complete Source
---------------
The complete source is located on GitHub `here <https://github.com/CloudI/tutorial_book_service_example>`_  in the **service** folder. 


Adding the Service to CloudI
============================

Adding the Book Service to CloudI requires three steps.  First, the code is compiled.  Next, the location of the source code is added using the CloudI API.  Finally, the service is added using the CloudI API.  

:: 

  # compile code
  erlc -pz /usr/local/lib/cloudi-1.5.0/lib/cloudi_core-1.5.0 -pz /usr/local/lib/cloudi-1.5.0/lib/cloudi_core-1.5.0/ebin book.erl

  # add the source code path
  curl -X POST -d /opt/cloudi/book/ebin http://localhost:6467/cloudi/api/erlang/code_path_add

  # add the service using the attached configuration file 
  curl -X post -d @book.conf http://localhost:6467/cloudi/api/erlang/services_add


.. tip:: 

  During initial development, adding the source code path and the configuration using the API services as shown above can be useful for making and testing incremental changes.  Later when development is complete, this information can be added directly to the CloudI configuration files if desired.


Testing the Service
===================

The service can be tested using an HTML browser as shown below.

::

  curl http://localhost:6467/recommend/book/newbooks
  curl http://localhost:6467/recommend/book/popularbooks
  curl http://localhost:6467/recommend/book/recommendedbooks?user=1
  curl http://localhost:6467/recommend/book/allbooks?id=1

