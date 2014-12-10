************
Book Service
************

.. todo::

 This section is in the process of being written.


.. index::
 single: book.conf file

Configuration File
==================
Every service running in Cloudi needs certain configuration information to be defined.  Typically, this information is stored in a separate file for each service and specified when the service is added.  

The configuration file for the Book Service is shown below and is stored in a file named **book.conf**.

::

  [{
    internal,
    "/recommend/book/",   
    book,		  
    [],			  
    immediate_closest,   
    5000,		
    5000, 	
    5000, 
    undefined, 	
    undefined, 
    1,	
    5, 
    300,
    [{reload, true}, {queue_limit, 50}] 
  }]


A table describing each of these parameters is listed below.  

=========================   ==============================================================================================
Parameter Value		    Description	
=========================   ==============================================================================================
internal		    Service type - either internal or external
"/recommend/book/"          Service name prefix
book		            Erlang module name
[]			    Module initializion list
immediate_closest           Destination refresh method
5000 		            Initialization timeout in milliseconds
5000  		            Default asynchronous timeout in milliseconds
5000  		            Default synchronous timeout in milliseconds
undefined  		    Destination deny ACL
undefined  	            Destination allow ACL
1 			    Process count 
5   		            Maximum number of restarts 
300  		            Maximum time in seconds 
[                           Beginning of service options property list
{reload, true}              Automatically reload the service when the module's file is updated on the filesystem
{queue_limit, 50}           Limit the total number of incoming service requests that are queued while the service is busy
] 	                    End of service options property list
=========================   ==============================================================================================

.. note::

  Access Control Lists (ACLs) are defined in Chapter 9. 


.. note::

 More information about the configuration settings and additional service options can be found `here <http://cloudi.org/api.html#2_services_add>`_



Module Outline
==============
The Book Service module is split into several sections.  In our example, the Book Service is developed using the Erlang language, but other language examples are displayed later. 

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

 cloudi_service_init(_Args, _Prefix, Dispatcher) ->

   % subscribe to different request patterns
   cloudi_service:subscribe(Dispatcher, "newbooks/get"),
   cloudi_service:subscribe(Dispatcher, "popularbooks/get"),
   cloudi_service:subscribe(Dispatcher, "recommendedbooks/get"),
   cloudi_service:subscribe(Dispatcher, "allbooks/get"),
   cloudi_service:subscribe(Dispatcher, "allbooks/post"),
   cloudi_service:subscribe(Dispatcher, "download/get"),
   cloudi_service:subscribe(Dispatcher, "download/post"),

   % return ok
   {ok, #state{}}.

In the code above, the Book Service defines which messages it subscribes to.  Note that the list of request patterns matches the Service API table shown earlier in Section 3.4.2 with the HTTP method type (*get* or *post*) appended. 

.. tip:: 

  The initialization section is also a good place to define the code path for any external libraries that this service depends on.  For example, in an earlier version of this code, the Jiffy JSON library was used.  Consequently, the additional lines shown below were added in this section.

::

  % Add the path to the Jiffy source
  code:add_path("/usr/lib/erlang/lib/jiffy-0.8.5/ebin"), 

  % Load Jiffy module manually
  code:load_file(jiffy),


Handling Requests
-----------------

.. index::
 single: cloudi_service:send_sync

Calling the MySQL Database Adapter
----------------------------------
The code for calling the MySQL Database Adapter is shown below.

::

  Query = "select id, title from items",

  Status = cloudi_service:send_sync(Dispatcher,
    "/db/mysql/book",
    <<>>,
    Query,
    undefined,
    undefined),

  case Status of
    {ok , Result} ->
      Json_result = parse_items(Result);
    _ ->
      Json_result = cloudi_x_jsx:encode(<<"No data found">>)
    end,

  Json_result.

First, a string containing the SQL query is constructed.  Next, the service named ``/db/mysql/book`` is invoked and the query is passed to it.  Then the value of the ``Status`` variable is matched and if the ``Status`` is ``ok``, the contents of the ``Result`` variable are parsed which returns a JSON encoded response.  If the ``Status`` is anything other than ``ok`` then the JSON encoded message ``No data found`` is returned.

Parsing the Results
-------------------

.. index::
 single: cloudi_service_handle_info

Handling Informational Messages
-------------------------------
The ``cloudi_service_handle_info`` function is used for handling spontaneous messages to the service.  For example, if this service is linked to another process and that process unexpectedly halts, an exit trap message may be received.  Typically, the response to this message is to do nothing and the pattern shown below can be used.

::

  cloudi_service_handle_info(Request, State, _) ->
    {noreply, State}.

.. index::
 single: cloudi_service_terminate

Service Termination
-------------------
The ``cloudi_service_terminate`` function is called when the CloudI server is shutting down and about to terminate.  You can add any logic needed to cleanup any resources used by this service or do additional notifications.  If nothing special is needed, you can use the pattern shown below.    

::

  cloudi_service_terminate(_, #state{}) ->
    ok.


Complete Source
---------------

.. todo::

  Add link to the Book Service source code  



Adding the Service to CloudI
============================

Adding the Book Service to CloudI requires three steps.  First, the code is compiled.  Next, the location of the source code is added using the CloudI API.  Finally, the service is added using the CloudI API.  

:: 

  # compile code
  erlc -pz /usr/local/lib/cloudi-1.3.3/lib/cloudi_core-1.3.3 -pz /usr/local/lib/cloudi-1.3.3/lib/cloudi_core-1.3.3/ebin book.erl

  # add the source code path
  curl -X POST -d /opt/cloudi/book/ebin http://localhost:6467/cloudi/api/erlang/code_path_add

  # add the service using the attached configuration file 
  curl -X post -d @book.conf http://localhost:6467/cloudi/api/erlang/services_add



Testing the Service
===================

The service can be tested using an HTML browser as shown below.

::

  curl http://localhost:6467/recommend/book/newbooks
  curl http://localhost:6467/recommend/book/popularbooks
  curl http://localhost:6467/recommend/book/recommendedbooks?user=1
  curl http://localhost:6467/recommend/book/allbooks?id=1

