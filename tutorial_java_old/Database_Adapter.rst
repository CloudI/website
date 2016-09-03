Database Adapter Service
========================

As stated in the CloudI FAQ
`<http://cloudi.org/faq.html#7_MySQL>`_
, a CloudI database service accepts requests from other CloudI services.  The service expects SQL input and provides the query result either as Erlang data or binary encoded data based on whether the input was Erlang data from an internal service or a binary SQL string.

.. index::
 single: Database Service 

Creating the MySQL Database Service
-----------------------------------

CloudI provides out-of-the-box adapters for many types of databases.  The example shown below is for a MySQL database, but the same general steps would apply for other database types.


1.  Stop CloudI
 
2.  Add the MySQL CloudI Service configuration to the **cloudi.conf** CloudI configuration file

.. note::
 Note that the database hostname, port, username, and password need to be changed for your environment.

::

 {services, [
   ...
   [{prefix, "/db/mysql/"},
    {module, cloudi_service_db_mysql},
    {args,
     [{database, "book"},
      {timeout, 20000}, % ms
      {encoding, utf8},
      {hostname, "192.168.0.5"},
      {username, "cloudi"},
      {password, "secret"},
      {port, 3306}]}],
   ...
  ]}.

.. warning::
 Notice that the username and password must be stored in plain-text in the configuration file leading to a potential security vulnerability.  In addition, the username and password is reported when the list of services is requested.  
.. note::
 The name of the database adapter service (the service name) is the concatenation of the service configuration prefix and the database name provided as a service configuration argument (in the ``database`` key/value tuple).  In this example, the service name used as the destination for any MySQL CloudI service requests is ``"/db/mysql/book"``.

3.  Start CloudI

4.  Inspect the log files (**/usr/local/var/log/cloudi/erlang.log.1** and **/usr/local/var/log/cloudi/cloudi.log**) for any errors. A common error is to have an extra or missing comma at the end of the block that was added.  

5.  List the CloudI services and verify that the database is included in the list. 

::

  curl http://localhost:6464/cloudi/api/erlang/services

.. index::
 single: Erlang Shell

Testing the Service
-------------------

You can test the database service by using the ``cloudi`` module and the associated Erlang VM shell.  A simple example is shown below.  Note that Erlang syntax is case-sensitive and each command must be terminated with a period character:

::

  sudo cloudi attach

  1> Context = cloudi:new().  
  2> cloudi:send_sync(Context, "/db/mysql/book", "SELECT * FROM items WHERE id = 1").

.. NOTE::
	To exit the Erlang shell, press the Control-D key combination.
