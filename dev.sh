#!/bin/bash

dfx identity use default

dfx stop

dfx start --clean --background

AZLE_AUTORELOAD=0 dfx deploy 

npm start