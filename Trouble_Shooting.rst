****************
Trouble Shooting
****************

.. todo::

 This section is in progress


Source Code Paths
=================


Timeout
=======

There are several possible causes of a timeout error.  

1. Incorrect Dispatcher Pattern

  For example, in the development of the Book Service the original service initialization logic had code that looked like this:

:: 

 cloudi_service:subscribe(Dispatcher, "recommendbooks/get")

However, the pattern was misspelled and should have looked like this:

::

 cloudi_service:subscribe(Dispatcher, "recommendedbooks/get")

Consequently, when the **recommendedbooks** service was invoked the CloudI dispatcher could not find any module that was subscribing to the request and generated a timeout.


Old Code Appears to be Running
==============================

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
