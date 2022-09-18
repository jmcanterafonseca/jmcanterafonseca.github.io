#!/bin/bash

set -e

help () {
  echo "usage: bootstrap-mongo.sh [name] [role]"
}

if [ $#  -lt 1 ]; then
  echo "Illegal number of parameters"
  help
  exit 1
fi

NAME=$1
ROLE_PARAM=$2
ROLE=

if [ "$ROLE_PARAM" != "configsvr" ] && [ "$ROLE_PARAM" != "shardsvr" ]; then 
  echo "role must be 'configsvr' or 'shardsvr'"
  help
  exit 1
fi

if [ ! -z "$ROLE_PARAM" ]; 
then ROLE="--$ROLE_PARAM"; 
fi

PORT=27017

if [ $ROLE_PARAM == "configsvr" ];
then PORT=27019;
fi

if [ $ROLE_PARAM == "shardsvr" ];
then PORT=27018;
fi

cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: mongo-config-$NAME
  namespace: sharding
  annotations:
    tls-values: "disabled, allowTLS, preferTLS, requireTLS"
data:
  REPLICA_SET_NAME: replica-blog-$NAME
  TLS: requireTLS
EOF

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
      port: $PORT
      targetPort: $PORT
  clusterIP: None
EOF

cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongo-db-statefulset-$NAME
  labels:
    mongoDB-replica: "true"
    mongoDB-secured: "false"
    mongoDB-sharding: "true"
  annotations: 
    author: JMCF
  namespace: sharding
spec: 
  selector: 
    matchLabels:
      app: mongoDB-replica-$NAME
  serviceName: mongo-db-replica-$NAME
  replicas: 3
  template:
    metadata: 
      labels: 
        app: mongoDB-replica-$NAME
    spec: 
      terminationGracePeriodSeconds: 10
      containers: 
        - name: mongo-db
          image: mongo:4.2.6
          ports: 
            - containerPort: 27017
              protocol: TCP
          volumeMounts: 
            - mountPath: /data/db
              name: mongo-volume-for-replica-$NAME            
          args: 
            - --replSet
            - \$(REPLICA_SET_NAME)
            - $ROLE
          terminationMessagePath: /dev/termination-log
          terminationMessagePolicy: File
          imagePullPolicy: IfNotPresent
          envFrom: 
            - configMapRef:
                name: mongo-config-$NAME
  volumeClaimTemplates: 
    - metadata: 
        name: mongo-volume-for-replica-$NAME
      spec: 
        accessModes: 
          - ReadWriteOnce
        resources: 
          requests: 
            storage: 200Mi
EOF
