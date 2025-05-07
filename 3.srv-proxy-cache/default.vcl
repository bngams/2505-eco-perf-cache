vcl 4.1;

backend default {
    .host = "141.95.149.158";
    .port = "3000";
}

sub vcl_recv {
    # if (req.http.host == "next.app" || req.http.host == "www.next.app") {
    #     set req.backend_hint = default;
    # }
    if (req.http.method == "GET") {
        set req.backend_hint = default;
    }
}

sub vcl_backend_response {
    # all requests in cache 
    set beresp.ttl = 5m;

    # do not cache specific part... 
    # if(req.url ~ "/api") {
    #  return (pass)     
    # }  
} 