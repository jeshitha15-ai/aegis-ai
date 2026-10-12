# All records below are synthetic demo data. These tools are read-only.
SAMPLE_LOGS = [
    {"time":"2026-01-12T10:02:00Z","service":"orders-api","level":"ERROR","message":"database connection failed: connection refused"},
    {"time":"2026-01-12T10:02:12Z","service":"orders-api","level":"ERROR","message":"retry budget exceeded while connecting to postgres"},
    {"time":"2026-01-12T10:01:00Z","service":"orders-api","level":"INFO","message":"deployment release-2026.01.12 completed"},
    {"time":"2026-01-12T09:55:00Z","service":"billing-api","level":"INFO","message":"health check passed"},
]
DEPLOYMENTS = [{"time":"2026-01-12T10:01:00Z","service":"orders-api","release":"release-2026.01.12","change":"database host configuration updated","environment":"demo"}]
HEALTH = {
    "orders-api":{"status":"degraded","database_reachable":False,"note":"Synthetic demo health result"},
    "billing-api":{"status":"healthy","database_reachable":True,"note":"Synthetic demo health result"},
}
RUNBOOKS = [
    {"title":"Database connection refused","text":"Check whether the database service is running, whether the configured hostname and port are correct, and whether the application received expected configuration after deployment."},
    {"title":"Errors after deployment","text":"Compare deployment time with the first error. Review changed configuration and release notes. Prefer a reversible approved mitigation and verify recovery with health checks."},
    {"title":"Connection pool exhaustion","text":"Inspect active connections, pool size, query duration, and timeout metrics. Do not increase limits blindly; confirm database capacity."},
]

def search_logs(query: str, service: str = "") -> dict:
    terms = query.lower().split()
    rows = [r for r in SAMPLE_LOGS if (not service or r["service"].lower() == service.lower()) and (not terms or any(t in (r["service"] + " " + r["message"] + " " + r["level"]).lower() for t in terms))]
    return {"count":len(rows),"records":rows[:20],"dataset":"synthetic_demo_logs"}

def get_deployment_events(service: str = "") -> dict:
    rows = [r for r in DEPLOYMENTS if not service or r["service"].lower() == service.lower()]
    return {"count":len(rows),"events":rows,"dataset":"synthetic_demo_deployments"}

def check_service_health(service: str) -> dict:
    return {"service":service, **HEALTH.get(service.lower(), {"status":"unknown","note":"No synthetic health record"})}

def search_runbooks(query: str) -> dict:
    terms = [t for t in query.lower().split() if len(t) > 2]
    scored = []
    for doc in RUNBOOKS:
        text = (doc["title"] + " " + doc["text"]).lower()
        score = sum(1 for term in terms if term in text)
        if score: scored.append((score,doc))
    scored.sort(key=lambda item:item[0], reverse=True)
    return {"results":[{"title":d["title"],"text":d["text"],"score":s} for s,d in scored[:3]],"method":"keyword_baseline_not_embeddings"}

TOOL_DEFINITIONS = [
 {"type":"function","function":{"name":"search_logs","description":"Search synthetic application logs. Optionally filter by service.","parameters":{"type":"object","properties":{"query":{"type":"string"},"service":{"type":"string"}},"required":["query"],"additionalProperties":False}}},
 {"type":"function","function":{"name":"get_deployment_events","description":"Get synthetic deployment events, optionally filtered by service.","parameters":{"type":"object","properties":{"service":{"type":"string"}},"required":[],"additionalProperties":False}}},
 {"type":"function","function":{"name":"check_service_health","description":"Check simulated read-only health for a demo service.","parameters":{"type":"object","properties":{"service":{"type":"string"}},"required":["service"],"additionalProperties":False}}},
 {"type":"function","function":{"name":"search_runbooks","description":"Search the local troubleshooting runbooks.","parameters":{"type":"object","properties":{"query":{"type":"string"}},"required":["query"],"additionalProperties":False}}},
]
TOOL_FUNCTIONS = {"search_logs":search_logs,"get_deployment_events":get_deployment_events,"check_service_health":check_service_health,"search_runbooks":search_runbooks}
ALLOWED_ARGS = {"search_logs":{"query","service"},"get_deployment_events":{"service"},"check_service_health":{"service"},"search_runbooks":{"query"}}
