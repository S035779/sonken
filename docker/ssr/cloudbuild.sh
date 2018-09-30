#!/bin/sh
DATA=`cat ../.env`
gcloud builds submit --config=cloudbuild.yaml --substitutions=_DOTENV="$DATA" .
