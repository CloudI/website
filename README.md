
Introduction
============

CloudI is an open-source integration cloud that can be deployed publicly or privately. It supports the development of services that can be created in many different programming languages and provides scalability and fault-tolerance.

This tutorial should help you understand the design decisions and implementation steps needed to use CloudI for your own projects. A small real-world application is used for illustration and the full source code for the application is located here in case you want to look at the complete implementation.


Documentation Format
====================
The tutorial uses version 1.3.1 of the `Sphinx Documentation Generator (see http://sphinx-doc.org/)  which uses an enhanced markdown format.  Sphinx supports a variety of output formats that can be generated using the included Makefile.  


Common Operations 
=================
When the base tutorial documentation is modified the following steps should be performed:

1.  make html
2.  make singlehtml

The output for these commands is stored in the _build directory.
