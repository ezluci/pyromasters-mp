#!/bin/bash

# this script generates the audiosprite.
# run it from the project's root directory!

npx audiosprite ./tools/sounds/* --output ./web/public/assets/audiosprite --format howler --export webm --gap 0