**********
Deployment 
**********

There are several optional activities that you may want to do to deploy your application for production usage.

=====================
Network Configuration
=====================

Depending on your application, you may need to modify the default network configuration used by the CloudI components. Some common modifications are listed below.

.. index::
 single: Network Bind Address

Bind Address
------------
By default, the Cowboy web server listens only to the local host network address of 127.0.0.1. If you want CloudI to be accessible on your network, you can change this using these steps:

1.  Change the current directory to the installation files for CloudI. Note that your location may be different than what is shown below.

::

  cd /opt/cloudi/cloudi-1.5.0/src

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


4.  Remove the Cowboy runtime library directory so that it will get rebuilt by the installation process.

::

  cd /usr/local/lib/cloudi-1.5.0/lib
  sudo rm cloudi_service_http_cowboy_1.5.0

5.  Then run the **make** and **make install** command from the installation source directory and reinstall the software.

::

  cd /opt/cloudi/cloudi-1.5.0/src
  make
  sudo make install 
 
.. note::

  Reinstalling CloudI will change the cloudi.conf, app.config, and vm.args files in the runtime library.  The previous versions are automatically saved as cloudi.conf.old, app.config.old, and vm.args.old and you may need to restore these files if you have made any changes.


=====================
Cluster Configuration
=====================

CloudI provides a mechanism for easily adding or removing different host computers to a cluster. Typically each host computer is referred to as a **node**.

Adding Nodes to the Cluster
---------------------------

Adding a host computer to the CloudI cloud is as simple as installing CloudI on the computer and starting the CloudI software.  By default, CloudI uses an auto-discovery protocol provided by Erlang to detect new nodes.

.. note::

  The auto-discovery protocol is dependent on the TCP/IP multicast protocol and should generally be limited to computers connected to the same trusted local area network.  

  Additional reference is available at  
  `here <http://learnyousomeerlang.com/distribunomicon#setting-up-an-erlang-cluster>`_

You can also manually add a node to the CloudI cluster using the API as shown by the following example.

::

  curl -X POST -d "['cloud001@cluster1']" http://localhost:6467/cloudi/api/rpc/nodes_add.erl 

.. tip::

 CloudI also supports the Amazon Web Services (AWS) EC2 distributed Erlang node auto-discovery configuration (auto-discovery within a single region).  See the CloudI API `here <http://cloudi.org/api.html#2_nodes_set>`_ for more details.

Failing Over Nodes In the Cluster
---------------------------------

If a node was added using the auto-discovery protocol described above, it is automatically removed if it becomes unavailable.  

If you manually added the node using the CloudI API, you can remove it using the API as shown in the example below.

:: 

 curl -X POST -d "['cloud001@cluster1']" http://localhost:6467/cloudi/api/rpc/nodes_remove.erl  


Testing the Cluster Configuration
---------------------------------

Use the CloudI API to show any nodes (other than the current local host) that it is aware of.

::

 curl http://localhost:6467/cloudi/api/rpc/nodes.erl 


Service Redundancy
------------------

When a new node is added to a CloudI cluster, it is important to realize that services running on the existing nodes in the cluster are not automatically copied to the new node.  However, you can manually add a service to a node using the CloudI API as described in other sections of this tutorial. 

.. index::
 single: Destination Refresh 
 single: Immediate Lookup
 single: Lazy Lookup 
 single: Closest Service
 single: Furthest Service
 single: Random Service
 single: Remote Service
 single: Newest Service
 single: Oldest Service

Local versus Remote Services
----------------------------

Note that when multiple services are available that subscribe to the same name pattern, CloudI allows you to control whether a local or remote service is invoked using the **destination refresh** method in the **services_add** API. 

===================================  ==========================================================================================================
Destination Refresh Method           Description
===================================  ==========================================================================================================
lazy_closest or immediate_closest    A service running on the local node will be selected, unless the destination only exists on a remote node.
lazy_furthest or immediate_furthest  A service running on a remote node will be selected, unless the destination only exists on the local node.
lazy_random or immediate_random      A service is selected randomly from the subscribed services.
lazy_local or immediate_local        Only a service on the local node is selected
lazy_remote or immediate_remote      Only a service on the remote node is selected
lazy_newest or immediate_newest      Only the most recently subscribed service is selected
lazy_oldest or immediate_oldest      Only the first subscribed service is selected
===================================  ==========================================================================================================

The **immediate** prefix instructs CloudI to lookup the service name to get the most current destination result.  The **lazy** prefix uses a cached value instead.  
More details are available `here <http://cloudi.org/api.html#1_Intro>`_ 

===========================
Loading Services on Startup
===========================

 During development, you typically add a service and code path to CloudI using the API.  However, when development has completed, you may wish to have the service start automatically.  

.. note::

 It is important to realize that all services listed in the cloudi.conf file must start successfully when the cloud is first started. In other words, the failure of any service listed in the configuration file will keep the entire cloud from starting to ensure an error-free starting state.

To add the Book Service to start automatically, follow these steps.

1.  Change the current directory to the CloudI run time location. Note that this might be different for your installation

::

  cd /usr/local/lib/cloudi-1.5.0/

2.  Create a new directory for the Book service and any compiled files.  The directory name should conform to the language conventions for your service.

::

  mkdir book 
  mkdir book/ebin

3.  Place the compiled Book Service file (book.beam) in the directory created above.

::

  cp /tmp/book.beam book/ebin


4.  Modify the **vm.args** file stored in the **/usr/local/etc/cloudi** directory and add the location of the directory created in Step 2. 

::

  # Book service code path
  -pz /usr/local/lib/cloudi-1.5.0/book/ebin/


5.  Modify the **cloudi.conf** file stored in the **/usr/local/etc/cloudi** directory and add the database service described in Section 4.1 and the configuration settings described in Section 5.1.  When completed, the **cloudi.conf** file should contain lines similar to what's shown below.

::

        %
        % Book Recommendation services
        %

        % database service
        {internal,
                "/db/mysql/",
               cloudi_service_db_mysql,
               [{database, "book"},
                {timeout, 20000}, % ms
                {encoding, utf8},
                {hostname, "dev1"},
                {username, "cloudi"},
                {password, "secret"},
                {port, 3306}],
               none,
               50000, 50000, 50000, undefined, undefined, 1, 5, 300, []
        },

        % book service
        {internal,
                "/recommend/book/",
                book,
                [],
                immediate_random,
                60000, 60000, 60000, undefined, undefined, 3, 5, 900,
                [{reload, true}, {queue_limit, 500}]
        }
 

.. note::

 For a production deployment, you might want to modify the *destination refresh method* to use a random node in the cluster as shown above.  You may also want to increase the number of processes created at startup.  In this example, the database service has **1** process created at startup and the book service has **3** processes created. 


6.  Restart cloudi and inspect the cloudi.log file to make sure that everything started correctly.

7.  Repeat Steps 1 through 6 for every node in the cluster.




