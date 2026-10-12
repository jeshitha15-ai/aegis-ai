from app.tools import search_logs, get_deployment_events, check_service_health, search_runbooks

def test_log_search(): assert search_logs("database connection")["count"] >= 1
def test_deployments(): assert get_deployment_events("orders-api")["count"] >= 1
def test_health(): assert check_service_health("orders-api")["status"] == "degraded"
def test_runbooks(): assert search_runbooks("database connection")["results"]
