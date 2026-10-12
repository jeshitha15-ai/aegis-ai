from pydantic import BaseModel, Field

class InvestigationRequest(BaseModel):
    description: str = Field(min_length=8, max_length=4000)
    logs: str = Field(default="", max_length=12000)

class InvestigationResponse(BaseModel):
    id: int
    summary: str
    likely_cause: str
    confidence: str
    recommended_steps: list[str]
    evidence: list[dict]
    tool_trace: list[dict]
    limitations: list[str]
