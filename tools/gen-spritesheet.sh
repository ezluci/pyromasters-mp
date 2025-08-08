#!/bin/bash

# clone spright from https://github.com/houmain/spright into
#   tools/ directory, then build it.

# this script generates the spritesheet.
# run it from the project's root directory!

cd tools
./spright/bin/spright --input ./spright.conf --path ../web/public/assets/images/animations