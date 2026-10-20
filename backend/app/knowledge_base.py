KNOWLEDGE_BASE = [
    {
        "title": "Database Connection Timeout",
        "keywords": ["database", "postgresql", "connection", "timeout"],
        "cause": "Incorrect database configuration or network issues.",
        "solution": "Verify database hostname, port, credentials, and network access."
    },
    {
        "title": "High CPU Usage",
        "keywords": ["cpu", "performance", "slow", "processing"],
        "cause": "Expensive queries or resource-intensive processes.",
        "solution": "Review CPU metrics, application logs, and slow queries."
    },
    {
        "title": "API Service Unavailable",
        "keywords": ["api", "503", "unavailable", "service"],
        "cause": "Service crashes or unavailable dependencies.",
        "solution": "Check API health, logs, and service dependencies."
    },
    {
        "title": "Memory Usage Spike",
        "keywords": ["memory", "spike", "leak", "caching"],
        "cause": "Memory leaks or excessive caching.",
        "solution": "Inspect memory metrics, logs, and recent code changes."
    }
]


def search_knowledge_base(query: str):
    query = query.lower()

    results = []

    for article in KNOWLEDGE_BASE:
        if any(keyword in query for keyword in article["keywords"]):
            results.append(article)

    return results