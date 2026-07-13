Set-Location "$PSScriptRoot\backend"
$jdk21 = "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"
if (Test-Path $jdk21) {
    $env:JAVA_HOME = $jdk21
    $env:Path = "$env:JAVA_HOME\bin;$env:Path"
} else {
    $jdk19 = "C:\Program Files\Java\jdk-19"
    if (Test-Path $jdk19) {
        $env:JAVA_HOME = $jdk19
        $env:Path = "$env:JAVA_HOME\bin;$env:Path"
    }
}
$trustStore = "$PSScriptRoot\tools\certs\cacerts"
if (Test-Path $trustStore) {
    $env:MAVEN_OPTS = "-Djavax.net.ssl.trustStore=`"$trustStore`" -Djavax.net.ssl.trustStorePassword=changeit"
}
& "$PSScriptRoot\tools\apache-maven-3.9.9\bin\mvn.cmd" clean package
