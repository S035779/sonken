#!/bin/sh
DATA=`cat ../staging/.env`
gcloud builds submit --config=cloudbuild.yaml --substitutions=_DOTENV="$DATA" .
