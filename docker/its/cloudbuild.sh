#!/bin/sh
DATA1=`cat ../staging/.env`
DATA2=`cat ../staging/.env.wevpack`
gcloud builds submit --config=cloudbuild.yaml --substitutions=_DOTENV="$DATA1",_DOTENV_WEBPACK="$DATA2" .
