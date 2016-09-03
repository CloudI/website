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
**/usr/local/etc/cloudi/**
directory.
For initial development, use the following steps to modify the CloudI configuration file.

1.  Make a copy of the default CloudI configuration file.

::

  sudo cp /usr/local/etc/cloudi/cloudi.conf /usr/local/etc/cloudi/cloudi.conf.default


2.  Modify the **cloudi.conf** configuration file to have the contents below:

::

 {acl, [
  ]}.
 {services, [
   [{prefix, "/cloudi/api/"},
    {module, cloudi_service_api_requests}],
   [{prefix, "/book/"},
    {module, cloudi_service_http_cowboy},
    {args, [{port, 6464}, {output, external}, {use_websockets, true}]}]
  ]}.
 {logging, [
   {level, debug} % levels: off, fatal, error, warn, info, debug, trace
  ]}.

.. note::
 It is important to realize that all services listed in the **cloudi.conf** file must start successfully when CloudI is first started.  If any service listed in the configuration file fails to initialize successfully, CloudI will automatically shutdown.  Handling service initialization with fail-fast mechanics ensures the system has an error-free starting state.  Service configuration is the best time to find errors in a service since normally the execution lifetime of a service is undefined.

.. index::
 single: Log Files

Viewing Logs
------------

The default location of CloudI log files is the
**/usr/local/var/log/cloudi/**
directory.  By default the **cloudi.log** file contains CloudI log output.
The log file destination can be changed by modifying the **cloudi.conf** **logging** configuration value for **file**.

::

 {logging, [
   {file, "FILEPATH"}, 
   ...
  ]}.
  

Service Development Workflow
----------------------------

.. note::
 To ensure all services initialize successfully we will modify the **cloudi.conf** CloudI configuration file to add new services.  All services in the **cloudi.conf** file are in a single list which defines the service startup order.  Service dependencies are listed before any of the services that depend on them.  


Typical development and testing when working with CloudI consists of the following steps:

1.  Specify any custom Erlang source code path locations

 Add ``-pz PATH`` lines to the **/usr/local/etc/cloudi/vm.args** file.

2.  Compile custom CloudI service source code

::

  erlc -pz /usr/local/lib/cloudi-1.5.0/lib/cloudi_core-1.5.0 \
       -pz /usr/local/lib/cloudi-1.5.0/lib/cloudi_core-1.5.0/ebin book.erl 

3.  Add custom CloudI services to the **cloudi.conf** CloudI configuration file

::

 {services, [
   ...
   [{prefix, "/recommend/book/"},
    {module, book}],
   ...
  ]}.

4.  Start CloudI

::

  sudo cloudi start 

5.  List the running services

::

  curl http://localhost:6464/cloudi/api/erlang/services 

5.  Run service tests

::

  ...
  curl http://localhost:6464/recommendation/book?item=45388
  ...

6.  Stop CloudI

::

  sudo cloudi stop


Working with the Database
=========================

.. index::
 single: book.sql

Building the Database 
---------------------
The SQL script to create the *book* database schema is provided in the **scripts/book.sql** file. You can create this schema using the MySQL command line tool as shown in the example below. 

::

  mysql -u root -p < book.sql


Creating Users
--------------
You also should create a special user that can connect to the *book* schema and can add, update, or delete records.  An example using the MySQL command line tool is shown below.

::

  mysql -u root -p << EOF
  GRANT ALL ON book.* to cloudi@'localhost' IDENTIFIED BY 'secret';
  EOF

.. note::
  The GRANT statement also specifies the server which the user is allowed to connect from.  If CloudI is going to be running in a clustered configuration, you will need to add access for each node in the cluster.

