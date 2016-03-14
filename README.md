# Qless UI

An AngularJS webinterface for qless using qless-pyapi.


## Build

```
npm install
```


## Run Development Server

```
npm start
```

Now browse to the app at `http://localhost:8000/app/index.html`.


## Deployment

Copy all files under the `app/` directory to your webroot.

Setup `/api` as proxy to qless-pyapi instance.

### Sample Nginx Config

```
server {
    listen 80 default_server;
    listen [::]:80 default_server ipv6only=on;
    server_name localhost;
    
    root /path/to/qless-ui/app;
    index index.html;

    # qless-pyapi
    location /api {
        rewrite ^/api(.*)$ $1 break;
        proxy_pass http://127.0.0.1:4000;
    }
}
```
