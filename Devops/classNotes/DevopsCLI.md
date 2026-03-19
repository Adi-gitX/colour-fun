# Docker CLI, Networks and Volumes Lab

## Part 1 — Docker CLI & Container Management

### List images

Command:
```

docker images

```

Output:
```

IMAGE          ID             DISK USAGE
robin:latest   b0eafc52ce26

```

---

### Run nginx container

Command:
```

docker run -d --name my-web -p 8080:80 nginx

```

Output:
```

Unable to find image 'nginx:latest' locally
Pulling from library/nginx
Status: Downloaded newer image
Container started

```

Check container:

```

docker ps

```

Output:
```

CONTAINER ID   IMAGE   STATUS   PORTS   NAMES
a62c3764c7be   nginx   Up       8080->80   my-web

```

---

### View logs

```

docker logs my-web

```

Output:
```

nginx started
worker process started

```

---

### Execute inside container

```

docker exec -it my-web sh

```

Inside container:

```

ls

```

Output:
```

bin boot dev etc home usr var

```

Exit:
```

exit

```

---

### Stop container

```

docker stop my-web

```

Remove container

```

docker rm my-web

```

---

## Part 2 — Docker Networks

### List networks

```

docker network ls

```

Output:
```

bridge
host
none

```

---

### Create network

```

docker network create my-custom-net

```

Output:
```

my-custom-net

```

---

### Run containers in network

```

docker run -d --name app1 --network my-custom-net alpine sleep 3600

```
```

docker run -d --name app2 --network my-custom-net alpine sleep 3600

```

Check:

```

docker ps

```

Output:
```

app1
app2

```

---

### Ping test

```

docker exec app1 ping -c 3 app2

```

Output:
```

64 bytes from app2
64 bytes from app2
64 bytes from app2

```

---

### Cleanup

```

docker rm -f app1 app2
docker network rm my-custom-net

```

---

## Part 3 — Docker Volumes

### Scenario A — Empty Volume

Create volume

```

docker volume create my-empty-vol

```

Run container

```

docker run -d --name nginx-empty-vol -v my-empty-vol:/usr/share/nginx/html nginx

```

Check files

```

docker exec nginx-empty-vol ls -l /usr/share/nginx/html

```

Output:
```

index.html
50x.html

```

Explanation:
Empty volume → files copied from container

Remove

```

docker rm -f nginx-empty-vol

```

---

### Scenario B — Filled Volume

Create volume

```

docker volume create my-filled-vol

```

Fill volume

```

docker run --rm -v my-filled-vol:/target alpine sh -c 'echo "This volume has preexisting data" > /target/hello.txt'

```

Run container

```

docker run -d --name nginx-filled-vol -v my-filled-vol:/usr/share/nginx/html nginx

```

Check files

```

docker exec nginx-filled-vol ls -l /usr/share/nginx/html

```

Output:
```

hello.txt

```

Explanation:
Filled volume hides container files

Cleanup

```

docker rm -f nginx-filled-vol
docker volume rm my-empty-vol my-filled-vol

```

---

## Conclusion

✔ Learned Docker CLI
✔ Learned Container management
✔ Learned Docker Networks
✔ Learned Docker Volumes
✔ Understood empty vs filled volume behavior
```
