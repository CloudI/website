*********************
Network Configuration
*********************

Depending on your application, you may need to modify the default network configuration used by the CloudI components. Some common modifications are listed below.

.. index::
 single: Network Bind Address

Bind Address
============
By default, the Cowboy web server listens only to the local host network address of 127.0.0.1. If you want CloudI to be accessible on your network, you can change this by following these steps:

1.  Change the current directory to the installation files for CloudI. Note that your location may be different than what is shown below.

::

  cd /opt/cloudi/cloudi-1.4.0/src

2.  Change the current directory to the Cowboy HTTP source

::

  cd lib/cloudi_service_http_cowboy/src


3.  Edit the **cloudi_service_http_cowboy.erl** file and change the line that looks like:

::

-define(DEFAULT_INTERFACE,                  {127,0,0,1}). % ip address

to

::

  -define(DEFAULT_INTERFACE,                  {0,0,0,0}). % ip address

.. note::

  An address of 0.0.0.0 will cause Cowboy to listen to any network interface on the server.


4.  Remove the Cowboy runtime library directory so that it will get rebuilt.

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


