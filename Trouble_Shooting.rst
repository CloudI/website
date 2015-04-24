****************
Trouble Shooting
****************

Source Code Paths
=================

A custom application may fail because the source code can not be located correctly.  

In the case of an Erlang application, the source code path can be specified in the **vm.args** file located in the */usr/local/etc/cloudi* directory.  

:: 

  # Book service code path
  -pz /usr/local/lib/cloudi-1.5.0/book/ebin/

For a Java application, the path to a JAR file can be specified as a parameter in the configuration. 

:: 

 {external,
        "/tests/http/",
        "/usr/bin/java",
        % enable assertions
        "-ea:org.cloudi... "
        "-jar tests/http/service/jar/service.jar",
        [],
        none, tcp, default,
        5000, 5000, 5000, undefined, undefined, 1, 4, 5, 300, []},

Note that the source code path can also be changed dynamically using the *code_path_add* API service.


Timeout
=======

There are several possible causes of a timeout error.  

1. Incorrect Dispatcher Pattern

  In the development of the Book Service the original service initialization logic had code that looked like this:

:: 

 cloudi_service:subscribe(Dispatcher, "recommendbooks/get")

However, the pattern was misspelled and should have looked like this:

::

 cloudi_service:subscribe(Dispatcher, "recommendedbooks/get")

Consequently, when the **recommendedbooks** service was invoked the CloudI dispatcher could not find any module that was subscribing to the request and generated a timeout.

2. Timeout Values Are Too Small

The configuration for each service includes a timeout value.  This value is specified in milliseconds -- not seconds.


WebSocket Connections Fail
===========================
Verify that WebSockets are enabled in the Cowboy configuration.  See the section :ref:`enabling_websockets_reference` in this tutorial for more details.

.. index::
 single: erl_crash.dump
 single: cloudi.conf
 single: app.config


Erlang Crash Dump
=================

A file named **erl_crash.dump** located in the main CloudI folder is generated when a system-wide error occurs.  Possible causes of this include:

1.  Incorrect Configuration File

If there are syntax errors in the **cloudi.conf** or **app.config** files, the CloudI system can not be started properly.  The solution is to carefully inspect the configuration files and make changes carefully. Storing previous versions of each configuration file and using these for comparison may also help. 


2.  Required Service Dependencies Not Met on Startup

All services listed in the **cloudi.conf** file must start successfully when the cloud is first started. In other words, the failure of any service listed in the configuration file will keep the entire cloud from starting to ensure an error-free starting state. 


Error Loading Java JAR File
===========================

When attempting to load a custom Java application into CloudI using a JAR file, an error of the form  **Error: Could not find or load main class** may be listed in the logs.  A possible cause of this error is a missing or incorrect *manifest* file inside the JAR file. 
See :ref:`jar_file_reference` for an example of the *manifest* file contents. 
