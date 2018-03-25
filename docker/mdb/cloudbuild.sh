#!/bin/sh
gcloud container builds submit --config=cloudbuild.yaml .
