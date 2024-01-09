# This script is used to prepare the extracted apk from AhMyth-Client

if ((Test-Path -Path ./package.json -PathType Leaf) -eq $false -or (Test-Path -Path ../AhMyth-Client -PathType Container) -eq $false -or (Test-Path -Path ../Dockerfile.android -PathType Leaf) -eq $false) {
    Write-Host "You have to run this script from the top level directory of AhMyth-Server"
    exit 1
}

docker build -o ./extracted_apk/ -f ../Dockerfile.android ../