$projectRoot = $PSScriptRoot
$jdk21 = "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"
$mavenBin = "$projectRoot\tools\apache-maven-3.9.9\bin"
$trustStore = "$projectRoot\tools\certs\cacerts"

$env:JAVA_HOME = $jdk21
$env:Path = "$jdk21\bin;$mavenBin;$env:Path"

if (Test-Path $trustStore) {
    $env:MAVEN_OPTS = "-Djavax.net.ssl.trustStore=`"$trustStore`" -Djavax.net.ssl.trustStorePassword=changeit"
}

mvn -version

