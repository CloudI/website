****************
Java Integration
****************

.. index::
 single: Java 

There are several Java utility classes that need to be revised to run within the CloudI environment and to call the MySQL Database Adapter service rather than calling the MySQL database directly.

Integrating a Java Application with CloudI
==========================================
The general steps for adding a Java application to Cloudi are:

1.  Create a new class named *Main* that will initialize the CloudI API
2.  Create a new class named *Task* that subscribes to various Cloudi requests and delegates the processing of these requests to different Java methods.
3.  Create a JAR file that contains the different Java classes.
4.  Add the JAR file to the CloudI configuration.
5.  Test the application.

Each of these steps are described in more detail below.

.. index::
 single: Main.java 

Main.java Class
---------------
A new file named *Main.java* will be created with the following contents.

::

  import org.cloudi.API;

  public class Main {
    public static void main(String[] args) {
        try {
            final int thread_count = API.thread_count();
            assert (thread_count == 1);
            Task t = new Task(0);
            t.run();
        } catch (API.InvalidInputException e) {
            e.printStackTrace(API.err);
        }
    }
  }

This code is used to initialize the Java class and to create and run a new instance of the *Task* class.
 
.. index::
 single: Task.java 

Task.java Class
---------------
A new file named *Task.java* will be created with the following contents.

::

  import com.ericsson.otp.erlang.OtpErlangPid;
  import java.io.UnsupportedEncodingException;
  import org.cloudi.API;
  import javax.xml.parsers.SAXParser;
  import javax.xml.parsers.SAXParserFactory;


  public class Task {
    private API api;

    public Task(final int thread_index) {
        try {
            this.api = new API(thread_index);
        } catch (API.InvalidInputException e) {
            e.printStackTrace(API.err);
            System.exit(1);
        } catch (API.MessageDecodingException e) {j
            e.printStackTrace(API.err);
            System.exit(1);
        } catch (API.TerminateException e) {
            System.exit(1);
        }
    }

    
    public void run() {
        
        try {            
        
            // subscribe to different CloudI services     
            this.api.subscribe("load_catalog/get", this, "startLoadCatalog");
            this.api.subscribe("generate_ratings/get", this, "startGenerateRatings");
            this.api.subscribe("load_predictions/get", this, "startLoadPredictions");
            
            // accept service requests
            this.api.poll();
            
        } catch (API.TerminateException e) {
            API.err.println("Book Utilities TerminateException caught " + e.getMessage());            
        } catch (Exception e) {
            API.err.println("Book Utilities Exception caught " + e.getMessage());            
        }
    }
   

The code listed above creates a new instance of the *Task* class and then subscribes to various service requests.  For example, the following code is used to tell CloudI that when the *load_catalog/get* request is received, the *startLoadCatalog* Java method will be executed. 

::

   this.api.subscribe("load_catalog/get", this, "startLoadCatalog");


An example of the *startLoadCatalog* method is shown below.

::

   /**
     * This method calls the RecommendationData class 
     */
    public Object startGenerateRatings(Integer command, String name, String pattern,
                               byte[] request_info, byte[] request,
                               Integer timeout, Byte priority, byte[] trans_id,
                               OtpErlangPid pid) {

        API.out.println("startGenerateRatings starts");

        // create a new instance of the RecommendationData class 
        RecommendationData recommendationData = new RecommendationData();
        recommendationData.setCloudIAPI(api);
        recommendationData.generateItemRatings();

        API.out.println("startGenerateRatings ends");
        return ("startGenerateRatings ends".getBytes());
    }


Calling the MySQL Database Adapter Service
==========================================
The legacy Java code will be modified to call the MySQL Database Adapter service rather than using the JDBC protocol to interact with the database directly.  The following code shows an example.

:: 

  byte[] service_request =
                ("SELECT max(download_quantity) FROM items").getBytes();

  org.cloudi.API.Response response =
                api.send_sync("/db/mysql/book", service_request);


Parsing the Response
====================
The exact format of the response will vary depending on the service that is executed.  In this example, the response consists of several binary characters followed by *[6974]* where 6974 happens to be the value returned.

:: 

  String response_string = new String(response.response, "UTF-8");

  // process results
  String[] tokens = response_string.split(startDelimiter);

  for (int i = 0; i < tokens.length; ++i) {
      
      // parse the max download value
      int end = tokens[i].indexOf("]");
      if (end > 0) {
        maxDownloads = new Double(tokens[i].substring(0, end));
      }
  }

.. index::
 single: JAR File

.. _jar_file_reference:

Creating the JAR File
=====================
All of the different Java classes that are used by the application need to be added to a JAR file.  Note that this JAR file can be created by hand, but is generally produced by a Java Development Environment.

.. note::
  The JAR **must** contain a *manifest* file that contains both the fully qualified main class and also the full path to the *cloudi.jar* file.  An example of the manifest contents are shown below.

::

  Manifest-Version: 1.0
  Class-Path: /usr/local/lib/cloudi-1.4.0/api/java/cloudi.jar
  Main-Class: com.impactsoftware.bookutilities.Main


Adding the Java Application to CloudI
=====================================
Adding the Java application to Cloudi can be done either at runtime by calling the CloudI API or by adding the configuration information to the *cloudi.conf* file.  A script to call the runtime API is shown below.

::

  #!/bin/sh
  curl -X POST -d @BookUtilities.conf http://localhost:6464/cloudi/api/rpc/services_add.erl

The *BookUtilities.conf* file referenced in the script above looks like this:

:: 

 [
 {external,
                "/book/utility/",
                "/opt/java/jdk1.7.0_05/bin/java",
                "-cp /usr/local/lib/cloudi-1.4.0/api/java/ "
                "-ea:org.cloudi... -jar /home/bruce/Projects/BookUtilities/BookUtilities/deploy/BookUtilities.jar",
                [],
                lazy_closest, tcp, default,
                50000, 50000, 50000, undefined, undefined, 1, 1, 5, 300, [] } 
 ]
 

.. note::
 If you use a standalong configuration file, a starting bracket symbol *[* and ending bracket symbol *]* need to be wrapped around the configuration text.  If you embed the configuration in the *cloudi.conf* file then the starting and ending brackets are not needed. 

Running the Java Application
============================
Once the Java application has been added to the CloudI environment, it can be executed using several different methods.  An example of using an HTTP request to launch the application is shown below.

::

 curl http://localhost:6464/book/utility/generate_ratings

.. note::

  Note that the first part of the request (e.g., *book/utility*) is defined in the configuration file described in the previous section.  The second part (e.g., *generate_ratings*) was specfied in the *Task.java* class in the CloudI API *subscribe* method.


Complete Source
===============
The complete source is located on GitHub `here <https://github.com/brucekissinger/book_recommendation>`_  in the **java** folder.
