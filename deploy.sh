docker build -t mituso/multi-client:latest -t mituso/multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t mituso/multi-server:latest -t mituso/multi-server:$SHA -f ./clserverient/Dockerfile ./server
docker build -t mituso/multi-worker:latest -t mituso/multi-worker:$SHA -f ./worker/Dockerfile ./worker

docker push mituso/multi-client:latest
docker push mituso/multi-server:latest
docker push mituso/multi-worker:latest

docker push mituso/multi-client:$SHA
docker push mituso/multi-server:$SHA
docker push mituso/multi-worker:$SHA


kubectl apply -f k8s

kubectl set image deployments/server-deployment server=mituso/multi-server
