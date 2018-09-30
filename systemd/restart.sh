#!/bin/sh
systemctl daemon-reload
systemctl restart sonken1.service
systemctl restart sonken2.service
systemctl restart sonken3.service
systemctl restart sonken4.service
systemctl restart sonken5.service
systemctl restart sonken6.service
systemctl restart nginx.service
