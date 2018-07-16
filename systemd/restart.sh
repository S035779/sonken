#!/bin/sh
systemctl daemon-reload
systemctl restart sonken1.service
systemctl restart sonken2.service
systemctl restart sonken3.service
systemctl restart nginx.service
