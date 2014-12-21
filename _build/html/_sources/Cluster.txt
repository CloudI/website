*********************
Cluster Configuration
*********************

CloudI provides a mechanism for easily adding or removing different host computers to a cluster.

Adding Nodes to the Cluster
===========================

Adding a host computer to the CloudI cloud is as simple as installing CloudI on the computer and starting the CloudI software.  By default, CloudI uses an auto-discovery protocol provided by Erlang to detect new nodes.

.. note::

  The auto-discovery protocol is dependent on the TCP/IP multicast protocol and should generally be limited to computers connected to the same local area network.  

  Additional reference is available at  
  `here <http://learnyousomeerlang.com/distribunomicon#setting-up-an-erlang-cluster>`_

You can also manually add a node to the CloudI cluster using the API as shown by the following example.

::

  curl -X POST -d "['cloud001@cluster1']" http://localhost:6467/cloudi/api/rpc/nodes_add.erl 

.. tip::

 CloudI also supports the Amazon Web Services (AWS) EC2 distributed Erlang node auto-discovery configuration (auto-discovery within a single region).  See the CloudI API `here <http://cloudi.org/api.html#2_nodes_set>`_ for more details.

Failing Over Nodes In the Cluster
=================================

If a node was added using the auto-discovery protocol described above, it is automatically removed if it becomes unavailable.  

If you manually added the node using the CloudI API, you can remove it using the API as shown in the example below.

:: 

 curl -X POST -d "['cloud001@cluster1']" http://localhost:6467/cloudi/api/rpc/nodes_remove.erl  


Testing the Cluster Configuration
=================================

Use the CloudI API to show any nodes (other than the current local host) that it is aware of.

::

 curl http://localhost:6467/cloudi/api/rpc/nodes.erl 
