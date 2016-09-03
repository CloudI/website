******
ZeroMQ
******

.. todo::

 This section has not yet been written


Installing ZeroMQ
==================

Download and install ZeroMQ `here <http://zeromq.org/area:download>`_

Download and install the Java binding for ZeroMQ named jzmq `here <https://github.com/zeromq/jzmq>`_

Using ZeroMQ and JZMQ with Java requires some special options to be passed to the Java runtime.  Follow the installation steps carefully and verify that the sample JZMQ applications can be run successfully. For example, assuming that JZMQ was installed in the **/opt/jzmq/jzmq-master** directory, you could run the **local_lat** Java program using the command

::

 java -Djava.library.path=/usr/local/lib -classpath /opt/jzmq/jzmq-master/src/main/perf local_lat tcp://127.0.0.1:5555 1 100

Note also that the JZMQ classes are not packaged into a single JAR file and that your custom-developed Java application will need to point to the **/opt/jzmq/jzmq-master/src/main/perf** directory to find the needed class files. 

Configuring Endpoints
=====================

 
Testing the Configuration
=========================


