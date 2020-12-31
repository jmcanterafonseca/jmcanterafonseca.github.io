#!/bin/bash

set -e

help () {
  echo "usage: gen-cert.sh [name] [DN] [config]"
}

if [ $#  -lt 2 ]; then
  echo "Illegal number of parameters"
  help
  exit 1
fi

NAME=$1
DN=$2
CONFIG_PARAM=$3
CONFIG=


# Create Private Key 
openssl genrsa -out $NAME.key.pem 2048

if [ ! -z "$CONFIG_PARAM" ]; 
then CONFIG=" -config $CONFIG_PARAM"; 
fi

echo $CONFIG

# Create CSR 
openssl req -new -out $NAME.csr -key $NAME.key.pem -subj $DN $CONFIG

CSR_BASE64=$(cat $NAME.csr | base64 | tr -d "\n")

echo $CSR_BASE64

# Create K8s CSR manifest
cat <<EOF | kubectl apply -f -
apiVersion: certificates.k8s.io/v1beta1
kind: CertificateSigningRequest
metadata:
  name: $NAME-csr
spec:
  request: $CSR_BASE64
EOF

# Approve K8s CSR
kubectl certificate approve $NAME-csr

# Retrieve certificate
kubectl get csr/$NAME-csr -o jsonpath='{.status.certificate}{"\n"}' | base64 -d > $NAME.crt

# Concatenate key and certificate
cat $NAME.key.pem $NAME.crt > $NAME.keycert
