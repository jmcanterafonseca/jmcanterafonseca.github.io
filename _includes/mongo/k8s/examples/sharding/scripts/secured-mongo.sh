#!/bin/bash

set -e

help () {
  echo "usage: secured-mongo.sh [name] [role]"
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
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongo-db-statefulset-$NAME
  labels:
    mongoDB-replica: "true"
    mongoDB-secured: "true"
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
      volumes: 
        - name: initial-secret-volume
          secret:
            secretName: mongo-secret-$NAME
        - name: secret-volume
          emptyDir: {}
      initContainers:
        - name: set-file-permissions
          image: busybox
          env:
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
          command:
            - sh
            - -c
          args:
            - >- 
                 cp /var/init-secrets/tls.keycert /var/secrets/tls.keycert && 
                 chmod 400 /var/secrets/tls.keycert &&
                 chown 999:999 /var/secrets/tls.keycert;
                 export POD_NUMBER=\${POD_NAME##*-} && 
                 cp /var/init-secrets/tls.cluster.\$POD_NUMBER.keycert /var/secrets/tls.cluster.keycert && 
                 chmod 400 /var/secrets/tls.cluster.keycert &&
                 chown 999:999 /var/secrets/tls.cluster.keycert;
          volumeMounts:
            - mountPath: /var/init-secrets
              name: initial-secret-volume
              readOnly: true
            - mountPath: /var/secrets
              name: secret-volume
              readOnly: false
      containers: 
        - name: mongo-db
          image: mongo:4.2.6
          ports: 
            - containerPort: $PORT
              protocol: TCP
          volumeMounts: 
            - mountPath: /data/db
              name: mongo-volume-for-replica-$NAME
            - mountPath: /var/secrets
              name: secret-volume
              readOnly: true
          args: 
            - --verbose
            - --bind_ip_all
            - --replSet
            - \$(REPLICA_SET_NAME)
            - --tlsMode
            - requireTLS
            - --clusterAuthMode 
            - x509
            - --tlsClusterFile
            - /var/secrets/tls.cluster.keycert
            - --tlsCertificateKeyFile
            - /var/secrets/tls.keycert
            - --tlsCAFile
            - /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
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