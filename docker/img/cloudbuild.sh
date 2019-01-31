#!/bin/sh
NODE_ENV=staging
DATA1=`cat ../$NODE_ENV/.env`
DATA2=`cat ../$NODE_ENV/.env.webpack`
gcloud builds submit --config=cloudbuild.yaml --substitutions=_DOTENV="$DATA1",_DOTENV_WEBPACK="$DATA2" .
