#!/bin/bash

cwd=$(dirname $0)

az bicep build -f "$cwd/basic/main.bicep" --stdout > "$cwd/basic/main.json"