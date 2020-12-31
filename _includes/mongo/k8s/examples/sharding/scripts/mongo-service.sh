#!/bin/bash

set -e

help () {
  echo "usage: mongo-service.sh [name]"
}

if [ $#  -lt 1 ]; then
  echo "Illegal number of parameters"
  help
  exit 1
fi

NAME=$1

cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata: 
  name: mongo-db-replica-$NAME
  namespace: sharding
spec: 
  selector: 
    app: mongoDB-replica-$NAME
  ports:
    - protocol: TCP
      port: 27017
      targetPort: 27017
  clusterIP: None
EOF
