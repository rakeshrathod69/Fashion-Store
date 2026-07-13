@echo off
pushd "%~dp0.."
set "PROJECT_ROOT=%CD%"
popd
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"
set "PATH=%JAVA_HOME%\bin;%PROJECT_ROOT%\tools\apache-maven-3.9.9\bin;%PATH%"
set "MAVEN_OPTS=-Djavax.net.ssl.trustStore="%PROJECT_ROOT%\tools\certs\cacerts" -Djavax.net.ssl.trustStorePassword=changeit"
"%PROJECT_ROOT%\tools\apache-maven-3.9.9\bin\mvn.cmd" %*
