#!/bin/sh

# This script is used to prepare the extracted apk from AhMyth-Client

if [ ! -f ./package.json ] || [ ! -d ../AhMyth-Client ] || [ ! -f ../Dockerfile.android ]; then
    echo "You have to run this script from the top level directory of AhMyth-Server"
    exit 1
fi

docker build -o ./extracted_apk/ -f ../Dockerfile.android ../
