************
Starting Out
************

Working with CloudI
===================

.. index::
 single: cloudi.conf

Setting up the CloudI Configuration
-----------------------------------

When CloudI is installed, several default configuration files are created.
These files are located in the
**/usr/local/etc/cloudi**
directory.
For initial development, the following suggested changes should be made.
   
1.  Make a copy of the original configuration file.

::

  sudo cp /usr/local/etc/cloudi/cloudi.conf /usr/local/etc/cloudi/cloudi.conf.original


2.  Adjust the log setting by changing the settings in the
    **cloudi.conf**
    file.  The original configuration has a “trace” log level and this generates a very large quantity of messages.
    Setting the level to “debug” is probably more appropriate for development purposes. 

::

 {logging, [
	 %{file, "path/to/logfile"},
	 {level,
	 debug
	 }, % levels: off, fatal, error, warn, info, debug, trace

	...


3.  The standard installation includes a number of test services.
    These test services can consume a fair amount of CPU resources and can clutter up the logs.
    During active development, you are likely going to be restarting the CloudI service frequently, so it makes sense to remove anything you don't need.
    You can do this by removing or commenting out the test services located in the
    **cloudi.conf**
    file. An example is shown below where the % sign is used to comment out an entry.

::

  %{internal,
  %"/tests/flood/",
  %cloudi_service_flood,
  %[{flood, "/tests/flood/java", <<"DATA">>, 1000}],
  %lazy_closest,
  %5000, 5000, 5000, [api], undefined, 2, 5, 300, []},

.. tip::

 Unfortunately, you can not just remove all the test services, because some of them are used to implement core functions that you will likely need.  


The Book Recommendation application requires the services shown in the following table.

=================  =========================== =========================================
Subscription Path  Service Name                Comments
=================  =========================== =========================================
/cloudi/api        cloudi_service_api_requests 
/tests/websockets  cloudi_service_http_cowboy
/tests/http        cloudi_service_http_cowboy  There are two entries for different ports
=================  =========================== =========================================


4.  It is important to realize that all services listed in the **cloudi.conf** file must start successfully when the cloud is first started.  
    In other words, the failure of any service listed in the configuration file will keep the entire cloud from starting to ensure an error-free starting state.  Seperate configuration methods will be used to show how a cloud may grow.


.. index::
 single: Log Files

Viewing Logs
------------

The default location of CloudI log files is the
**/usr/local/var/log/cloudi/**
**logs**
directory.  You can change the location of the log files by modifying the
**cloudi.conf**
file and removing the % comment. 
::

  {logging, [
  %{file, "**path/to/logfile**"}, 
  {level, debug
  }, % levels: off, fatal, error, warn, info, debug, trace


Automating the Build Process
----------------------------

The typical build process when working with CloudI consists of the following steps:

*   Starting CloudI

*   Specifying the code path location using the CloudI Service API

*   Compilation of custom code

*   Adding custom code to CloudI using the CloudI Service API

*   Running test services

*   Stopping CloudI



The use of some sort of automated build process to perform these steps is well worth the effort.
Options range from a simple shell script, to a make file, to more complicated build tool.
Pick a mechanism that is simple and something that you are familiar with.
An example shell script for the Book Service (see next section for more details) is listed below. 
::

  #!/bin/sh
  #
  # These scripts are used to load the Book services into the Cloudi engine
  #

  # Add the current directory to the code path
  curl -X POST -d '"'`pwd`'"' http://localhost:6467/cloudi/api/erlang/code_path_add

  # Compile all Erlang modules
  erlc -pz /usr/local/lib/cloudi-1.5.0/lib/cloudi_core-1.5.0 -pz /usr/local/lib/cloudi-1.5.0/lib/cloudi_core-1.5.0/ebin book.erl 

  # Add the Book service
  curl -X POST -d @book.conf http://localhost:6467/cloudi/api/erlang/services_add

  # Display list of services
  curl http://localhost:6467/cloudi/api/erlang/services 

  # Call the Book Service
  curl http://localhost:6467/recommendation/book?item=45388


.. index::
 single: Starting / Stopping CloudI
 single: Listing Services
 single: Code Search Path

Common Operations
-----------------

Common operations for working with CloudI are shown below.

1.  Starting / Stopping CloudI 
::

  sudo cloudi start 

  sudo cloudi stop

2.  Listing services

This command is useful for viewing what services have been defined in the cloud. ::

  curl http://localhost:6467/cloudi/api/erlang/services

3.  Listing the code search paths 
::

  curl http://localhost:6467/cloudi/api/erlang/code_path

4. Adding a code search path 
::

  curl -X POST -d '"/home/user/code/services"' http://localhost:6467/cloudi/api/erlang/code_path_add


Working with the Database
=========================

.. index::
 single: book.sql

Building the Database 
---------------------
A script of SQL commands needed to build the *book* database schema is provided in the **scripts/book.sql** file. You can create this schema using the MySQL command line tool as shown in the example below. 

::

  mysql -u root -p < book.sql


Creating Users
--------------
You also should create a special user that can connect to the *book* schema and can add, update, or delete records.  An example using the MySQL command line tool is shown below.

::

  mysql -u root -p < book.sql
  GRANT ALL ON book.* to cloudi@'localhost' IDENTIFIED BY 'secret';
  quit;

.. note::
  The GRANT statement also tells MySQL which hosts the user is allowed to connect from.  If CloudI is going to be running in a clustered configuration then you will need to add grant access for each node in the cluster.

